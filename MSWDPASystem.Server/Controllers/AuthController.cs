using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MSWDPASystem.Server.Features.Auth.ConfirmEmail;
using MSWDPASystem.Server.Features.Auth.ForgotPassword;
using MSWDPASystem.Server.Features.Auth.GetCurrentUser;
using MSWDPASystem.Server.Features.Auth.Login;
using MSWDPASystem.Server.Features.Auth.Logout;
using MSWDPASystem.Server.Features.Auth.RefreshToken;
using MSWDPASystem.Server.Features.Auth.RegisterCitizen;
using MSWDPASystem.Server.Features.Auth.ResetPassword;

namespace MSWDPASystem.Server.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IMediator mediator) : ControllerBase
{
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command, ct);
        if (!result.IsSuccess)
            return Unauthorized(new { message = result.Error });
        return Ok(result.Data);
    }

    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command, ct);
        if (!result.IsSuccess)
            return Unauthorized(new { message = result.Error });
        return Ok(result.Data);
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterCitizenCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command, ct);
        if (!result.IsSuccess)
            return BadRequest(new { message = result.Error, errors = result.Errors });
        return Ok(result.Data);
    }

    [HttpPost("confirm-email")]
    public async Task<IActionResult> ConfirmEmail([FromBody] ConfirmEmailCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command, ct);
        if (!result.IsSuccess)
            return BadRequest(new { message = result.Error });
        return Ok(new { message = "Email verified. You can now sign in." });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command, ct);
        return Ok(result.Data);
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command, ct);
        if (!result.IsSuccess)
            return BadRequest(new { message = result.Error, errors = result.Errors });
        return Ok(new { message = "Password has been reset. You can now sign in." });
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout(CancellationToken ct)
    {
        await mediator.Send(new LogoutCommand(), ct);
        return Ok(new { message = "Logged out successfully." });
    }

    // Reads from the database rather than the JWT claims, so a role change,
    // module-permission change or deactivation is reflected on the next page load.
    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me(CancellationToken ct)
    {
        var result = await mediator.Send(new GetCurrentUserQuery(), ct);
        if (!result.IsSuccess) return Unauthorized(new { message = result.Error });
        return Ok(result.Data);
    }
}
