using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MSWDPASystem.Server.Features.Citizen.GetMyAssistanceRequests;
using MSWDPASystem.Server.Features.Citizen.GetMyProfile;

namespace MSWDPASystem.Server.Controllers;

[ApiController]
[Route("api/citizen")]
[Authorize(Roles = "Citizen")]
public class CitizenController(IMediator mediator) : ControllerBase
{
    [HttpGet("me")]
    public async Task<IActionResult> GetMyProfile(CancellationToken ct)
    {
        var result = await mediator.Send(new GetMyProfileQuery(), ct);
        return Ok(result);
    }

    [HttpGet("assistance-requests")]
    public async Task<IActionResult> GetMyAssistanceRequests(CancellationToken ct)
    {
        var result = await mediator.Send(new GetMyAssistanceRequestsQuery(), ct);
        return Ok(result);
    }
}
