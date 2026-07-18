using MediatR;
using Microsoft.AspNetCore.Identity;
using MSWDPASystem.Server.Common.Interfaces;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Domain.Entities;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Auth.Login;

public class LoginCommandHandler(
    UserManager<ApplicationUser> userManager,
    ITokenService tokenService,
    ApplicationDbContext context)
    : IRequestHandler<LoginCommand, Result<LoginResponse>>
{
    public async Task<Result<LoginResponse>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await userManager.FindByNameAsync(request.UserName)
                   ?? await userManager.FindByEmailAsync(request.UserName);

        if (user == null || !user.IsActive)
            return Result<LoginResponse>.Failure("Invalid credentials or account is inactive.");

        if (!await userManager.CheckPasswordAsync(user, request.Password))
            return Result<LoginResponse>.Failure("Invalid credentials or account is inactive.");

        // Staff accounts are created with EmailConfirmed = true; this only
        // gates self-registered citizen accounts pending verification.
        if (!user.EmailConfirmed)
            return Result<LoginResponse>.Failure("Please verify your email address first. Check your inbox for the verification link.");

        var roles = await userManager.GetRolesAsync(user);
        var accessToken = tokenService.GenerateAccessToken(user, roles);
        var refreshToken = tokenService.GenerateRefreshToken();

        // FR-1.5: MSWD Staff carry their effective module access (null = full default).
        var allowedModules = roles.Contains("MSWDStaff")
            ? Common.Security.AppModules.Parse(user.ModuleAccess) ?? Common.Security.AppModules.ConfigurableKeys.ToList()
            : null;

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = tokenService.GetRefreshTokenExpiry();
        user.LastLoginAt = DateTime.UtcNow;
        await userManager.UpdateAsync(user);

        context.AuditLogs.Add(new AuditLog
        {
            UserId = user.Id,
            UserName = user.UserName,
            Action = Domain.Enums.AuditAction.Login,
            EntityType = "ApplicationUser",
            EntityId = user.Id,
            Description = $"User '{user.UserName}' logged in."
        });
        await context.SaveChangesAsync(cancellationToken);

        var expiry = DateTime.UtcNow.AddMinutes(480);
        return Result<LoginResponse>.Success(new LoginResponse(
            AccessToken: accessToken,
            RefreshToken: refreshToken,
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
