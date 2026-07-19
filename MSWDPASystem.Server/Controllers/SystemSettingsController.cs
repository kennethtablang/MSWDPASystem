using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MSWDPASystem.Server.Common.Configuration;
using MSWDPASystem.Server.Common.Interfaces;
using MSWDPASystem.Server.Features.SystemSettings.GetSystemSettings;
using MSWDPASystem.Server.Features.SystemSettings.UpdateSystemSettings;

namespace MSWDPASystem.Server.Controllers;

[ApiController]
[Route("api/system-settings")]
public class SystemSettingsController(IMediator mediator, ISystemSettingsService settings)
    : ControllerBase
{
    // FR-8.1: only an administrator may view or change system-wide configuration.
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll(CancellationToken ct)
        => Ok(await mediator.Send(new GetSystemSettingsQuery(), ct));

    [HttpPut]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(
        [FromBody] UpdateSystemSettingsCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command, ct);
        if (!result.IsSuccess)
            return BadRequest(new { message = result.Error, errors = result.Errors });
        return Ok(new { message = "System parameters saved." });
    }

    /// <summary>
    /// The subset of parameters the client needs to render forms and enforce limits.
    /// Readable by any signed-in user; contains no sensitive configuration.
    /// </summary>
    [HttpGet("app-config")]
    [Authorize]
    public async Task<IActionResult> AppConfig(CancellationToken ct)
    {
        return Ok(new
        {
            officeName = await settings.GetStringAsync(SystemSettingKeys.OfficeName, ct),
            officeMunicipality = await settings.GetStringAsync(SystemSettingKeys.OfficeMunicipality, ct),
            officeAddress = await settings.GetStringAsync(SystemSettingKeys.OfficeAddress, ct),
            officeContactNumber = await settings.GetStringAsync(SystemSettingKeys.OfficeContactNumber, ct),
            officeEmail = await settings.GetStringAsync(SystemSettingKeys.OfficeEmail, ct),
            barangays = await settings.GetListAsync(SystemSettingKeys.Barangays, ct),
            sessionTimeoutMinutes = await settings.GetIntAsync(SystemSettingKeys.SessionTimeoutMinutes, ct),
            uploadMaxSizeMb = await settings.GetIntAsync(SystemSettingKeys.UploadMaxSizeMb, ct),
            assistanceMaxAmount = await settings.GetDecimalAsync(SystemSettingKeys.AssistanceMaxAmount, ct),
        });
    }
}
