namespace MSWDPASystem.Server.Features.Dashboard.GetChartData;

public record GetChartDataResponse(
    List<MonthlyRequestData> MonthlyRequests,
    List<StatusCount> BeneficiariesByStatus,
    List<TypeCount> AssistanceByType
);

public record MonthlyRequestData(string Month, int Total, int Released);
public record StatusCount(string Status, int Count);
public record TypeCount(string Type, int Count);
