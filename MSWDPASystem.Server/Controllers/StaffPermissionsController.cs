using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using MSWDPASystem.Server.Common.Interfaces;
using MSWDPASystem.Server.Common.Security;
using MSWDPASystem.Server.Domain.Entities;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Controllers;

// FR-1.5: Head Coordinator (and Admin) configure per-staff data-access permissions.
[ApiController]
[Route("api/staff-permissions")]
[Authorize(Roles = "Admin,HeadCoordinator")]
public class StaffPermissionsController(
    UserManager<ApplicationUser> userManager,
    ApplicationDbContext db,
    ICurrentUserService currentUser) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var staff = await userManager.GetUsersInRoleAsync("MSWDStaff");

        var result = staff
            .OrderBy(u => u.FullName)
            .Select(u => new
            {
                id = u.Id,
                fullName = u.FullName,
                userName = u.UserName,
                isActive = u.IsActive,
                isDefault = string.IsNullOrWhiteSpace(u.ModuleAccess),
                allowedModules = AppModules.Parse(u.ModuleAccess) ?? AppModules.ConfigurableKeys.ToList()
            });

        return Ok(new
        {
            modules = AppModules.Configurable.Select(m => new { key = m.Key, label = m.Label }),
            staff = result
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdatePermissionsBody body)
    {
        var user = await userManager.FindByIdAsync(id);
        if (user == null) return NotFound(new { message = "User not found." });

        if (!await userManager.IsInRoleAsync(user, "MSWDStaff"))
            return BadRequest(new { message = "Permissions can only be configured for MSWD Staff accounts." });

        string description;
        if (body.UseDefault)
        {
            user.ModuleAccess = null;
            description = $"Reset module access to default for '{user.UserName}'.";
        }
        else
        {
            var modules = body.Modules ?? [];
            user.ModuleAccess = AppModules.Serialize(modules);
            description = $"Set module access for '{user.UserName}' to: {string.Join(", ", AppModules.Parse(user.ModuleAccess) ?? [])}.";
        }

        await userManager.UpdateAsync(user);

        db.AuditLogs.Add(new AuditLog
        {
            UserId = currentUser.UserId,
            UserName = currentUser.UserName,
            Action = AuditAction.Update,
            EntityType = "ApplicationUser",
            EntityId = user.Id,
            Description = description,
            Timestamp = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        return Ok(new
        {
            id = user.Id,
            isDefault = string.IsNullOrWhiteSpace(user.ModuleAccess),
            allowedModules = AppModules.Parse(user.ModuleAccess) ?? AppModules.ConfigurableKeys.ToList()
        });
    }
}

public record UpdatePermissionsBody(List<string>? Modules, bool UseDefault = false);
