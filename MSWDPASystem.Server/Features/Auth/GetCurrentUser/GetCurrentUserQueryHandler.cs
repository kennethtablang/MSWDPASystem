using MediatR;
using Microsoft.AspNetCore.Identity;
using MSWDPASystem.Server.Common.Interfaces;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Common.Security;
using MSWDPASystem.Server.Domain.Entities;

namespace MSWDPASystem.Server.Features.Auth.GetCurrentUser;

public class GetCurrentUserQueryHandler(
    UserManager<ApplicationUser> userManager,
    ICurrentUserService currentUser)
    : IRequestHandler<GetCurrentUserQuery, Result<CurrentUserDto>>
{
    public async Task<Result<CurrentUserDto>> Handle(GetCurrentUserQuery request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(currentUser.UserId))
            return Result<CurrentUserDto>.Failure("Not authenticated.");

        var user = await userManager.FindByIdAsync(currentUser.UserId);

        // A token can outlive the account being deactivated or removed.
        if (user == null || !user.IsActive)
            return Result<CurrentUserDto>.Failure("Account is no longer active.");

        var roles = await userManager.GetRolesAsync(user);

        // FR-1.5: MSWD Staff carry their effective module access (null = full default).
        var allowedModules = roles.Contains("MSWDStaff")
            ? AppModules.Parse(user.ModuleAccess) ?? AppModules.ConfigurableKeys.ToList()
            : null;

        return Result<CurrentUserDto>.Success(new CurrentUserDto(
            UserId: user.Id,
            UserName: user.UserName ?? string.Empty,
            FullName: user.FullName,
            Email: user.Email ?? string.Empty,
            Role: roles.FirstOrDefault() ?? string.Empty,
            AllowedModules: allowedModules
        ));
    }
}
