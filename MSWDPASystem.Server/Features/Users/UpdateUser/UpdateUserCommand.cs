using MediatR;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Features.Users.GetUsers;

namespace MSWDPASystem.Server.Features.Users.UpdateUser;

public record UpdateUserCommand(
    string Id,
    string FullName,
    string Email,
    string Role,
    bool IsActive
) : IRequest<Result<GetUsersResponse>>;
