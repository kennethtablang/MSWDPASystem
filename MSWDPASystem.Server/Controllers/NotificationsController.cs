using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MSWDPASystem.Server.Features.Notifications.GetNotifications;
using MSWDPASystem.Server.Features.Notifications.MarkRead;

namespace MSWDPASystem.Server.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetNotifications([FromQuery] bool unreadOnly = false, CancellationToken ct = default)
    {
        var result = await mediator.Send(new GetNotificationsQuery(unreadOnly), ct);
        return Ok(result);
    }

    [HttpPost("mark-read")]
    public async Task<IActionResult> MarkRead([FromBody] MarkReadRequest? body, CancellationToken ct)
    {
        await mediator.Send(new MarkReadCommand(body?.Ids), ct);
        return NoContent();
    }
}

public record MarkReadRequest(List<Guid>? Ids);
