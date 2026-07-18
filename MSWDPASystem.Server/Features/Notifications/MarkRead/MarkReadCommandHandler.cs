using MediatR;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Common.Interfaces;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Notifications.MarkRead;

public class MarkReadCommandHandler(ApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<MarkReadCommand, Result>
{
    public async Task<Result> Handle(MarkReadCommand request, CancellationToken ct)
    {
        var query = db.Notifications.Where(n => n.RecipientUserId == currentUser.UserId && !n.IsRead);

        if (request.Ids is { Count: > 0 })
            query = query.Where(n => request.Ids.Contains(n.Id));

        var notifications = await query.ToListAsync(ct);
        var now = DateTime.UtcNow;

        foreach (var n in notifications)
        {
            n.IsRead = true;
            n.ReadAt = now;
        }

        await db.SaveChangesAsync(ct);
        return Result.Success();
    }
}
