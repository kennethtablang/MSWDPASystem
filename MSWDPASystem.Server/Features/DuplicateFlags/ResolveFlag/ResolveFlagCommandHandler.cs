using MediatR;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Common.Exceptions;
using MSWDPASystem.Server.Common.Interfaces;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.DuplicateFlags.ResolveFlag;

public class ResolveFlagCommandHandler(ApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<ResolveFlagCommand, Result>
{
    public async Task<Result> Handle(ResolveFlagCommand request, CancellationToken ct)
    {
        if (request.Resolution == DuplicateFlagStatus.Pending)
            return Result.Failure("Resolution must be Confirmed or Rejected.");

        var flag = await db.DuplicateFlags
            .Include(f => f.DuplicateBeneficiary)
            .FirstOrDefaultAsync(f => f.Id == request.Id, ct)
            ?? throw new NotFoundException("Duplicate flag not found.");

        flag.Status = request.Resolution;
        flag.ResolutionNotes = request.Notes;
        flag.ResolvedAt = DateTime.UtcNow;
        flag.ResolvedByUserId = currentUser.UserId;

        if (request.Resolution == DuplicateFlagStatus.Confirmed)
        {
            flag.DuplicateBeneficiary.Status = BeneficiaryStatus.Inactive;
        }
        else
        {
            var hasPendingFlags = await db.DuplicateFlags
                .AnyAsync(f => f.Id != flag.Id &&
                    (f.OriginalBeneficiaryId == flag.DuplicateBeneficiaryId ||
                     f.DuplicateBeneficiaryId == flag.DuplicateBeneficiaryId) &&
                    f.Status == DuplicateFlagStatus.Pending, ct);

            if (!hasPendingFlags)
                flag.DuplicateBeneficiary.Status = BeneficiaryStatus.Active;
        }

        db.AuditLogs.Add(new Domain.Entities.AuditLog
        {
            UserId = currentUser.UserId,
            UserName = currentUser.UserName,
            Action = AuditAction.DuplicateResolution,
            EntityType = "DuplicateFlag",
            EntityId = flag.Id.ToString(),
            Description = $"Flag resolved as {request.Resolution}. {request.Notes}",
            Timestamp = DateTime.UtcNow
        });

        await db.SaveChangesAsync(ct);
        return Result.Success();
    }
}
