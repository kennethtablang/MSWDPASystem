using MediatR;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Features.Household.GetHouseholds;

namespace MSWDPASystem.Server.Features.Household.CreateHousehold;

public record CreateHouseholdCommand(
    string Barangay,
    string Address,
    string? HeadOfHouseholdName
) : IRequest<Result<HouseholdDto>>;
