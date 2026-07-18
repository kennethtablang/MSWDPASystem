using MSWDPASystem.Server.Domain.Enums;

namespace MSWDPASystem.Server.Domain.Entities;

public class AuditLog : BaseEntity
{
    public string? UserId { get; set; }
    public string? UserName { get; set; }
    public AuditAction Action { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public string? EntityId { get; set; }
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string? IpAddress { get; set; }
    public string? Description { get; set; }
}
