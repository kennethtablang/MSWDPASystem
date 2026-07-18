using MediatR;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Features.Users.GetUsers;

namespace MSWDPASystem.Server.Features.Users.CreateUser;

public record CreateUserCommand(
    string UserName,
    string FullName,
    string Email,
    string Password,
    string Role
) : IRequest<Result<GetUsersResponse>>;
