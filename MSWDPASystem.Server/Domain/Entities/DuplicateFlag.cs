using MSWDPASystem.Server.Domain.Enums;

namespace MSWDPASystem.Server.Domain.Entities;

public class DuplicateFlag : BaseEntity
{
    public Guid OriginalBeneficiaryId { get; set; }
    public Beneficiary OriginalBeneficiary { get; set; } = null!;

    public Guid DuplicateBeneficiaryId { get; set; }
    public Beneficiary DuplicateBeneficiary { get; set; } = null!;

    public DuplicateFlagStatus Status { get; set; } = DuplicateFlagStatus.Pending;
    public bool FlaggedBySystem { get; set; } = true;
    public string? FlaggedByUserId { get; set; }

    public DateTime? ResolvedAt { get; set; }
    public string? ResolvedByUserId { get; set; }
    public string? ResolutionNotes { get; set; }
}
