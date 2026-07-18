using MSWDPASystem.Server.Domain.Enums;

namespace MSWDPASystem.Server.Features.Beneficiaries.RegisterBeneficiary;

public record RegisterBeneficiaryResponse(
    Guid Id,
    string ClientNumber,
    string FullName,
    BeneficiaryStatus Status,
    bool DuplicateFlagged
);
