namespace MSWDPASystem.Server.Domain.Entities;

public class Document : BaseEntity
{
    public Guid BeneficiaryId { get; set; }
    public Beneficiary Beneficiary { get; set; } = null!;

    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string ContentType { get; set; } = string.Empty;
    public string? DocumentType { get; set; }
    public string? Description { get; set; }
    public string? UploadedByUserId { get; set; }
}
