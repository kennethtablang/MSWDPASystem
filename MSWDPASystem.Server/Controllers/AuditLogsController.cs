using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Features.AuditLogs.GetAuditLogs;

namespace MSWDPASystem.Server.Controllers;

[ApiController]
[Route("api/audit-logs")]
[Authorize(Roles = "Admin")]
public class AuditLogsController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetLogs(
        [FromQuery] string? search,
        [FromQuery] AuditAction? action,
        [FromQuery] string? entityType,
        [FromQuery] DateTime? dateFrom,
        [FromQuery] DateTime? dateTo,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 30,
        CancellationToken ct = default)
    {
        var result = await mediator.Send(
            new GetAuditLogsQuery(search, action, entityType, dateFrom, dateTo, page, pageSize), ct);
        return Ok(result);
    }
}
