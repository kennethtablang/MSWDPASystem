using MSWDPASystem.Server.Domain.Enums;

namespace MSWDPASystem.Server.Features.Beneficiaries.GetBeneficiary;

public record BeneficiaryDetailDto(
    Guid Id,
    string ClientNumber,
    string FirstName,
    string? MiddleName,
    string LastName,
    string? Suffix,
    string FullName,
    DateOnly DateOfBirth,
    int AgeYears,
    Sex Sex,
    CivilStatus CivilStatus,
    string Barangay,
    string Address,
    string? ContactNumber,
    string? EmailAddress,
    string? Occupation,
    decimal? MonthlyIncome,
    BeneficiaryStatus Status,
    List<ProgramEnrollmentDto> Programs,
    List<RecentAssistanceDto> RecentAssistance,
    List<DocumentDto> Documents,
    string? SignatureUrl,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record ProgramEnrollmentDto(Guid ProgramId, string ProgramName, DateOnly EnrollmentDate, bool IsActive);

public record RecentAssistanceDto(
    Guid Id, string RequestNumber, string AssistanceType,
    decimal? Amount, string Status, DateTime CreatedAt);

public record DocumentDto(Guid Id, string FileName, string DocumentType, DateTime UploadedAt);
