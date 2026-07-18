using MediatR;
using MSWDPASystem.Server.Common.Models;

namespace MSWDPASystem.Server.Features.Auth.GetCurrentUser;

public record GetCurrentUserQuery : IRequest<Result<CurrentUserDto>>;

/// <summary>
/// The authoritative, database-backed view of the signed-in user. The client
/// revalidates against this on load so that role changes, module-permission
/// changes and deactivations take effect without waiting for a re-login.
/// </summary>
public record CurrentUserDto(
    string UserId,
    string UserName,
    string FullName,
    string Email,
    string Role,
    List<string>? AllowedModules
);
