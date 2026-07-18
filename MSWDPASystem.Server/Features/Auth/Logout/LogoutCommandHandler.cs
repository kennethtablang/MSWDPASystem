using MediatR;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Common.Interfaces;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Domain.Entities;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Auth.Logout;

public class LogoutCommandHandler(ApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<LogoutCommand, Result>
{
    public async Task<Result> Handle(LogoutCommand request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(currentUser.UserId))
            return Result.Success();

        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == currentUser.UserId, ct);
        if (user == null)
            return Result.Success();

        // Revoke the refresh token so the session cannot be resumed after sign-out.
        // Without this the refresh token stayed valid for its full 7-day lifetime.
        user.RefreshToken = null;
        user.RefreshTokenExpiry = null;

        db.AuditLogs.Add(new AuditLog
        {
            UserId = user.Id,
            UserName = user.UserName,
            Action = AuditAction.Logout,
            EntityType = "ApplicationUser",
            EntityId = user.Id,
            Description = $"User '{user.UserName}' logged out.",
            Timestamp = DateTime.UtcNow
        });

        await db.SaveChangesAsync(ct);
        return Result.Success();
    }
}
