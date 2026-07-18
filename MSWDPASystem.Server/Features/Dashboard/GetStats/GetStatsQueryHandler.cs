using MediatR;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Dashboard.GetStats;

public class GetStatsQueryHandler(ApplicationDbContext db)
    : IRequestHandler<GetStatsQuery, GetStatsResponse>
{
    public async Task<GetStatsResponse> Handle(GetStatsQuery request, CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var totalBeneficiaries = await db.Beneficiaries.CountAsync(ct);
        var activeBeneficiaries = await db.Beneficiaries
            .CountAsync(b => b.Status == BeneficiaryStatus.Active || b.Status == BeneficiaryStatus.Verified, ct);
        var flaggedBeneficiaries = await db.Beneficiaries
            .CountAsync(b => b.Status == BeneficiaryStatus.Flagged, ct);

        var totalRequests = await db.AssistanceRequests.CountAsync(ct);
        var pendingApprovals = await db.AssistanceRequests
            .CountAsync(r => r.Status == AssistanceRequestStatus.Submitted || r.Status == AssistanceRequestStatus.UnderReview, ct);

        var releasedThisMonth = await db.AssistanceRequests
            .CountAsync(r => r.Status == AssistanceRequestStatus.Released && r.ReleasedAt >= monthStart, ct);

        var totalReleasedAllTime = await db.AssistanceRequests
            .CountAsync(r => r.Status == AssistanceRequestStatus.Released, ct);

        var totalAmountThisMonth = await db.AssistanceRequests
            .Where(r => r.Status == AssistanceRequestStatus.Released && r.ReleasedAt >= monthStart && r.Amount != null)
            .SumAsync(r => r.Amount!.Value, ct);

        return new GetStatsResponse(
            totalBeneficiaries,
            activeBeneficiaries,
            flaggedBeneficiaries,
            totalRequests,
            pendingApprovals,
            releasedThisMonth,
            totalReleasedAllTime,
            totalAmountThisMonth
        );
    }
}
