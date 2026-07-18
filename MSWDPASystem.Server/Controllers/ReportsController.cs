using ClosedXML.Excel;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize]
public class ReportsController(ApplicationDbContext db) : ControllerBase
{
    [HttpGet("beneficiaries")]
    public async Task<IActionResult> BeneficiariesExcel(
        [FromQuery] string? barangay,
        [FromQuery] BeneficiaryStatus? status,
        CancellationToken ct)
    {
        var query = db.Beneficiaries
            .Include(b => b.Programs).ThenInclude(bp => bp.WelfareProgram)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(barangay))
            query = query.Where(b => b.Barangay == barangay);

        if (status.HasValue)
            query = query.Where(b => b.Status == status.Value);

        var list = await query.OrderBy(b => b.LastName).ThenBy(b => b.FirstName).ToListAsync(ct);

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
        CancellationToken ct)
    {
        var query = db.AssistanceRequests
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

        var list = await query.OrderByDescending(r => r.CreatedAt).ToListAsync(ct);

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
}
