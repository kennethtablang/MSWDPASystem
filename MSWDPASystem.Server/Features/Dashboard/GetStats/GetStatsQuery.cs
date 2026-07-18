using MediatR;

namespace MSWDPASystem.Server.Features.Dashboard.GetStats;

public record GetStatsQuery : IRequest<GetStatsResponse>;
