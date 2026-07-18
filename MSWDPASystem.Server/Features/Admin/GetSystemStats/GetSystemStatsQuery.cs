using MediatR;

namespace MSWDPASystem.Server.Features.Admin.GetSystemStats;

public record GetSystemStatsQuery : IRequest<GetSystemStatsResponse>;

public record GetSystemStatsResponse(
    int TotalUsers,
    int ActiveUsers,
    List<LabelCount> UsersByRole,
    int TotalBeneficiaries,
    List<LabelCount> BeneficiariesByStatus,
    int TotalHouseholds,
    int TotalAssistanceRequests,
    int PendingAssistance,
    List<LabelCount> AssistanceByStatus,
    decimal TotalAmountReleased,
    int TotalDocuments,
    int TotalQrScans,
    int QrScansLast24h,
    int TotalAuditEvents,
    int AuditEventsLast24h,
    List<RecentActivityDto> RecentActivity,
    DateTime ServerTimeUtc);

public record LabelCount(string Label, int Count);

public record RecentActivityDto(
    string Action,
    string? UserName,
    string? Description,
    string EntityType,
    DateTime Timestamp);
