using MediatR;

namespace MSWDPASystem.Server.Features.Notifications.GetNotifications;

public record GetNotificationsQuery(bool UnreadOnly = false) : IRequest<List<NotificationDto>>;
