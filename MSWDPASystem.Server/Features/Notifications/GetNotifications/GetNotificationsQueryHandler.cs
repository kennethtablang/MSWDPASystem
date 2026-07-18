using MediatR;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Common.Interfaces;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Notifications.GetNotifications;

public class GetNotificationsQueryHandler(ApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<GetNotificationsQuery, List<NotificationDto>>
{
    public async Task<List<NotificationDto>> Handle(GetNotificationsQuery request, CancellationToken ct)
    {
        var query = db.Notifications
            .Where(n => n.RecipientUserId == currentUser.UserId);

        if (request.UnreadOnly)
            query = query.Where(n => !n.IsRead);

        return await query
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .Select(n => new NotificationDto(
                n.Id, n.Title, n.Message, n.Type, n.IsRead, n.ReadAt,
                n.RelatedEntityType, n.RelatedEntityId, n.CreatedAt))
            .ToListAsync(ct);
    }
}
