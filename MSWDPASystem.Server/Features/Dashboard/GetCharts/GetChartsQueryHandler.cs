using MediatR;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Dashboard.GetCharts;

public class GetChartsQueryHandler(ApplicationDbContext db)
    : IRequestHandler<GetChartsQuery, GetChartsResponse>
{
    public async Task<GetChartsResponse> Handle(GetChartsQuery request, CancellationToken ct)
    {
        var beneficiaryStatuses = await db.Beneficiaries
            .GroupBy(b => b.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync(ct);

        var beneficiaryBreakdown = Enum.GetValues<BeneficiaryStatus>()
            .Select(s => new StatusCount(
                s.ToString(),
                beneficiaryStatuses.FirstOrDefault(x => x.Status == s)?.Count ?? 0))
            .ToList();

        var assistanceStatuses = await db.AssistanceRequests
            .GroupBy(r => r.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync(ct);

        var assistanceBreakdown = Enum.GetValues<AssistanceRequestStatus>()
            .Select(s => new StatusCount(
                s.ToString(),
                assistanceStatuses.FirstOrDefault(x => x.Status == s)?.Count ?? 0))
            .ToList();

        var sixMonthsAgo = DateTime.UtcNow.AddMonths(-5);
        var monthStart = new DateTime(sixMonthsAgo.Year, sixMonthsAgo.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var monthly = await db.Beneficiaries
            .Where(b => b.CreatedAt >= monthStart)
            .GroupBy(b => new { b.CreatedAt.Year, b.CreatedAt.Month })
            .Select(g => new { g.Key.Year, g.Key.Month, Count = g.Count() })
            .ToListAsync(ct);

        var monthlyRegistrations = Enumerable.Range(0, 6)
            .Select(i =>
            {
                var d = DateTime.UtcNow.AddMonths(-5 + i);
                var count = monthly.FirstOrDefault(m => m.Year == d.Year && m.Month == d.Month)?.Count ?? 0;
                return new MonthlyCount(d.ToString("MMM yyyy"), count);
            })
            .ToList();

        return new GetChartsResponse(beneficiaryBreakdown, monthlyRegistrations, assistanceBreakdown);
    }
}
