using MediatR;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Common.Exceptions;
using MSWDPASystem.Server.Common.Interfaces;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Domain.Entities;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.DuplicateFlags.MergeDuplicate;

/// <summary>
/// FR-3.6 merge. Everything attached to the losing record is reassigned to the
/// surviving one so no assistance history is stranded on a record nobody looks at
/// again; the losing record is then retired as Inactive rather than deleted, which
/// keeps its client number resolvable if it appears on an old printed claim slip.
/// </summary>
public class MergeDuplicateCommandHandler(
    ApplicationDbContext db,
    ICurrentUserService currentUser)
    : IRequestHandler<MergeDuplicateCommand, Result<MergeDuplicateResponse>>
{
    public async Task<Result<MergeDuplicateResponse>> Handle(MergeDuplicateCommand request, CancellationToken ct)
    {
        var flag = await db.DuplicateFlags
            .Include(f => f.OriginalBeneficiary)
            .Include(f => f.DuplicateBeneficiary)
            .FirstOrDefaultAsync(f => f.Id == request.Id, ct)
            ?? throw new NotFoundException("Duplicate flag not found.");

        if (flag.Status != DuplicateFlagStatus.Pending)
            return Result<MergeDuplicateResponse>.Failure("This flag has already been resolved.");

        if (request.KeepBeneficiaryId != flag.OriginalBeneficiaryId &&
            request.KeepBeneficiaryId != flag.DuplicateBeneficiaryId)
            return Result<MergeDuplicateResponse>.Failure(
                "The record to keep must be one of the two records in this flag.");

        var keep = request.KeepBeneficiaryId == flag.OriginalBeneficiaryId
            ? flag.OriginalBeneficiary
            : flag.DuplicateBeneficiary;
        var merge = request.KeepBeneficiaryId == flag.OriginalBeneficiaryId
            ? flag.DuplicateBeneficiary
            : flag.OriginalBeneficiary;

        // A single transaction: a half-applied merge would leave assistance
        // history split across two records with no way to tell which is current.
        await using var tx = await db.Database.BeginTransactionAsync(ct);

        var movedRequests = await db.AssistanceRequests
            .Where(r => r.BeneficiaryId == merge.Id)
            .ExecuteUpdateAsync(s => s.SetProperty(r => r.BeneficiaryId, keep.Id), ct);

        var movedDocuments = await db.Documents
            .Where(d => d.BeneficiaryId == merge.Id)
            .ExecuteUpdateAsync(s => s.SetProperty(d => d.BeneficiaryId, keep.Id), ct);

        var movedScanLogs = await db.QrScanLogs
            .Where(l => l.BeneficiaryId == merge.Id)
            .ExecuteUpdateAsync(s => s.SetProperty(l => l.BeneficiaryId, keep.Id), ct);

        // Programs are a composite-key join, so a straight reassignment would
        // collide wherever both records carry the same enrolment.
        var keepProgramIds = await db.BeneficiaryPrograms
            .Where(bp => bp.BeneficiaryId == keep.Id)
            .Select(bp => bp.WelfareProgramId)
            .ToListAsync(ct);

        var mergeEnrolments = await db.BeneficiaryPrograms
            .Where(bp => bp.BeneficiaryId == merge.Id)
            .ToListAsync(ct);

        var movedPrograms = 0;
        foreach (var enrolment in mergeEnrolments)
        {
            if (!keepProgramIds.Contains(enrolment.WelfareProgramId))
            {
                db.BeneficiaryPrograms.Add(new BeneficiaryProgram
                {
                    BeneficiaryId = keep.Id,
                    WelfareProgramId = enrolment.WelfareProgramId,
                    EnrollmentDate = enrolment.EnrollmentDate,
                    IsActive = enrolment.IsActive,
                    Notes = enrolment.Notes,
                });
                movedPrograms++;
            }
            db.BeneficiaryPrograms.Remove(enrolment);
        }

        // Assisted-service records are audit evidence under RA 10173 — they must
        // follow the person, whether they appeared as the client or as someone
        // else's authorised representative.
        await db.AssistedTransactions
            .Where(t => t.BeneficiaryId == merge.Id)
            .ExecuteUpdateAsync(s => s.SetProperty(t => t.BeneficiaryId, keep.Id), ct);
        await db.AssistedTransactions
            .Where(t => t.RepresentativeBeneficiaryId == merge.Id)
            .ExecuteUpdateAsync(s => s.SetProperty(t => t.RepresentativeBeneficiaryId, (Guid?)keep.Id), ct);

        // Family links: an edge between the two records would become a self-loop
        // after the merge, and an edge both records declared to the same relative
        // would collide on the unique (BeneficiaryId, RelativeId) pair — drop
        // those, reassign the rest.
        var mergeEdges = await db.BeneficiaryRelationships
            .Where(r => r.BeneficiaryId == merge.Id || r.RelativeId == merge.Id)
            .ToListAsync(ct);
        var keepPairs = (await db.BeneficiaryRelationships
                .Where(r => r.BeneficiaryId == keep.Id || r.RelativeId == keep.Id)
                .Select(r => new { r.BeneficiaryId, r.RelativeId })
                .ToListAsync(ct))
            .Select(p => (p.BeneficiaryId, p.RelativeId))
            .ToHashSet();

        foreach (var edge in mergeEdges)
        {
            var from = edge.BeneficiaryId == merge.Id ? keep.Id : edge.BeneficiaryId;
            var to = edge.RelativeId == merge.Id ? keep.Id : edge.RelativeId;
            if (from == to || keepPairs.Contains((from, to)))
            {
                db.BeneficiaryRelationships.Remove(edge);
                continue;
            }
            edge.BeneficiaryId = from;
            edge.RelativeId = to;
            keepPairs.Add((from, to));
        }

        // Carry over a citizen portal account, but never detach one the surviving
        // record already has — that would silently lock a citizen out of their data.
        var movedCitizenLink = false;
        var linkedUsers = await db.Users.Where(u => u.LinkedBeneficiaryId == merge.Id).ToListAsync(ct);
        if (linkedUsers.Count > 0)
        {
            var keepAlreadyLinked = await db.Users.AnyAsync(u => u.LinkedBeneficiaryId == keep.Id, ct);
            foreach (var linked in linkedUsers)
                linked.LinkedBeneficiaryId = keepAlreadyLinked ? null : keep.Id;
            movedCitizenLink = !keepAlreadyLinked;
        }

        // Fill gaps on the surviving record from the one being retired; never
        // overwrite a value the kept record already has.
        keep.ContactNumber ??= merge.ContactNumber;
        keep.EmailAddress ??= merge.EmailAddress;
        keep.Occupation ??= merge.Occupation;
        keep.MonthlyIncome ??= merge.MonthlyIncome;
        keep.SignatureFilePath ??= merge.SignatureFilePath;
        keep.HouseholdId ??= merge.HouseholdId;
        keep.UpdatedByUserId = currentUser.UserId;

        merge.Status = BeneficiaryStatus.Inactive;
        merge.HouseholdId = null;
        merge.UpdatedByUserId = currentUser.UserId;

        flag.Status = DuplicateFlagStatus.Confirmed;
        flag.ResolvedAt = DateTime.UtcNow;
        flag.ResolvedByUserId = currentUser.UserId;
        flag.ResolutionNotes =
            $"Merged {merge.ClientNumber} into {keep.ClientNumber}. {request.Notes}".Trim();

        // Any other pending flag between these two records is settled by this merge.
        var relatedFlags = await db.DuplicateFlags
            .Where(f => f.Id != flag.Id && f.Status == DuplicateFlagStatus.Pending &&
                        (f.OriginalBeneficiaryId == merge.Id || f.DuplicateBeneficiaryId == merge.Id))
            .ToListAsync(ct);
        foreach (var related in relatedFlags)
        {
            related.Status = DuplicateFlagStatus.Confirmed;
            related.ResolvedAt = DateTime.UtcNow;
            related.ResolvedByUserId = currentUser.UserId;
            related.ResolutionNotes = $"Closed automatically — {merge.ClientNumber} was merged into {keep.ClientNumber}.";
        }

        db.AuditLogs.Add(new AuditLog
        {
            UserId = currentUser.UserId,
            UserName = currentUser.UserName,
            Action = AuditAction.DuplicateResolution,
            EntityType = "Beneficiary",
            EntityId = keep.Id.ToString(),
            Description =
                $"Merged beneficiary {merge.ClientNumber} ({merge.FullName}) into {keep.ClientNumber} ({keep.FullName}): " +
                $"{movedRequests} request(s), {movedDocuments} document(s), {movedScanLogs} scan log(s), " +
                $"{movedPrograms} program enrolment(s) reassigned. {request.Notes}".Trim(),
            Timestamp = DateTime.UtcNow
        });

        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);

        return Result<MergeDuplicateResponse>.Success(new MergeDuplicateResponse(
            keep.Id, keep.ClientNumber,
            merge.Id, merge.ClientNumber,
            movedRequests, movedDocuments, movedScanLogs, movedPrograms, movedCitizenLink));
    }
}
