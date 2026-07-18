using MSWDPASystem.Server.Domain.Enums;

namespace MSWDPASystem.Server.Features.Notifications.GetNotifications;

public record NotificationDto(
    Guid Id,
    string Title,
    string Message,
    NotificationType Type,
    bool IsRead,
    DateTime? ReadAt,
    string? RelatedEntityType,
    string? RelatedEntityId,
    DateTime CreatedAt
);
