using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MSWDPASystem.Server.Features.Account.ChangePassword;
using MSWDPASystem.Server.Features.Account.GetMyAccount;
using MSWDPASystem.Server.Features.Account.UpdateMyPreferences;
using MSWDPASystem.Server.Features.Account.UpdateMyProfile;

namespace MSWDPASystem.Server.Controllers;

/// <summary>
/// Self-service account settings. Every action operates on the signed-in user only,
/// so this is available to all roles including Citizen.
/// </summary>
[ApiController]
[Route("api/account")]
[Authorize]
public class AccountController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetMyAccount(CancellationToken ct)
    {
        var result = await mediator.Send(new GetMyAccountQuery(), ct);
        if (!result.IsSuccess) return NotFound(new { message = result.Error });
        return Ok(result.Data);
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile(
        [FromBody] UpdateMyProfileCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command, ct);
        if (!result.IsSuccess)
            return BadRequest(new { message = result.Error, errors = result.Errors });
        return Ok(new { message = "Profile updated." });
    }

    [HttpPut("password")]
    public async Task<IActionResult> ChangePassword(
        [FromBody] ChangePasswordCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command, ct);
        if (!result.IsSuccess)
            return BadRequest(new { message = result.Error, errors = result.Errors });
        return Ok(new { message = "Password changed. Please sign in again on other devices." });
    }

    [HttpPut("preferences")]
    public async Task<IActionResult> UpdatePreferences(
        [FromBody] UpdateMyPreferencesCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command, ct);
        if (!result.IsSuccess)
            return BadRequest(new { message = result.Error, errors = result.Errors });
        return Ok(result.Data);
    }
}
