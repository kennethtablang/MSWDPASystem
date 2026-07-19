using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Common.Interfaces;
using MSWDPASystem.Server.Domain.Entities;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Controllers;

/// <summary>
/// Walk-in assisted service: a staff member transacting at the office for a client
/// who cannot use the system themselves, and releases collected by an authorised
/// representative on the client's behalf.
/// </summary>
[ApiController]
[Route("api/assisted-service")]
[Authorize(Roles = "Admin,MSWDStaff,HeadCoordinator")]
public class AssistedServiceController(
    ApplicationDbContext db,
    ICurrentUserService currentUser) : ControllerBase
{
    /// <summary>Assisted-service history for one beneficiary.</summary>
    [HttpGet("beneficiary/{beneficiaryId:guid}")]
    public async Task<IActionResult> GetForBeneficiary(Guid beneficiaryId, CancellationToken ct)
    {
        var records = await db.AssistedTransactions.AsNoTracking()
            .Where(t => t.BeneficiaryId == beneficiaryId)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new
            {
                t.Id,
                serviceType = t.ServiceType.ToString(),
                reason = t.Reason.ToString(),
                t.ReasonNotes,
                t.BeneficiaryPresent,
                t.RepresentativeName,
                t.RepresentativeRelation,
                t.RepresentativeIdType,
                t.RepresentativeIdNumber,
                t.Acknowledged,
                assistedBy = t.AssistedByUserName,
                t.RelatedEntityType,
                t.RelatedEntityId,
                t.Notes,
                t.CreatedAt,
            })
            .ToListAsync(ct);

        return Ok(records);
    }

    /// <summary>
    /// Record an assisted transaction. Called alongside the action itself — the
    /// caller has already registered the client or filed the request, and this
    /// captures the circumstances under which that was done.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "MSWDStaff,Admin")]
    public async Task<IActionResult> Create([FromBody] CreateAssistedTransactionRequest body, CancellationToken ct)
    {
        var beneficiary = await db.Beneficiaries
            .FirstOrDefaultAsync(b => b.Id == body.BeneficiaryId, ct);
        if (beneficiary is null)
            return NotFound(new { message = "Beneficiary not found." });

        // If the client did not appear, somebody must be named as having appeared
        // in their place — otherwise there is no record of who was actually served.
        if (!body.BeneficiaryPresent && string.IsNullOrWhiteSpace(body.RepresentativeName))
            return BadRequest(new
            {
                message = "Name the authorised representative who appeared, "
                        + "or mark the beneficiary as present.",
            });

        if (body.RepresentativeBeneficiaryId is Guid repId)
        {
            var repExists = await db.Beneficiaries.AnyAsync(b => b.Id == repId, ct);
            if (!repExists)
                return BadRequest(new { message = "The selected representative record was not found." });
        }

        var record = new AssistedTransaction
        {
            BeneficiaryId = body.BeneficiaryId,
            AssistedByUserId = currentUser.UserId,
            AssistedByUserName = currentUser.UserName,
            ServiceType = body.ServiceType,
            Reason = body.Reason,
            ReasonNotes = body.ReasonNotes,
            BeneficiaryPresent = body.BeneficiaryPresent,
            RepresentativeName = body.RepresentativeName,
            RepresentativeRelation = body.RepresentativeRelation,
            RepresentativeBeneficiaryId = body.RepresentativeBeneficiaryId,
            RepresentativeIdType = body.RepresentativeIdType,
            RepresentativeIdNumber = body.RepresentativeIdNumber,
            Acknowledged = body.Acknowledged,
            RelatedEntityType = body.RelatedEntityType,
            RelatedEntityId = body.RelatedEntityId,
            Notes = body.Notes,
        };

        db.AssistedTransactions.Add(record);

        // Mirror the flag onto the request so assisted cases are filterable and
        // show on the request itself without a join.
        if (body.RelatedEntityType == "AssistanceRequest"
            && Guid.TryParse(body.RelatedEntityId, out var requestId))
        {
            var request = await db.AssistanceRequests.FirstOrDefaultAsync(r => r.Id == requestId, ct);
            if (request is not null)
            {
                request.IsAssisted = true;
                request.AssistedReason = body.Reason;
                if (!body.BeneficiaryPresent)
                {
                    request.ReleasedToName = body.RepresentativeName;
                    request.ReleasedToRelation = body.RepresentativeRelation;
                }
            }
        }

        var who = body.BeneficiaryPresent
            ? beneficiary.FullName
            : $"{body.RepresentativeName} ({body.RepresentativeRelation}) on behalf of {beneficiary.FullName}";

        db.AuditLogs.Add(new AuditLog
        {
            UserId = currentUser.UserId,
            UserName = currentUser.UserName,
            Action = AuditAction.Create,
            EntityType = "AssistedTransaction",
            EntityId = record.Id.ToString(),
            Description =
                $"Assisted {body.ServiceType} for {beneficiary.ClientNumber} — served {who}. "
                + $"Reason: {body.Reason}. {body.Notes}".Trim(),
            Timestamp = DateTime.UtcNow,
        });

        await db.SaveChangesAsync(ct);

        return Ok(new { id = record.Id, message = "Assisted service recorded." });
    }

    /// <summary>
    /// Candidate representatives for a beneficiary: their declared relatives, so
    /// staff can pick the grandchild who normally collects rather than retyping
    /// the details each visit.
    /// </summary>
    [HttpGet("beneficiary/{beneficiaryId:guid}/representatives")]
    public async Task<IActionResult> GetRepresentativeCandidates(Guid beneficiaryId, CancellationToken ct)
    {
        var candidates = await db.BeneficiaryRelationships.AsNoTracking()
            .Where(r => r.BeneficiaryId == beneficiaryId
                        && r.Relative.Status != BeneficiaryStatus.Inactive)
            .Select(r => new
            {
                beneficiaryId = r.RelativeId,
                clientNumber = r.Relative.ClientNumber,
                fullName = r.Relative.FirstName + " " + r.Relative.LastName,
                relation = r.Type.ToString(),
                contactNumber = r.Relative.ContactNumber,
            })
            .ToListAsync(ct);

        return Ok(candidates);
    }
}

public record CreateAssistedTransactionRequest(
    Guid BeneficiaryId,
    AssistedServiceType ServiceType,
    AssistanceReason Reason,
    string? ReasonNotes,
    bool BeneficiaryPresent,
    string? RepresentativeName,
    string? RepresentativeRelation,
    Guid? RepresentativeBeneficiaryId,
    string? RepresentativeIdType,
    string? RepresentativeIdNumber,
    bool Acknowledged,
    string? RelatedEntityType,
    string? RelatedEntityId,
    string? Notes
);
