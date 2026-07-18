using ClosedXML.Excel;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Features.Reports.GetSummary;
using MSWDPASystem.Server.Features.Reports.Pdf;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize(Roles = "Admin,HeadCoordinator")]
public class ReportsController(ApplicationDbContext db, IMediator mediator) : ControllerBase
{
    // ---- Statistical summary (daily / monthly / annual) ----

    [HttpGet("summary")]
    public async Task<IActionResult> Summary(
        [FromQuery] ReportPeriod period,
        [FromQuery] DateTime? referenceDate,
        [FromQuery] string? barangay,
        [FromQuery] Guid? programId,
        CancellationToken ct)
    {
        var result = await mediator.Send(new GetReportSummaryQuery(period, referenceDate, barangay, programId), ct);
        return Ok(result);
    }

    [HttpGet("summary/pdf")]
    public async Task<IActionResult> SummaryPdf(
        [FromQuery] ReportPeriod period,
        [FromQuery] DateTime? referenceDate,
        [FromQuery] string? barangay,
        [FromQuery] Guid? programId,
        CancellationToken ct)
    {
        var summary = await mediator.Send(new GetReportSummaryQuery(period, referenceDate, barangay, programId), ct);
        var pdf = ReportPdfBuilder.BuildSummary(summary);
        return File(pdf, "application/pdf", $"summary_{period}_{DateTime.Now:yyyyMMdd}.pdf");
    }

    // ---- Beneficiaries list ----

    [HttpGet("beneficiaries")]
    public async Task<IActionResult> BeneficiariesExcel(
        [FromQuery] string? barangay,
        [FromQuery] BeneficiaryStatus? status,
        [FromQuery] Guid? programId,
        CancellationToken ct)
    {
        var list = await QueryBeneficiaries(barangay, status, programId, ct);

        using var wb = new XLWorkbook();
        var ws = wb.Worksheets.Add("Beneficiaries");

        var headers = new[] { "Client No.", "Last Name", "First Name", "Middle Name", "Date of Birth",
            "Sex", "Civil Status", "Barangay", "Address", "Contact No.", "Email", "Occupation",
            "Monthly Income", "Status", "Programs", "Registered On" };

        for (int i = 0; i < headers.Length; i++)
        {
            var cell = ws.Cell(1, i + 1);
            cell.Value = headers[i];
            cell.Style.Font.Bold = true;
            cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#1e40af");
            cell.Style.Font.FontColor = XLColor.White;
        }

        for (int r = 0; r < list.Count; r++)
        {
            var b = list[r];
            int row = r + 2;
            ws.Cell(row, 1).Value = b.ClientNumber;
            ws.Cell(row, 2).Value = b.LastName;
            ws.Cell(row, 3).Value = b.FirstName;
            ws.Cell(row, 4).Value = b.MiddleName ?? "";
            ws.Cell(row, 5).Value = b.DateOfBirth.ToString("yyyy-MM-dd");
            ws.Cell(row, 6).Value = b.Sex.ToString();
            ws.Cell(row, 7).Value = b.CivilStatus.ToString();
            ws.Cell(row, 8).Value = b.Barangay;
            ws.Cell(row, 9).Value = b.Address;
            ws.Cell(row, 10).Value = b.ContactNumber ?? "";
            ws.Cell(row, 11).Value = b.EmailAddress ?? "";
            ws.Cell(row, 12).Value = b.Occupation ?? "";
            ws.Cell(row, 13).Value = b.MonthlyIncome?.ToString("F2") ?? "";
            ws.Cell(row, 14).Value = b.Status.ToString();
            ws.Cell(row, 15).Value = string.Join(", ", b.Programs.Where(p => p.IsActive).Select(p => p.WelfareProgram.Name));
            ws.Cell(row, 16).Value = b.CreatedAt.ToString("yyyy-MM-dd");
        }

        ws.Columns().AdjustToContents();

        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        ms.Position = 0;

        var filename = $"beneficiaries_{DateTime.Now:yyyyMMdd}.xlsx";
        return File(ms.ToArray(),
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            filename);
    }

    [HttpGet("assistance")]
    public async Task<IActionResult> AssistanceExcel(
        [FromQuery] AssistanceRequestStatus? status,
        [FromQuery] DateTime? dateFrom,
        [FromQuery] DateTime? dateTo,
        [FromQuery] string? barangay,
        [FromQuery] Guid? programId,
        CancellationToken ct)
    {
        var list = await QueryAssistance(status, dateFrom, dateTo, barangay, programId, ct);

        using var wb = new XLWorkbook();
        var ws = wb.Worksheets.Add("Assistance Requests");

        var headers = new[] { "Request No.", "Client No.", "Beneficiary Name", "Assistance Type",
            "Welfare Program", "Amount", "Purpose", "Status", "Denial Reason", "Submitted", "Reviewed", "Approved", "Released" };

        for (int i = 0; i < headers.Length; i++)
        {
            var cell = ws.Cell(1, i + 1);
            cell.Value = headers[i];
            cell.Style.Font.Bold = true;
            cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#1e40af");
            cell.Style.Font.FontColor = XLColor.White;
        }

        for (int r = 0; r < list.Count; r++)
        {
            var req = list[r];
            int row = r + 2;
            ws.Cell(row, 1).Value = req.RequestNumber;
            ws.Cell(row, 2).Value = req.Beneficiary.ClientNumber;
            ws.Cell(row, 3).Value = req.Beneficiary.FirstName + " " + req.Beneficiary.LastName;
            ws.Cell(row, 4).Value = req.AssistanceType.Name;
            ws.Cell(row, 5).Value = req.WelfareProgram?.Name ?? "";
            ws.Cell(row, 6).Value = req.Amount?.ToString("F2") ?? "";
            ws.Cell(row, 7).Value = req.Purpose ?? "";
            ws.Cell(row, 8).Value = req.Status.ToString();
            ws.Cell(row, 9).Value = req.DenialReason ?? "";
            ws.Cell(row, 10).Value = req.CreatedAt.ToString("yyyy-MM-dd");
            ws.Cell(row, 11).Value = req.ReviewedAt?.ToString("yyyy-MM-dd") ?? "";
            ws.Cell(row, 12).Value = req.ApprovedAt?.ToString("yyyy-MM-dd") ?? "";
            ws.Cell(row, 13).Value = req.ReleasedAt?.ToString("yyyy-MM-dd") ?? "";
        }

        ws.Columns().AdjustToContents();

        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        ms.Position = 0;

        var filename = $"assistance_{DateTime.Now:yyyyMMdd}.xlsx";
        return File(ms.ToArray(),
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            filename);
    }

