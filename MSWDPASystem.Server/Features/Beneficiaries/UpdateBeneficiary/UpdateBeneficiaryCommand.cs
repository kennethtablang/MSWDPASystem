using MediatR;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Features.Beneficiaries.GetBeneficiary;

namespace MSWDPASystem.Server.Features.Beneficiaries.UpdateBeneficiary;

public record UpdateBeneficiaryCommand(
    Guid Id,
    string FirstName,
    string? MiddleName,
    string LastName,
    string? Suffix,
    DateOnly DateOfBirth,
    Sex Sex,
    CivilStatus CivilStatus,
    string Barangay,
    string Address,
    string? ContactNumber,
    string? EmailAddress,
    string? Occupation,
    decimal? MonthlyIncome,
    List<Guid>? WelfareProgramIds
) : IRequest<Result<BeneficiaryDetailDto>>;
