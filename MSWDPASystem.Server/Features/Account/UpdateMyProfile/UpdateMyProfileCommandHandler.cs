using MediatR;
using Microsoft.AspNetCore.Identity;
using MSWDPASystem.Server.Common.Interfaces;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Domain.Entities;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Account.UpdateMyProfile;

public class UpdateMyProfileCommandHandler(
    UserManager<ApplicationUser> userManager,
    ApplicationDbContext db,
    ICurrentUserService currentUser)
    : IRequestHandler<UpdateMyProfileCommand, Result>
{
    public async Task<Result> Handle(UpdateMyProfileCommand request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(currentUser.UserId))
            return Result.Failure("Not authenticated.");

        var user = await userManager.FindByIdAsync(currentUser.UserId);
        if (user == null)
            return Result.Failure("Account not found.");

        var email = request.Email.Trim();

        // Email is the recovery channel and must stay unique across accounts.
        var owner = await userManager.FindByEmailAsync(email);
        if (owner != null && owner.Id != user.Id)
            return Result.Failure("That email address is already in use.");

        var changedEmail = !string.Equals(user.Email, email, StringComparison.OrdinalIgnoreCase);

        user.FullName = request.FullName.Trim();
        user.ContactNumber = string.IsNullOrWhiteSpace(request.ContactNumber)
            ? null
            : request.ContactNumber.Trim();

        if (changedEmail)
        {
            user.Email = email;
            user.NormalizedEmail = userManager.NormalizeEmail(email);
        }

        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
            return Result.Failure(result.Errors.Select(e => e.Description).ToList());

        db.AuditLogs.Add(new AuditLog
        {
            UserId = user.Id,
            UserName = user.UserName,
            Action = AuditAction.Update,
            EntityType = "ApplicationUser",
            EntityId = user.Id,
            Description = $"User '{user.UserName}' updated their own profile"
                          + (changedEmail ? $" (email changed to {email})." : "."),
            Timestamp = DateTime.UtcNow
        });
        await db.SaveChangesAsync(ct);

        return Result.Success();
    }
}