    [HttpGet("beneficiaries/pdf")]
    public async Task<IActionResult> BeneficiariesPdf(
        [FromQuery] string? barangay,
        [FromQuery] BeneficiaryStatus? status,
        [FromQuery] Guid? programId,
        CancellationToken ct)
    {
        var list = await QueryBeneficiaries(barangay, status, programId, ct);
        var asOf = DateTime.Today;

        var rows = list.Select(b =>
        {
            var age = asOf.Year - b.DateOfBirth.Year;
            if (b.DateOfBirth > DateOnly.FromDateTime(asOf).AddYears(-age)) age--;
            return new BeneficiaryRow(
                b.ClientNumber, b.FullName, b.Sex.ToString(), age,
                b.Barangay,
                string.Join(", ", b.Programs.Where(p => p.IsActive).Select(p => p.WelfareProgram.Name)),
                b.Status.ToString(), b.CreatedAt.ToString("yyyy-MM-dd"));
        }).ToList();

        var pdf = ReportPdfBuilder.BuildBeneficiaryList(rows, barangay, status?.ToString());
        return File(pdf, "application/pdf", $"beneficiaries_{DateTime.Now:yyyyMMdd}.pdf");
    }

    [HttpGet("assistance/pdf")]
    public async Task<IActionResult> AssistancePdf(
        [FromQuery] AssistanceRequestStatus? status,
        [FromQuery] DateTime? dateFrom,
        [FromQuery] DateTime? dateTo,
        [FromQuery] string? barangay,
        [FromQuery] Guid? programId,
        CancellationToken ct)
    {
        var list = await QueryAssistance(status, dateFrom, dateTo, barangay, programId, ct);

        var rows = list.Select(r => new AssistanceRow(
            r.RequestNumber,
            $"{r.Beneficiary.FirstName} {r.Beneficiary.LastName}",
            r.AssistanceType.Name,
            r.WelfareProgram?.Name ?? "—",
            r.Amount?.ToString("N2") ?? "—",
            r.Status.ToString(),
            r.CreatedAt.ToString("yyyy-MM-dd"),
            r.ReleasedAt?.ToString("yyyy-MM-dd") ?? "—")).ToList();

        var pdf = ReportPdfBuilder.BuildAssistanceList(rows, status?.ToString(), dateFrom, dateTo);
        return File(pdf, "application/pdf", $"assistance_{DateTime.Now:yyyyMMdd}.pdf");
    }

    // ---- shared queries ----

    private async Task<List<Domain.Entities.Beneficiary>> QueryBeneficiaries(
        string? barangay, BeneficiaryStatus? status, Guid? programId, CancellationToken ct)
    {
        var query = db.Beneficiaries
            .AsNoTracking()
            .Include(b => b.Programs).ThenInclude(bp => bp.WelfareProgram)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(barangay))
            query = query.Where(b => b.Barangay == barangay);

        if (status.HasValue)
            query = query.Where(b => b.Status == status.Value);

        if (programId.HasValue)
            query = query.Where(b => b.Programs.Any(p => p.WelfareProgramId == programId));

        return await query.OrderBy(b => b.LastName).ThenBy(b => b.FirstName).ToListAsync(ct);
    }

    private async Task<List<Domain.Entities.AssistanceRequest>> QueryAssistance(
        AssistanceRequestStatus? status, DateTime? dateFrom, DateTime? dateTo,
        string? barangay, Guid? programId, CancellationToken ct)
    {
        var query = db.AssistanceRequests
            .AsNoTracking()
            .Include(r => r.Beneficiary)
            .Include(r => r.AssistanceType)
            .Include(r => r.WelfareProgram)
            .AsQueryable();

        if (status.HasValue)
            query = query.Where(r => r.Status == status.Value);

        if (dateFrom.HasValue)
            query = query.Where(r => r.CreatedAt >= dateFrom.Value);

        if (dateTo.HasValue)
            query = query.Where(r => r.CreatedAt <= dateTo.Value.AddDays(1));

        if (!string.IsNullOrWhiteSpace(barangay))
            query = query.Where(r => r.Beneficiary.Barangay == barangay);

        if (programId.HasValue)
            query = query.Where(r => r.WelfareProgramId == programId);

        return await query.OrderByDescending(r => r.CreatedAt).ToListAsync(ct);
    }
}
