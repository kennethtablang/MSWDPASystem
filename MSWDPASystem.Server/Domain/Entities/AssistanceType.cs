namespace MSWDPASystem.Server.Domain.Entities;

public class AssistanceType : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    public Guid? WelfareProgramId { get; set; }
    public WelfareProgram? WelfareProgram { get; set; }

    public ICollection<AssistanceRequest> AssistanceRequests { get; set; } = [];
}
