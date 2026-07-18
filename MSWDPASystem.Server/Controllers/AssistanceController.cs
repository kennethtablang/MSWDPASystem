using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Features.Assistance.CreateRequest;
using MSWDPASystem.Server.Features.Assistance.GetRequest;
using MSWDPASystem.Server.Features.Assistance.GetRequests;
using MSWDPASystem.Server.Features.Assistance.UpdateStatus;

namespace MSWDPASystem.Server.Controllers;

[ApiController]
[Route("api/assistance")]
[Authorize]
public class AssistanceController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetRequests(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] Guid? beneficiaryId = null,
        [FromQuery] AssistanceRequestStatus? status = null,
        [FromQuery] Guid? programId = null,
        [FromQuery] DateTime? dateFrom = null,
        [FromQuery] DateTime? dateTo = null,
        CancellationToken ct = default)
    {
        var result = await mediator.Send(
            new GetAssistanceRequestsQuery(page, pageSize, beneficiaryId, status, programId, dateFrom, dateTo), ct);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "MSWDStaff,Admin")]
    public async Task<IActionResult> CreateRequest(
        [FromBody] CreateAssistanceRequestCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command, ct);
        if (!result.IsSuccess) return BadRequest(new { message = result.Error });
        return CreatedAtAction(nameof(GetRequest), new { id = result.Data!.Id }, result.Data);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetRequest(Guid id, CancellationToken ct)
    {
        var result = await mediator.Send(new GetAssistanceRequestQuery(id), ct);
        if (!result.IsSuccess) return NotFound(new { message = result.Error });
        return Ok(result.Data);
    }

    [HttpPut("{id:guid}/status")]
    [Authorize(Roles = "HeadCoordinator,Admin")]
    public async Task<IActionResult> UpdateStatus(
        Guid id, [FromBody] AssistanceStatusBody body, CancellationToken ct)
    {
        var result = await mediator.Send(
            new UpdateRequestStatusCommand(id, body.NewStatus, body.Notes, body.DenialReason), ct);
        if (!result.IsSuccess) return BadRequest(new { message = result.Error });
        return Ok(new { message = "Status updated successfully." });
    }
}

public record AssistanceStatusBody(
    AssistanceRequestStatus NewStatus,
    string? Notes,
    string? DenialReason);
