using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Domain.Entities;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Admin.GetSystemStats;

public class GetSystemStatsQueryHandler(
    ApplicationDbContext db,
    RoleManager<IdentityRole> roleManager)
    : IRequestHandler<GetSystemStatsQuery, GetSystemStatsResponse>
{
    public async Task<GetSystemStatsResponse> Handle(GetSystemStatsQuery request, CancellationToken ct)
    {
        var since24h = DateTime.UtcNow.AddHours(-24);

        var totalUsers = await db.Users.CountAsync(ct);
        var activeUsers = await db.Users.CountAsync(u => u.IsActive, ct);

        // Users by role (join AspNetUserRoles → AspNetRoles).
        var roles = await roleManager.Roles.Select(r => new { r.Id, r.Name }).ToListAsync(ct);
        var roleCounts = await db.Set<IdentityUserRole<string>>()
            .GroupBy(ur => ur.RoleId)
            .Select(g => new { RoleId = g.Key, Count = g.Count() })
            .ToListAsync(ct);
        var usersByRole = roles
            .Select(r => new LabelCount(
                r.Name ?? "—",
                roleCounts.FirstOrDefault(rc => rc.RoleId == r.Id)?.Count ?? 0))
            .OrderByDescending(x => x.Count)
            .ToList();

        var totalBeneficiaries = await db.Beneficiaries.CountAsync(ct);
        var beneficiaryStatusRaw = await db.Beneficiaries
            .GroupBy(b => b.Status)
            .Select(g => new { g.Key, Count = g.Count() })
            .ToListAsync(ct);
        var beneficiariesByStatus = Enum.GetValues<BeneficiaryStatus>()
            .Select(s => new LabelCount(s.ToString(), beneficiaryStatusRaw.FirstOrDefault(x => x.Key == s)?.Count ?? 0))
            .Where(x => x.Count > 0)
            .ToList();

        var totalHouseholds = await db.Households.CountAsync(ct);

        var totalAssistance = await db.AssistanceRequests.CountAsync(ct);
        var assistanceStatusRaw = await db.AssistanceRequests
            .GroupBy(r => r.Status)
            .Select(g => new { g.Key, Count = g.Count() })
            .ToListAsync(ct);
        var assistanceByStatus = Enum.GetValues<AssistanceRequestStatus>()
            .Select(s => new LabelCount(s.ToString(), assistanceStatusRaw.FirstOrDefault(x => x.Key == s)?.Count ?? 0))
            .Where(x => x.Count > 0)
            .ToList();
        var pending = assistanceStatusRaw
            .Where(x => x.Key == AssistanceRequestStatus.Submitted || x.Key == AssistanceRequestStatus.UnderReview)
            .Sum(x => x.Count);
        var totalReleased = await db.AssistanceRequests
            .Where(r => r.Status == AssistanceRequestStatus.Released)
            .SumAsync(r => r.Amount ?? 0, ct);

        var totalDocuments = await db.Documents.CountAsync(ct);
        var totalQrScans = await db.QrScanLogs.CountAsync(ct);
        var qrScans24h = await db.QrScanLogs.CountAsync(q => q.CreatedAt >= since24h, ct);

        var totalAudit = await db.AuditLogs.CountAsync(ct);
        var audit24h = await db.AuditLogs.CountAsync(a => a.Timestamp >= since24h, ct);

        var recent = await db.AuditLogs
            .OrderByDescending(a => a.Timestamp)
            .Take(12)
            .Select(a => new RecentActivityDto(
                a.Action.ToString(),
                a.UserName,
                a.Description,
                a.EntityType,
                a.Timestamp))
            .ToListAsync(ct);

        return new GetSystemStatsResponse(
            totalUsers, activeUsers, usersByRole,
            totalBeneficiaries, beneficiariesByStatus,
            totalHouseholds,
            totalAssistance, pending, assistanceByStatus, totalReleased,
            totalDocuments,
            totalQrScans, qrScans24h,
            totalAudit, audit24h,
            recent,
            DateTime.UtcNow);
    }
}
