using MediatR;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Dashboard.GetChartData;

public class GetChartDataQueryHandler(ApplicationDbContext db)
    : IRequestHandler<GetChartDataQuery, GetChartDataResponse>
{
    public async Task<GetChartDataResponse> Handle(GetChartDataQuery request, CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var start = new DateTime(now.AddMonths(-5).Year, now.AddMonths(-5).Month, 1);

        var requests = await db.AssistanceRequests
            .Where(r => r.CreatedAt >= start)
            .Select(r => new { r.CreatedAt, r.Status })
            .ToListAsync(ct);

        var monthlyRequests = Enumerable.Range(0, 6).Select(i =>
        {
            var month = now.AddMonths(-5 + i);
            var mStart = new DateTime(month.Year, month.Month, 1);
            var mEnd = mStart.AddMonths(1);
            var inMonth = requests.Where(r => r.CreatedAt >= mStart && r.CreatedAt < mEnd).ToList();
            return new MonthlyRequestData(
                month.ToString("MMM yy"),
                inMonth.Count,
                inMonth.Count(r => r.Status == AssistanceRequestStatus.Released));
        }).ToList();

        var byStatus = await db.Beneficiaries
            .GroupBy(b => b.Status)
            .Select(g => new StatusCount(g.Key.ToString(), g.Count()))
            .ToListAsync(ct);

        var byType = await db.AssistanceRequests
            .GroupBy(r => r.AssistanceType.Name)
            .Select(g => new TypeCount(g.Key, g.Count()))
            .OrderByDescending(t => t.Count)
            .Take(5)
            .ToListAsync(ct);

        return new GetChartDataResponse(monthlyRequests, byStatus, byType);
    }
}
