namespace MSWDPASystem.Server.Domain.Entities;

public class WelfareProgram : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Code { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<BeneficiaryProgram> Enrollments { get; set; } = [];
    public ICollection<AssistanceType> AssistanceTypes { get; set; } = [];
    public ICollection<AssistanceRequest> AssistanceRequests { get; set; } = [];
}
