using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MSWDPASystem.Server.Features.Dashboard.GetCharts;
using MSWDPASystem.Server.Features.Dashboard.GetStats;

namespace MSWDPASystem.Server.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize(Roles = "Admin,MSWDStaff,HeadCoordinator")]
public class DashboardController(IMediator mediator) : ControllerBase
{
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats(CancellationToken ct)
    {
        var result = await mediator.Send(new GetStatsQuery(), ct);
        return Ok(result);
    }

    [HttpGet("charts")]
    public async Task<IActionResult> GetCharts(CancellationToken ct)
    {
        var result = await mediator.Send(new GetChartsQuery(), ct);
        return Ok(result);
    }
}
