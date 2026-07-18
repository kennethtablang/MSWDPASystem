using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Common.Interfaces;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Domain.Entities;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Beneficiaries.LinkCitizen;

public class LinkCitizenCommandHandler(
    ApplicationDbContext db,
    UserManager<ApplicationUser> userManager,
    ICurrentUserService currentUser)
    : IRequestHandler<LinkCitizenCommand, Result>
{
    public async Task<Result> Handle(LinkCitizenCommand request, CancellationToken ct)
    {
        var beneficiary = await db.Beneficiaries.FirstOrDefaultAsync(b => b.Id == request.BeneficiaryId, ct);
        if (beneficiary == null)
            return Result.Failure("Beneficiary not found.");

        var user = await userManager.FindByIdAsync(request.UserId);
        if (user == null)
            return Result.Failure("Citizen account not found.");

        if (!await userManager.IsInRoleAsync(user, "Citizen"))
            return Result.Failure("Only citizen accounts can be linked to a beneficiary.");

        if (user.LinkedBeneficiaryId == beneficiary.Id)
            return Result.Success();

        if (user.LinkedBeneficiaryId is not null)
            return Result.Failure("This citizen account is already linked to another beneficiary.");

        var existing = await db.Users.AnyAsync(u => u.LinkedBeneficiaryId == beneficiary.Id, ct);
        if (existing)
            return Result.Failure("This beneficiary already has a linked citizen account. Unlink it first.");

        user.LinkedBeneficiaryId = beneficiary.Id;
        await userManager.UpdateAsync(user);

        db.AuditLogs.Add(new AuditLog
        {
            UserId = currentUser.UserId,
            UserName = currentUser.UserName,
            Action = AuditAction.Update,
            EntityType = "Beneficiary",
            EntityId = beneficiary.Id.ToString(),
            Description = $"Linked citizen account '{user.UserName}' to beneficiary {beneficiary.ClientNumber}.",
            Timestamp = DateTime.UtcNow
        });
        await db.SaveChangesAsync(ct);

        return Result.Success();
    }
}
