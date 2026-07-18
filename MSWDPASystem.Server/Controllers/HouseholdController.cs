using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MSWDPASystem.Server.Features.Household.AssignBeneficiary;
using MSWDPASystem.Server.Features.Household.CreateHousehold;
using MSWDPASystem.Server.Features.Household.GetHousehold;
using MSWDPASystem.Server.Features.Household.GetHouseholds;
using MSWDPASystem.Server.Features.Household.RemoveBeneficiary;

namespace MSWDPASystem.Server.Controllers;

[ApiController]
[Route("api/households")]
[Authorize(Roles = "Admin,MSWDStaff,HeadCoordinator")]
public class HouseholdController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetHouseholds(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var result = await mediator.Send(new GetHouseholdsQuery(search, page, pageSize), ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetHousehold(Guid id, CancellationToken ct)
    {
        var result = await mediator.Send(new GetHouseholdQuery(id), ct);
        return result.IsSuccess ? Ok(result.Data) : NotFound(new { message = result.Error });
    }

    [HttpPost]
    [Authorize(Roles = "MSWDStaff,Admin")]
    public async Task<IActionResult> CreateHousehold([FromBody] CreateHouseholdBody body, CancellationToken ct)
    {
        var result = await mediator.Send(
            new CreateHouseholdCommand(body.Barangay, body.Address, body.HeadOfHouseholdName), ct);
        if (!result.IsSuccess) return BadRequest(new { message = result.Error });
        return CreatedAtAction(nameof(GetHousehold), new { id = result.Data!.Id }, result.Data);
    }

    [HttpPut("{id:guid}/members/{beneficiaryId:guid}")]
    [Authorize(Roles = "MSWDStaff,Admin")]
    public async Task<IActionResult> AssignBeneficiary(Guid id, Guid beneficiaryId, CancellationToken ct)
    {
        var result = await mediator.Send(new AssignBeneficiaryCommand(id, beneficiaryId), ct);
        return result.IsSuccess ? NoContent() : BadRequest(new { message = result.Error });
    }

    [HttpDelete("{id:guid}/members/{beneficiaryId:guid}")]
    [Authorize(Roles = "MSWDStaff,Admin")]
    public async Task<IActionResult> RemoveBeneficiary(Guid id, Guid beneficiaryId, CancellationToken ct)
    {
        var result = await mediator.Send(new RemoveBeneficiaryCommand(id, beneficiaryId), ct);
        return result.IsSuccess ? NoContent() : BadRequest(new { message = result.Error });
    }
}

public record CreateHouseholdBody(string Barangay, string Address, string? HeadOfHouseholdName);
