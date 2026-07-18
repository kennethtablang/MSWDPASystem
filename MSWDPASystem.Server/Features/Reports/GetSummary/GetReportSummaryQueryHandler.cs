using MediatR;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Reports.GetSummary;

public class GetReportSummaryQueryHandler(ApplicationDbContext db)
    : IRequestHandler<GetReportSummaryQuery, ReportSummaryDto>
{
    public async Task<ReportSummaryDto> Handle(GetReportSummaryQuery request, CancellationToken ct)
    {
        var (start, end, label) = ResolveRange(request.Period, request.ReferenceDate);

        string? programName = null;
        if (request.ProgramId.HasValue)
            programName = await db.WelfarePrograms
                .Where(p => p.Id == request.ProgramId)
                .Select(p => p.Name)
                .FirstOrDefaultAsync(ct);

        // ---- Registrations in period (demographics) ----
        var regQuery = db.Beneficiaries
            .AsNoTracking()
            .Include(b => b.Programs).ThenInclude(p => p.WelfareProgram)
            .Where(b => b.CreatedAt >= start && b.CreatedAt < end);

        if (!string.IsNullOrWhiteSpace(request.Barangay))
            regQuery = regQuery.Where(b => b.Barangay == request.Barangay);

        if (request.ProgramId.HasValue)
            regQuery = regQuery.Where(b => b.Programs.Any(p => p.WelfareProgramId == request.ProgramId));

        var registrations = await regQuery.ToListAsync(ct);
        var referenceForAge = end.AddDays(-1);

        var bySex = Enum.GetValues<Sex>()
            .Select(s => new LabelCount(s.ToString(), registrations.Count(b => b.Sex == s)))
            .Where(x => x.Count > 0)
            .ToList();

        var byAgeGroup = BuildAgeGroups(registrations, referenceForAge);

        var byBarangay = registrations
            .GroupBy(b => b.Barangay)
            .Select(g => new LabelCount(g.Key, g.Count()))
            .OrderByDescending(x => x.Count)
            .Take(10)
            .ToList();

        var byProgram = registrations
            .SelectMany(b => b.Programs.Where(p => p.IsActive).Select(p => p.WelfareProgram.Name))
            .GroupBy(name => name)
            .Select(g => new LabelCount(g.Key, g.Count()))
            .OrderByDescending(x => x.Count)
            .ToList();

        // ---- Assistance transactions in period (distribution) ----
        var asstQuery = db.AssistanceRequests
            .AsNoTracking()
            .Include(r => r.AssistanceType)
            .Include(r => r.Beneficiary)
            .Where(r => r.CreatedAt >= start && r.CreatedAt < end);

        if (!string.IsNullOrWhiteSpace(request.Barangay))
            asstQuery = asstQuery.Where(r => r.Beneficiary.Barangay == request.Barangay);

        if (request.ProgramId.HasValue)
            asstQuery = asstQuery.Where(r => r.WelfareProgramId == request.ProgramId);

        var requests = await asstQuery.ToListAsync(ct);

        var byStatus = Enum.GetValues<AssistanceRequestStatus>()
            .Select(s => new LabelCount(s.ToString(), requests.Count(r => r.Status == s)))
            .Where(x => x.Count > 0)
            .ToList();

        var byType = requests
            .GroupBy(r => r.AssistanceType.Name)
            .Select(g => new LabelAmount(
                g.Key,
                g.Count(),
                g.Where(r => r.Status == AssistanceRequestStatus.Released).Sum(r => r.Amount ?? 0)))
            .OrderByDescending(x => x.Count)
            .ToList();

        var totalReleased = requests
            .Where(r => r.Status == AssistanceRequestStatus.Released)
            .Sum(r => r.Amount ?? 0);

        return new ReportSummaryDto(
            request.Period.ToString(),
            label,
            start,
            end,
            request.Barangay,
            programName,
            registrations.Count,
            bySex,
            byAgeGroup,
            byBarangay,
            byProgram,
            requests.Count,
            totalReleased,
            byStatus,
            byType);
    }

    private static (DateTime start, DateTime end, string label) ResolveRange(ReportPeriod period, DateTime? reference)
    {
        var refDate = (reference ?? DateTime.UtcNow).Date;
        return period switch
        {
            ReportPeriod.Daily => (
                refDate,
                refDate.AddDays(1),
                refDate.ToString("MMMM d, yyyy")),
            ReportPeriod.Annual => (
                new DateTime(refDate.Year, 1, 1),
                new DateTime(refDate.Year + 1, 1, 1),
                refDate.ToString("yyyy")),
            _ => (
                new DateTime(refDate.Year, refDate.Month, 1),
                new DateTime(refDate.Year, refDate.Month, 1).AddMonths(1),
                refDate.ToString("MMMM yyyy")),
        };
    }

    private static List<LabelCount> BuildAgeGroups(
        IEnumerable<Domain.Entities.Beneficiary> beneficiaries, DateTime asOf)
    {
        string Bucket(int age) => age switch
        {
            < 18 => "0–17",
            <= 30 => "18–30",
            <= 45 => "31–45",
            <= 59 => "46–59",
            _ => "60+",
        };

        var order = new[] { "0–17", "18–30", "31–45", "46–59", "60+" };

        var grouped = beneficiaries
            .Select(b =>
            {
                var age = asOf.Year - b.DateOfBirth.Year;
                if (b.DateOfBirth > DateOnly.FromDateTime(asOf).AddYears(-age)) age--;
                return Bucket(age);
            })
            .GroupBy(x => x)
            .ToDictionary(g => g.Key, g => g.Count());

        return order
            .Where(b => grouped.ContainsKey(b))
            .Select(b => new LabelCount(b, grouped[b]))
            .ToList();
    }
}
