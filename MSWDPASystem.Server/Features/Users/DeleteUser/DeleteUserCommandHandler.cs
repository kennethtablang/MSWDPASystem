using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Common.Exceptions;
using MSWDPASystem.Server.Common.Interfaces;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Domain.Entities;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Users.DeleteUser;

/// <summary>
/// FR-1.4 deletion, guarded so it cannot violate NFR-4.4 (referential integrity)
/// or NFR-4.5 (an audit trail without gaps).
///
/// An account that has actually done work is never destroyed — the audit trail and
/// the "who approved this release" chain would lose their subject. Those accounts
/// must be deactivated instead, which is already the office's off-boarding step.
/// Deletion therefore only applies to accounts created in error that never acted.
/// </summary>
public class DeleteUserCommandHandler(
    UserManager<ApplicationUser> userManager,
    ApplicationDbContext db,
    ICurrentUserService currentUser)
    : IRequestHandler<DeleteUserCommand, Result<bool>>
{
    public async Task<Result<bool>> Handle(DeleteUserCommand request, CancellationToken ct)
    {
        var user = await userManager.FindByIdAsync(request.Id)
            ?? throw new NotFoundException("User", request.Id);

        if (user.Id == currentUser.UserId)
            return Result<bool>.Failure("You cannot delete the account you are signed in with.");

        var roles = await userManager.GetRolesAsync(user);

        // Removing the last administrator would leave the system unconfigurable
        // with no way back in.
        if (roles.Contains("Admin"))
        {
            var admins = await userManager.GetUsersInRoleAsync("Admin");
            if (admins.Count(a => a.IsActive) <= 1)
                return Result<bool>.Failure(
                    "This is the only active administrator account. Assign another administrator before deleting it.");
        }

        var blockers = await CollectBlockersAsync(user.Id, ct);
        if (blockers.Count > 0)
            return Result<bool>.Failure(
                $"This account cannot be deleted because it has system activity on record ({string.Join(", ", blockers)}). " +
                "Deactivate the account instead — this preserves the audit trail while blocking sign-in.");

        // Notifications cascade; nothing else references this account.
        var result = await userManager.DeleteAsync(user);
        if (!result.Succeeded)
            return Result<bool>.Failure(result.Errors.Select(e => e.Description).ToList());

        db.AuditLogs.Add(new AuditLog
        {
            UserId = currentUser.UserId,
            UserName = currentUser.UserName,
            Action = AuditAction.Delete,
            EntityType = "ApplicationUser",
            EntityId = user.Id,
            Description = $"Deleted unused user account '{user.UserName}' ({string.Join(", ", roles)}).",
            Timestamp = DateTime.UtcNow
        });
        await db.SaveChangesAsync(ct);

        return Result<bool>.Success(true);
    }

    /// <summary>Human-readable reasons this account must be retained, if any.</summary>
    private async Task<List<string>> CollectBlockersAsync(string userId, CancellationToken ct)
    {
        var blockers = new List<string>();

        // Messages hold a Restrict foreign key — deleting would fail at the database.
        var messages = await db.Messages.CountAsync(m => m.SenderId == userId || m.RecipientId == userId, ct);
        if (messages > 0) blockers.Add($"{messages} message(s)");

        var beneficiaries = await db.Beneficiaries
            .CountAsync(b => b.CreatedByUserId == userId || b.UpdatedByUserId == userId, ct);
        if (beneficiaries > 0) blockers.Add($"{beneficiaries} beneficiary record(s)");

        var requests = await db.AssistanceRequests.CountAsync(r =>
            r.SubmittedByUserId == userId || r.ReviewedByUserId == userId ||
            r.ApprovedByUserId == userId || r.ReleasedByUserId == userId ||
            r.DeniedByUserId == userId, ct);
        if (requests > 0) blockers.Add($"{requests} assistance request(s)");

        var scans = await db.QrScanLogs.CountAsync(l => l.ScannedByUserId == userId, ct);
        if (scans > 0) blockers.Add($"{scans} QR scan(s)");

        // Login events alone are enough to make the account part of the record.
        var audits = await db.AuditLogs.CountAsync(a => a.UserId == userId, ct);
        if (audits > 0) blockers.Add($"{audits} audit entr(ies)");

        return blockers;
    }
}
