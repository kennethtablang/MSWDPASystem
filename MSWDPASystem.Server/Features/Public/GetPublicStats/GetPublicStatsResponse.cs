namespace MSWDPASystem.Server.Features.Public.GetPublicStats;

public record GetPublicStatsResponse(
    int BeneficiariesServed,
    int AssistanceReleased,
    int ActivePrograms,
    int BarangaysCovered
);
