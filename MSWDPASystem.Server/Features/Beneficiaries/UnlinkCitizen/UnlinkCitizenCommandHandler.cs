using MediatR;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Common.Interfaces;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Domain.Entities;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Beneficiaries.UnlinkCitizen;

public class UnlinkCitizenCommandHandler(
    ApplicationDbContext db,
    ICurrentUserService currentUser)
    : IRequestHandler<UnlinkCitizenCommand, Result>
{
    public async Task<Result> Handle(UnlinkCitizenCommand request, CancellationToken ct)
    {
        var beneficiary = await db.Beneficiaries.FirstOrDefaultAsync(b => b.Id == request.BeneficiaryId, ct);
        if (beneficiary == null)
            return Result.Failure("Beneficiary not found.");

        var user = await db.Users.FirstOrDefaultAsync(u => u.LinkedBeneficiaryId == beneficiary.Id, ct);
        if (user == null)
            return Result.Failure("No citizen account is linked to this beneficiary.");

        user.LinkedBeneficiaryId = null;

        db.AuditLogs.Add(new AuditLog
        {
            UserId = currentUser.UserId,
            UserName = currentUser.UserName,
            Action = AuditAction.Update,
            EntityType = "Beneficiary",
            EntityId = beneficiary.Id.ToString(),
            Description = $"Unlinked citizen account '{user.UserName}' from beneficiary {beneficiary.ClientNumber}.",
            Timestamp = DateTime.UtcNow
        });
        await db.SaveChangesAsync(ct);

        return Result.Success();
    }
}
