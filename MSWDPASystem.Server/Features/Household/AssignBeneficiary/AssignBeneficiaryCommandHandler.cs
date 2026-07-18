using MediatR;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Common.Interfaces;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Domain.Entities;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Household.AssignBeneficiary;

public class AssignBeneficiaryCommandHandler(
    ApplicationDbContext db,
    ICurrentUserService currentUser)
    : IRequestHandler<AssignBeneficiaryCommand, Result>
{
    public async Task<Result> Handle(AssignBeneficiaryCommand request, CancellationToken ct)
    {
        var household = await db.Households.FirstOrDefaultAsync(h => h.Id == request.HouseholdId, ct);
        if (household == null)
            return Result.Failure("Household not found.");

        var beneficiary = await db.Beneficiaries.FirstOrDefaultAsync(b => b.Id == request.BeneficiaryId, ct);
        if (beneficiary == null)
            return Result.Failure("Beneficiary not found.");

        beneficiary.HouseholdId = request.HouseholdId;

        db.AuditLogs.Add(new AuditLog
        {
            UserId = currentUser.UserId,
            UserName = currentUser.UserName,
            Action = AuditAction.Update,
            EntityType = "Beneficiary",
            EntityId = beneficiary.Id.ToString(),
            Description = $"Assigned '{beneficiary.FullName}' to household '{household.HouseholdNumber}'."
        });

        await db.SaveChangesAsync(ct);
        return Result.Success();
    }
}
