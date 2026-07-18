using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MSWDPASystem.Server.Features.Messages.GetMessages;
using MSWDPASystem.Server.Features.Messages.SendMessage;

namespace MSWDPASystem.Server.Controllers;

[ApiController]
[Route("api/messages")]
[Authorize(Roles = "Admin,MSWDStaff,HeadCoordinator")]
public class MessagesController(IMediator mediator) : ControllerBase
{
    [HttpGet("inbox")]
    public async Task<IActionResult> GetInbox(CancellationToken ct)
    {
        var result = await mediator.Send(new GetMessagesQuery(Inbox: true), ct);
        return Ok(result);
    }

    [HttpGet("sent")]
    public async Task<IActionResult> GetSent(CancellationToken ct)
    {
        var result = await mediator.Send(new GetMessagesQuery(Inbox: false), ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Send([FromBody] SendMessageRequest body, CancellationToken ct)
    {
        var result = await mediator.Send(new SendMessageCommand(body.RecipientId, body.Subject, body.Body), ct);
        if (!result.IsSuccess) return BadRequest(new { message = result.Error });
        return Created(string.Empty, result.Data);
    }
}

public record SendMessageRequest(string RecipientId, string Subject, string Body);
