using MediatR;

namespace MSWDPASystem.Server.Features.Dashboard.GetCharts;

public record GetChartsQuery : IRequest<GetChartsResponse>;

public record GetChartsResponse(
    List<StatusCount> BeneficiaryStatusBreakdown,
    List<MonthlyCount> MonthlyRegistrations,
    List<StatusCount> AssistanceStatusBreakdown
);

public record StatusCount(string Status, int Count);
public record MonthlyCount(string Month, int Count);
