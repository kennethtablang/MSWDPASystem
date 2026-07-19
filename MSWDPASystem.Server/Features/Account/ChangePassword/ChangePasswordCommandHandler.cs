using MediatR;
using Microsoft.AspNetCore.Identity;
using MSWDPASystem.Server.Common.Interfaces;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Domain.Entities;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Account.ChangePassword;

public class ChangePasswordCommandHandler(
    UserManager<ApplicationUser> userManager,
    ApplicationDbContext db,
    ICurrentUserService currentUser)
    : IRequestHandler<ChangePasswordCommand, Result>
{
    public async Task<Result> Handle(ChangePasswordCommand request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(currentUser.UserId))
            return Result.Failure("Not authenticated.");

        var user = await userManager.FindByIdAsync(currentUser.UserId);
        if (user == null)
            return Result.Failure("Account not found.");

        // ChangePasswordAsync verifies the current password and applies the
        // configured password policy to the new one.
        var result = await userManager.ChangePasswordAsync(
            user, request.CurrentPassword, request.NewPassword);

        if (!result.Succeeded)
            return Result.Failure(result.Errors.Select(e => e.Description).ToList());

        // Force other sessions to re-authenticate with the new credentials.
        user.RefreshToken = null;
        user.RefreshTokenExpiry = null;
        await userManager.UpdateAsync(user);

        db.AuditLogs.Add(new AuditLog
        {
            UserId = user.Id,
            UserName = user.UserName,
            Action = AuditAction.Update,
            EntityType = "ApplicationUser",
            EntityId = user.Id,
            Description = $"User '{user.UserName}' changed their password.",
            Timestamp = DateTime.UtcNow
        });
        await db.SaveChangesAsync(ct);

        return Result.Success();
    }
}
