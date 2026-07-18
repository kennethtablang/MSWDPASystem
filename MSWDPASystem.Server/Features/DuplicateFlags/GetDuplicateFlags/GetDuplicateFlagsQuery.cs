using MediatR;
using MSWDPASystem.Server.Domain.Enums;

namespace MSWDPASystem.Server.Features.DuplicateFlags.GetDuplicateFlags;

public record GetDuplicateFlagsQuery(DuplicateFlagStatus? Status = null) : IRequest<List<DuplicateFlagDto>>;
