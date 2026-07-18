using MediatR;
using MSWDPASystem.Server.Common.Models;

namespace MSWDPASystem.Server.Features.Household.GetHousehold;

public record GetHouseholdQuery(Guid Id) : IRequest<Result<HouseholdDetailDto>>;
