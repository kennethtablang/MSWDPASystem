using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Features.DuplicateFlags.GetDuplicateFlags;
using MSWDPASystem.Server.Features.DuplicateFlags.MergeDuplicate;
using MSWDPASystem.Server.Features.DuplicateFlags.ResolveFlag;

namespace MSWDPASystem.Server.Controllers;

[ApiController]
[Route("api/duplicate-flags")]
[Authorize(Roles = "Admin,HeadCoordinator")]
public class DuplicateFlagsController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetFlags([FromQuery] DuplicateFlagStatus? status, CancellationToken ct)
    {
        var result = await mediator.Send(new GetDuplicateFlagsQuery(status), ct);
        return Ok(result);
    }

    [HttpPut("{id:guid}/resolve")]
    [Authorize(Roles = "Admin,HeadCoordinator")]
    public async Task<IActionResult> Resolve(Guid id, [FromBody] ResolveFlagRequest body, CancellationToken ct)
    {
        var result = await mediator.Send(new ResolveFlagCommand(id, body.Resolution, body.Notes), ct);
        return result.IsSuccess ? NoContent() : BadRequest(new { message = result.Error });
    }

    // FR-3.6: resolve by merging the duplicate into the surviving record.
    [HttpPut("{id:guid}/merge")]
    public async Task<IActionResult> Merge(Guid id, [FromBody] MergeDuplicateRequest body, CancellationToken ct)
    {
        var result = await mediator.Send(new MergeDuplicateCommand(id, body.KeepBeneficiaryId, body.Notes), ct);
        return result.IsSuccess ? Ok(result.Data) : BadRequest(new { message = result.Error });
    }
}

public record ResolveFlagRequest(DuplicateFlagStatus Resolution, string? Notes);

public record MergeDuplicateRequest(Guid KeepBeneficiaryId, string? Notes);
