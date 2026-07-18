using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MSWDPASystem.Server.Features.Users.CreateUser;
using MSWDPASystem.Server.Features.Users.GetUsers;
using MSWDPASystem.Server.Features.Users.UpdateUser;

namespace MSWDPASystem.Server.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Roles = "Admin")]
public class UsersController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetUsers([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var result = await mediator.Send(new GetUsersQuery(search, page, pageSize), ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command, ct);
        if (!result.IsSuccess) return BadRequest(new { message = result.Error });
        return CreatedAtAction(nameof(GetUsers), result.Data);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserRequest body, CancellationToken ct)
    {
        var result = await mediator.Send(new UpdateUserCommand(id, body.FullName, body.Email, body.Role, body.IsActive), ct);
        if (!result.IsSuccess) return BadRequest(new { message = result.Error });
        return Ok(result.Data);
    }
}

public record UpdateUserRequest(string FullName, string Email, string Role, bool IsActive);
