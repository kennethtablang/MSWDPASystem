namespace MSWDPASystem.Server.Features.Household.GetHouseholds;

public record HouseholdDto(
    Guid Id,
    string HouseholdNumber,
    string Barangay,
    string Address,
    string? HeadOfHouseholdName,
    int MemberCount,
    DateTime CreatedAt
);
