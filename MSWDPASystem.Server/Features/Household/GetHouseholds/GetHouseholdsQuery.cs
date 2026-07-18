using MediatR;
using MSWDPASystem.Server.Common.Models;

namespace MSWDPASystem.Server.Features.Household.GetHouseholds;

public record GetHouseholdsQuery(string? Search = null, int Page = 1, int PageSize = 20)
    : IRequest<PagedList<HouseholdDto>>;
