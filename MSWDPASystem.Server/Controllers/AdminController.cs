using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MSWDPASystem.Server.Features.Admin.CreateAssistanceType;
using MSWDPASystem.Server.Features.Admin.CreateWelfareProgram;
using MSWDPASystem.Server.Features.Admin.GetAssistanceTypes;
using MSWDPASystem.Server.Features.Admin.GetWelfarePrograms;
using MSWDPASystem.Server.Features.Admin.UpdateAssistanceType;
using MSWDPASystem.Server.Features.Admin.UpdateWelfareProgram;

namespace MSWDPASystem.Server.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize]
public class AdminController(IMediator mediator) : ControllerBase
{
    [HttpGet("welfare-programs")]
    public async Task<IActionResult> GetWelfarePrograms(
        [FromQuery] bool activeOnly = true, CancellationToken ct = default)
    {
        var result = await mediator.Send(new GetWelfareProgramsQuery(activeOnly), ct);
        return Ok(result);
    }

    [HttpPost("welfare-programs")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateWelfareProgram(
        [FromBody] CreateWelfareProgramCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command, ct);
        if (!result.IsSuccess) return BadRequest(new { message = result.Error });
        return Created(string.Empty, result.Data);
    }

    [HttpGet("assistance-types")]
    public async Task<IActionResult> GetAssistanceTypes(
        [FromQuery] bool activeOnly = true, CancellationToken ct = default)
    {
        var result = await mediator.Send(new GetAssistanceTypesQuery(activeOnly), ct);
        return Ok(result);
    }

    [HttpPost("assistance-types")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateAssistanceType(
        [FromBody] CreateAssistanceTypeCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command, ct);
        if (!result.IsSuccess) return BadRequest(new { message = result.Error });
        return Created(string.Empty, result.Data);
    }

    [HttpPut("welfare-programs/{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateWelfareProgram(
        Guid id, [FromBody] UpdateWelfareProgramBody body, CancellationToken ct)
    {
        var result = await mediator.Send(
            new UpdateWelfareProgramCommand(id, body.Name, body.Description, body.Code, body.IsActive), ct);
        if (!result.IsSuccess) return BadRequest(new { message = result.Error });
        return Ok(result.Data);
    }

    [HttpPut("assistance-types/{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateAssistanceType(
        Guid id, [FromBody] UpdateAssistanceTypeBody body, CancellationToken ct)
    {
        var result = await mediator.Send(
            new UpdateAssistanceTypeCommand(id, body.Name, body.Description, body.IsActive), ct);
        if (!result.IsSuccess) return BadRequest(new { message = result.Error });
        return Ok(result.Data);
    }
}

public record UpdateWelfareProgramBody(string Name, string? Description, string? Code, bool IsActive);
public record UpdateAssistanceTypeBody(string Name, string? Description, bool IsActive);
