using MediatR;

namespace MSWDPASystem.Server.Features.Dashboard.GetChartData;

public record GetChartDataQuery : IRequest<GetChartDataResponse>;
