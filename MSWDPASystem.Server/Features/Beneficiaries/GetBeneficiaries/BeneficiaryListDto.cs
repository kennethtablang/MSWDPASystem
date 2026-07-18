using MSWDPASystem.Server.Domain.Enums;

namespace MSWDPASystem.Server.Features.Beneficiaries.GetBeneficiaries;

public record BeneficiaryListDto(
    Guid Id,
    string ClientNumber,
    string FirstName,
    string? MiddleName,
    string LastName,
    string FullName,
    string Barangay,
    BeneficiaryStatus Status,
    List<string> Programs,
    DateTime CreatedAt
);
