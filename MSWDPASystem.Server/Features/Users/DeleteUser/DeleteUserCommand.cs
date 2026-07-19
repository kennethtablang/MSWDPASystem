using MediatR;
using MSWDPASystem.Server.Common.Models;

namespace MSWDPASystem.Server.Features.Users.DeleteUser;

/// <summary>FR-1.4: permanently remove a user account.</summary>
public record DeleteUserCommand(string Id) : IRequest<Result<bool>>;
