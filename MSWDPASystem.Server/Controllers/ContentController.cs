using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Features.Content.DeleteContentItem;
using MSWDPASystem.Server.Features.Content.GetContentItems;
using MSWDPASystem.Server.Features.Content.SaveContentItem;

namespace MSWDPASystem.Server.Controllers;

/// <summary>
/// Staff management of landing-page content. Writing to the public site is
/// restricted to administrators and head coordinators — ordinary MSWD staff
/// have no reason to change what the municipality publishes.
/// </summary>
[ApiController]
[Route("api/content")]
[Authorize(Roles = "Admin,HeadCoordinator")]
public class ContentController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] ContentType? type,
        [FromQuery] string? search,
        [FromQuery] bool includeDeleted = false,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
        => Ok(await mediator.Send(
            new GetContentItemsQuery(type, search, includeDeleted, page, pageSize), ct));

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] SaveContentItemCommand command, CancellationToken ct)
    {
        // Ignore any Id the client supplied: this route always creates.
        var result = await mediator.Send(command with { Id = null }, ct);
        if (!result.IsSuccess)
            return BadRequest(new { message = result.Error, errors = result.Errors });
        return Ok(result.Data);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id, [FromBody] SaveContentItemCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command with { Id = id }, ct);
        if (!result.IsSuccess)
            return BadRequest(new { message = result.Error, errors = result.Errors });
        return Ok(result.Data);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var result = await mediator.Send(new DeleteContentItemCommand(id), ct);
        if (!result.IsSuccess)
            return NotFound(new { message = result.Error });
        return Ok(new { message = "Item removed from the public site." });
    }

    [HttpPost("{id:guid}/restore")]
    public async Task<IActionResult> Restore(Guid id, CancellationToken ct)
    {
        var result = await mediator.Send(new DeleteContentItemCommand(id, Restore: true), ct);
        if (!result.IsSuccess)
            return NotFound(new { message = result.Error });
        return Ok(new { message = "Item restored." });
    }
}
