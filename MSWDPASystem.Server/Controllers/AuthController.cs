using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MSWDPASystem.Server.Features.Auth.Login;
using MSWDPASystem.Server.Features.Auth.RefreshToken;

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

    [Authorize]
    [HttpPost("logout")]
    public IActionResult Logout() => Ok(new { message = "Logged out successfully." });

    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var userName = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
        var fullName = User.FindFirst("fullName")?.Value;
        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        return Ok(new { userId, userName, fullName, role });
    }
}
