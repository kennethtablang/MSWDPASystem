namespace MSWDPASystem.Server.Features.Household.GetHousehold;

public record HouseholdDetailDto(
    Guid Id,
    string HouseholdNumber,
    string Barangay,
    string Address,
    string? HeadOfHouseholdName,
    List<HouseholdMemberDto> Members,
    DateTime CreatedAt
);

public record HouseholdMemberDto(
    Guid Id,
    string ClientNumber,
    string FullName,
    string Barangay,
    string Status
);
