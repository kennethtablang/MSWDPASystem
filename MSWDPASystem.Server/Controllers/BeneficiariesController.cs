using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Features.Beneficiaries.DeleteDocument;
using MSWDPASystem.Server.Features.Beneficiaries.DownloadDocument;
using MSWDPASystem.Server.Features.Beneficiaries.GetBeneficiaries;
using MSWDPASystem.Server.Features.Beneficiaries.GetBeneficiary;
using MSWDPASystem.Server.Features.Beneficiaries.GetLinkCandidates;
using MSWDPASystem.Server.Features.Beneficiaries.GetQrCode;
using MSWDPASystem.Server.Features.Beneficiaries.GetSignature;
using MSWDPASystem.Server.Features.Beneficiaries.LinkCitizen;
using MSWDPASystem.Server.Features.Beneficiaries.RegisterBeneficiary;
using MSWDPASystem.Server.Features.Beneficiaries.SaveSignature;
using MSWDPASystem.Server.Features.Beneficiaries.UnlinkCitizen;
using MSWDPASystem.Server.Features.Beneficiaries.UpdateBeneficiary;
using MSWDPASystem.Server.Features.Beneficiaries.UpdateStatus;
using MSWDPASystem.Server.Features.Beneficiaries.UploadDocument;

namespace MSWDPASystem.Server.Controllers;

