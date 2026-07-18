using MSWDPASystem.Server.Domain.Enums;

namespace MSWDPASystem.Server.Domain.Entities;

public class Notification : BaseEntity
{
    public string RecipientUserId { get; set; } = string.Empty;
    public ApplicationUser RecipientUser { get; set; } = null!;

    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationType Type { get; set; }
    public bool IsRead { get; set; } = false;
    public DateTime? ReadAt { get; set; }
    public string? RelatedEntityType { get; set; }
    public string? RelatedEntityId { get; set; }
}
