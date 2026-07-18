using System.Security.Claims;
using MSWDPASystem.Server.Common.Interfaces;

namespace MSWDPASystem.Server.Infrastructure.Services;

public class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    private ClaimsPrincipal? User => httpContextAccessor.HttpContext?.User;

    public string? UserId => User?.FindFirstValue(ClaimTypes.NameIdentifier);
    public string? UserName => User?.FindFirstValue(ClaimTypes.Name);
    public string? Role => User?.FindFirstValue(ClaimTypes.Role);
    public bool IsAuthenticated => User?.Identity?.IsAuthenticated ?? false;
}
