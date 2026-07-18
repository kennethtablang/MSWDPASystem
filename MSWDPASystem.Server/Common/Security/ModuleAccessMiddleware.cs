using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using MSWDPASystem.Server.Domain.Entities;

namespace MSWDPASystem.Server.Common.Security;

/// <summary>
/// FR-1.5 / NFR-7.2: enforces per-staff module access at the application layer
/// (not just in the UI). Only MSWD Staff are gated; Admin and Head Coordinator
/// retain full access. A null ModuleAccess means full default access.
/// </summary>
public class ModuleAccessMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context, UserManager<ApplicationUser> userManager)
    {
        var user = context.User;
        if (user?.Identity?.IsAuthenticated == true && user.IsInRole("MSWDStaff"))
        {
            var module = AppModules.ResolveModule(context.Request.Path);
            if (module != null)
            {
                var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var appUser = userId != null ? await userManager.FindByIdAsync(userId) : null;
                var allowed = AppModules.Parse(appUser?.ModuleAccess);

                if (allowed != null && !allowed.Contains(module))
                {
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    await context.Response.WriteAsJsonAsync(new
                    {
                        message = "Your account does not have access to this module. Contact your Head Coordinator."
                    });
                    return;
                }
            }
        }

        await next(context);
    }
}
