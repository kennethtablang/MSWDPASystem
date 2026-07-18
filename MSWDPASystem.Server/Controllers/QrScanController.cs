using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MSWDPASystem.Server.Features.QrScan.VerifyQrCode;

namespace MSWDPASystem.Server.Controllers;

[ApiController]
[Route("api/qr-scan")]
[Authorize]
public class QrScanController(IMediator mediator) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Verify([FromBody] VerifyQrCodeRequest body, CancellationToken ct)
    {
        var result = await mediator.Send(new VerifyQrCodeCommand(body.ClientNumber, body.Notes), ct);
        if (!result.IsSuccess) return NotFound(new { message = result.Error });
        return Ok(result.Data);
    }
}

public record VerifyQrCodeRequest(string ClientNumber, string? Notes = null);