[ApiController]
[Route("api/beneficiaries")]
[Authorize(Roles = "Admin,MSWDStaff,HeadCoordinator")]
public class BeneficiariesController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetBeneficiaries(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] string? barangay = null,
        [FromQuery] Guid? programId = null,
        [FromQuery] BeneficiaryStatus? status = null,
        CancellationToken ct = default)
    {
        var result = await mediator.Send(
            new GetBeneficiariesQuery(page, pageSize, search, barangay, programId, status), ct);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "MSWDStaff,Admin")]
    public async Task<IActionResult> RegisterBeneficiary(
        [FromBody] RegisterBeneficiaryCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command, ct);
        if (!result.IsSuccess) return BadRequest(new { message = result.Error });
        return CreatedAtAction(nameof(GetBeneficiary), new { id = result.Data!.Id }, result.Data);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetBeneficiary(Guid id, CancellationToken ct)
    {
        var result = await mediator.Send(new GetBeneficiaryQuery(id), ct);
        if (!result.IsSuccess) return NotFound(new { message = result.Error });
        return Ok(result.Data);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "MSWDStaff,Admin")]
    public async Task<IActionResult> UpdateBeneficiary(
        Guid id, [FromBody] UpdateBeneficiaryBody body, CancellationToken ct)
    {
        var result = await mediator.Send(new UpdateBeneficiaryCommand(
            id, body.FirstName, body.MiddleName, body.LastName, body.Suffix,
            body.DateOfBirth, body.Sex, body.CivilStatus, body.Barangay, body.Address,
            body.ContactNumber, body.EmailAddress, body.Occupation, body.MonthlyIncome,
            body.WelfareProgramIds), ct);
        if (!result.IsSuccess) return BadRequest(new { message = result.Error });
        return Ok(result.Data);
    }

    [HttpPost("{id:guid}/documents")]
    [Authorize(Roles = "MSWDStaff,Admin")]
    public async Task<IActionResult> UploadDocument(
        Guid id, IFormFile file,
        [FromForm] string? documentType, [FromForm] string? description,
        CancellationToken ct)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file provided." });

        var result = await mediator.Send(new UploadDocumentCommand(
            id, file.OpenReadStream(), file.FileName, file.ContentType, file.Length,
            documentType, description), ct);

        if (!result.IsSuccess) return BadRequest(new { message = result.Error });
        return Ok(result.Data);
    }

    // Documents hold beneficiary personal data, so they are streamed through this
    // authorized endpoint rather than static-file middleware (FR-6.5, NFR-7.2/7.4).
    [HttpGet("{id:guid}/documents/{docId:guid}/download")]
    public async Task<IActionResult> DownloadDocument(Guid id, Guid docId, CancellationToken ct)
    {
        var result = await mediator.Send(new DownloadDocumentQuery(id, docId), ct);
        if (!result.IsSuccess) return NotFound(new { message = result.Error });

        var file = result.Data!;
        return File(file.Content, file.ContentType, file.FileName);
    }

    [HttpGet("{id:guid}/signature")]
    public async Task<IActionResult> GetSignature(Guid id, CancellationToken ct)
    {
        var result = await mediator.Send(new GetSignatureQuery(id), ct);
        if (!result.IsSuccess) return NotFound(new { message = result.Error });

        var file = result.Data!;
        return File(file.Content, file.ContentType);
    }

    [HttpDelete("{id:guid}/documents/{docId:guid}")]
    [Authorize(Roles = "MSWDStaff,Admin")]
    public async Task<IActionResult> DeleteDocument(Guid id, Guid docId, CancellationToken ct)
    {
        var result = await mediator.Send(new DeleteDocumentCommand(id, docId), ct);
        return result.IsSuccess ? NoContent() : BadRequest(new { message = result.Error });
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize(Roles = "Admin,HeadCoordinator")]
    public async Task<IActionResult> UpdateStatus(
        Guid id, [FromBody] BeneficiaryStatusBody body, CancellationToken ct)
    {
        var result = await mediator.Send(new UpdateBeneficiaryStatusCommand(id, body.Status, body.Notes), ct);
        return result.IsSuccess ? NoContent() : BadRequest(new { message = result.Error });
    }

    [HttpPost("{id:guid}/signature")]
    [Authorize(Roles = "MSWDStaff,Admin")]
    public async Task<IActionResult> SaveSignature(
        Guid id, [FromBody] SaveSignatureBody body, CancellationToken ct)
    {
        var result = await mediator.Send(new SaveSignatureCommand(id, body.SignatureDataUrl), ct);
        if (!result.IsSuccess) return BadRequest(new { message = result.Error });
        return Ok(new { signatureUrl = result.Data });
    }

    [HttpGet("{id:guid}/qr-code")]
    public async Task<IActionResult> GetQrCode(Guid id, CancellationToken ct)
    {
        var result = await mediator.Send(new GetQrCodeQuery(id), ct);
        if (!result.IsSuccess) return NotFound(new { message = result.Error });
        return Ok(new { qrCode = result.Data });
    }

    [HttpGet("{id:guid}/link-candidates")]
    [Authorize(Roles = "MSWDStaff,Admin")]
    public async Task<IActionResult> GetLinkCandidates(Guid id, [FromQuery] string? search, CancellationToken ct)
    {
        var result = await mediator.Send(new GetLinkCandidatesQuery(search), ct);
        return Ok(result);
    }

    [HttpPut("{id:guid}/citizen/{userId}")]
    [Authorize(Roles = "MSWDStaff,Admin")]
    public async Task<IActionResult> LinkCitizen(Guid id, string userId, CancellationToken ct)
    {
        var result = await mediator.Send(new LinkCitizenCommand(id, userId), ct);
        return result.IsSuccess ? NoContent() : BadRequest(new { message = result.Error });
    }

    [HttpDelete("{id:guid}/citizen")]
    [Authorize(Roles = "MSWDStaff,Admin")]
    public async Task<IActionResult> UnlinkCitizen(Guid id, CancellationToken ct)
    {
        var result = await mediator.Send(new UnlinkCitizenCommand(id), ct);
        return result.IsSuccess ? NoContent() : BadRequest(new { message = result.Error });
    }
}

public record BeneficiaryStatusBody(BeneficiaryStatus Status, string? Notes);
public record SaveSignatureBody(string SignatureDataUrl);
public record UpdateBeneficiaryBody(
    string FirstName, string? MiddleName, string LastName, string? Suffix,
    DateOnly DateOfBirth, Sex Sex, CivilStatus CivilStatus,
    string Barangay, string Address, string? ContactNumber,
    string? EmailAddress, string? Occupation, decimal? MonthlyIncome,
    List<Guid>? WelfareProgramIds);
