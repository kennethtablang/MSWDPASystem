using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
}
