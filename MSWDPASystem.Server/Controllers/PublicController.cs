using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Features.Content.GetPublicContent;
using MSWDPASystem.Server.Features.Public.GetPublicStats;

namespace MSWDPASystem.Server.Controllers;

[ApiController]
[Route("api/public")]
[AllowAnonymous]
public class PublicController(IMediator mediator) : ControllerBase
{
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats(CancellationToken ct)
    {
        var result = await mediator.Send(new GetPublicStatsQuery(), ct);
        return Ok(result);
    }

    /// <summary>
    /// Published announcements, news, or FAQs. The landing page calls this with
    /// the defaults; the public archive pages pass includeExpired=true and page
    /// through the history.
    /// </summary>
    [HttpGet("content")]
    public async Task<IActionResult> GetContent(
        [FromQuery] ContentType type,
        [FromQuery] bool includeExpired = false,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
    {
        if (!Enum.IsDefined(type))
            return BadRequest(new { message = "Unknown content section." });

        return Ok(await mediator.Send(
            new GetPublicContentQuery(type, includeExpired, page, pageSize), ct));
    }
}
