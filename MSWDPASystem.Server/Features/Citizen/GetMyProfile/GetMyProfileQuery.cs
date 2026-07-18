using MediatR;

namespace MSWDPASystem.Server.Features.Citizen.GetMyProfile;

public record GetMyProfileQuery : IRequest<GetMyProfileResponse>;

public record LinkedBeneficiaryDto(
    Guid Id,
    string ClientNumber,
    string FullName,
    string Barangay,
    string Status,
    List<string> Programs
);

public record GetMyProfileResponse(
    string UserId,
    string UserName,
    string FullName,
    string Email,
    string? ContactNumber,
    DateTime CreatedAt,
    bool IsLinked,
    LinkedBeneficiaryDto? Beneficiary
);
