using MSWDPASystem.Server.Domain.Enums;

namespace MSWDPASystem.Server.Domain.Entities;

public class Beneficiary : BaseEntity
{
    public string ClientNumber { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string? MiddleName { get; set; }
    public string LastName { get; set; } = string.Empty;
    public string? Suffix { get; set; }
    public DateOnly DateOfBirth { get; set; }
    public Sex Sex { get; set; }
    public CivilStatus CivilStatus { get; set; }
    public string Barangay { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? ContactNumber { get; set; }
    public string? EmailAddress { get; set; }
    public string? Occupation { get; set; }
    public decimal? MonthlyIncome { get; set; }
    public string? SignatureFilePath { get; set; }
    public BeneficiaryStatus Status { get; set; } = BeneficiaryStatus.Active;
    public string? CreatedByUserId { get; set; }
    public string? UpdatedByUserId { get; set; }

    public Guid? HouseholdId { get; set; }
    public Household? Household { get; set; }

    public ICollection<BeneficiaryProgram> Programs { get; set; } = [];
    public ICollection<AssistanceRequest> AssistanceRequests { get; set; } = [];
    public ICollection<Document> Documents { get; set; } = [];
    public ICollection<QrScanLog> QrScanLogs { get; set; } = [];
    public ICollection<DuplicateFlag> DuplicateFlagsAsOriginal { get; set; } = [];
    public ICollection<DuplicateFlag> DuplicateFlagsAsDuplicate { get; set; } = [];

    public string FullName => $"{FirstName} {MiddleName?.Trim() + " "}{LastName}{(Suffix != null ? " " + Suffix : "")}".Replace("  ", " ").Trim();
}
