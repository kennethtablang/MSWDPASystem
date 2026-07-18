namespace MSWDPASystem.Server.Domain.Entities;

public class QrScanLog : BaseEntity
{
    public Guid BeneficiaryId { get; set; }
    public Beneficiary Beneficiary { get; set; } = null!;

    public string? ScannedByUserId { get; set; }
    public DateTime ScannedAt { get; set; } = DateTime.UtcNow;
    public string? Notes { get; set; }
    public string? DeviceInfo { get; set; }
}
