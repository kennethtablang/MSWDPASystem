using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Common.Interfaces;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Domain.Entities;
using MSWDPASystem.Server.Features.Auth.Login;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Auth.RefreshToken;

public class RefreshTokenCommandHandler(
    UserManager<ApplicationUser> userManager,
    ITokenService tokenService,
    ApplicationDbContext context)
    : IRequestHandler<RefreshTokenCommand, Result<LoginResponse>>
{
    public async Task<Result<LoginResponse>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var user = await context.Users
            .FirstOrDefaultAsync(u => u.RefreshToken == request.RefreshToken, cancellationToken);

        if (user == null || user.RefreshTokenExpiry < DateTime.UtcNow || !user.IsActive)
            return Result<LoginResponse>.Failure("Invalid or expired refresh token.");

        var roles = await userManager.GetRolesAsync(user);
        var accessToken = tokenService.GenerateAccessToken(user, roles);
        var newRefreshToken = tokenService.GenerateRefreshToken();

        var allowedModules = roles.Contains("MSWDStaff")
            ? Common.Security.AppModules.Parse(user.ModuleAccess) ?? Common.Security.AppModules.ConfigurableKeys.ToList()
            : null;

        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiry = tokenService.GetRefreshTokenExpiry();
        await userManager.UpdateAsync(user);

        var expiry = DateTime.UtcNow.AddMinutes(480);
        return Result<LoginResponse>.Success(new LoginResponse(
            AccessToken: accessToken,
            RefreshToken: newRefreshToken,
            AccessTokenExpiry: expiry,
            UserId: user.Id,
            UserName: user.UserName ?? string.Empty,
            FullName: user.FullName,
            Email: user.Email ?? string.Empty,
            Role: roles.FirstOrDefault() ?? string.Empty,
            AllowedModules: allowedModules
        ));
    }
}
