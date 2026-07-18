namespace MSWDPASystem.Server.Features.Dashboard.GetStats;

public record GetStatsResponse(
    int TotalBeneficiaries,
    int ActiveBeneficiaries,
    int FlaggedBeneficiaries,
    int TotalAssistanceRequests,
    int PendingApprovals,
    int ReleasedThisMonth,
    int TotalReleasedAllTime,
    decimal TotalAmountReleasedThisMonth
);
