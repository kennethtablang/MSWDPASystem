using MediatR;
using MSWDPASystem.Server.Common.Models;

namespace MSWDPASystem.Server.Features.Users.GetUsers;

public record GetUsersQuery(string? Search, int Page = 1, int PageSize = 20) : IRequest<PagedList<GetUsersResponse>>;
