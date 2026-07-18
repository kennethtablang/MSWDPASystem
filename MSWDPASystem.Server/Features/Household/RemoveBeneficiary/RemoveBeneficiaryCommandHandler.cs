using MediatR;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Common.Interfaces;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Domain.Entities;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Household.RemoveBeneficiary;

public class RemoveBeneficiaryCommandHandler(
    ApplicationDbContext db,
    ICurrentUserService currentUser)
    : IRequestHandler<RemoveBeneficiaryCommand, Result>
{
    public async Task<Result> Handle(RemoveBeneficiaryCommand request, CancellationToken ct)
    {
        var beneficiary = await db.Beneficiaries
            .FirstOrDefaultAsync(b => b.Id == request.BeneficiaryId && b.HouseholdId == request.HouseholdId, ct);

        if (beneficiary == null)
            return Result.Failure("Beneficiary not found in this household.");

        var householdNumber = await db.Households
            .Where(h => h.Id == request.HouseholdId)
            .Select(h => h.HouseholdNumber)
            .FirstOrDefaultAsync(ct);

        beneficiary.HouseholdId = null;

        db.AuditLogs.Add(new AuditLog
        {
            UserId = currentUser.UserId,
            UserName = currentUser.UserName,
            Action = AuditAction.Update,
            EntityType = "Beneficiary",
            EntityId = beneficiary.Id.ToString(),
            Description = $"Removed '{beneficiary.FullName}' from household '{householdNumber}'."
        });

        await db.SaveChangesAsync(ct);
        return Result.Success();
    }
}
