using MediatR;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Common.Interfaces;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Domain.Entities;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Content.DeleteContentItem;

public class DeleteContentItemCommandHandler(
    ApplicationDbContext db,
    ICurrentUserService currentUser)
    : IRequestHandler<DeleteContentItemCommand, Result>
{
    public async Task<Result> Handle(DeleteContentItemCommand request, CancellationToken ct)
    {
        var item = await db.ContentItems.FirstOrDefaultAsync(c => c.Id == request.Id, ct);
        if (item is null)
            return Result.Failure("Content item not found.");

        if (item.IsDeleted == !request.Restore)
            return Result.Success(); // Already in the requested state.

        item.IsDeleted = !request.Restore;
        item.UpdatedAt = DateTime.UtcNow;
        item.UpdatedByUserId = currentUser.UserId;
        item.UpdatedByName = currentUser.UserName;

        db.AuditLogs.Add(new AuditLog
        {
            UserId = currentUser.UserId,
            UserName = currentUser.UserName,
            Action = AuditAction.Delete,
            EntityType = nameof(ContentItem),
            EntityId = item.Id.ToString(),
            Description = request.Restore
                ? $"Restored {item.Type} \"{item.Title}\"."
                : $"Removed {item.Type} \"{item.Title}\" from the public site.",
        });

        await db.SaveChangesAsync(ct);
        return Result.Success();
    }
}
