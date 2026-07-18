using MSWDPASystem.Server.Domain.Enums;

namespace MSWDPASystem.Server.Domain.Entities;

public class AssistanceRequestStatusHistory : BaseEntity
{
    public Guid AssistanceRequestId { get; set; }
    public AssistanceRequest AssistanceRequest { get; set; } = null!;

    public AssistanceRequestStatus Status { get; set; }
    public string? Notes { get; set; }
    public string? ChangedByUserId { get; set; }
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
}
