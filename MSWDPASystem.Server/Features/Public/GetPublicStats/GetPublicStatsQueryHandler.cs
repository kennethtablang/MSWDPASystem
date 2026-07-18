using MediatR;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Public.GetPublicStats;

public class GetPublicStatsQueryHandler(ApplicationDbContext db)
    : IRequestHandler<GetPublicStatsQuery, GetPublicStatsResponse>
{
    public async Task<GetPublicStatsResponse> Handle(GetPublicStatsQuery request, CancellationToken ct)
    {
        var beneficiariesServed = await db.Beneficiaries.CountAsync(ct);
        var assistanceReleased = await db.AssistanceRequests
            .CountAsync(r => r.Status == AssistanceRequestStatus.Released, ct);
        var activePrograms = await db.WelfarePrograms.CountAsync(p => p.IsActive, ct);
        var barangaysCovered = await db.Beneficiaries
            .Where(b => b.Barangay != "")
            .Select(b => b.Barangay)
            .Distinct()
            .CountAsync(ct);

        return new GetPublicStatsResponse(
            beneficiariesServed,
            assistanceReleased,
            activePrograms,
            barangaysCovered
        );
    }
}
