using MediatR;

namespace MSWDPASystem.Server.Features.Public.GetPublicStats;

public record GetPublicStatsQuery : IRequest<GetPublicStatsResponse>;
