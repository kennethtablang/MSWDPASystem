using MSWDPASystem.Server.Domain.Enums;

namespace MSWDPASystem.Server.Domain.Entities;

public class AssistanceRequest : BaseEntity
{
    public string RequestNumber { get; set; } = string.Empty;
    public Guid BeneficiaryId { get; set; }
    public Beneficiary Beneficiary { get; set; } = null!;

    public Guid AssistanceTypeId { get; set; }
    public AssistanceType AssistanceType { get; set; } = null!;

    public Guid? WelfareProgramId { get; set; }
    public WelfareProgram? WelfareProgram { get; set; }

    public decimal? Amount { get; set; }
    public string? Purpose { get; set; }
    public string? Remarks { get; set; }

    public AssistanceRequestStatus Status { get; set; } = AssistanceRequestStatus.Submitted;

    public string? SubmittedByUserId { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? ReviewedByUserId { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public string? ApprovedByUserId { get; set; }
    public DateTime? ReleasedAt { get; set; }
    public string? ReleasedByUserId { get; set; }
    public DateTime? DeniedAt { get; set; }
    public string? DeniedByUserId { get; set; }
    public string? DenialReason { get; set; }

    public ICollection<AssistanceRequestStatusHistory> StatusHistory { get; set; } = [];
}
