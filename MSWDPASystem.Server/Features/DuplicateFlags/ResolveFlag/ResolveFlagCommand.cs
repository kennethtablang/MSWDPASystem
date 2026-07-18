using MediatR;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Domain.Enums;

namespace MSWDPASystem.Server.Features.DuplicateFlags.ResolveFlag;

public record ResolveFlagCommand(
    Guid Id,
    DuplicateFlagStatus Resolution,
    string? Notes
) : IRequest<Result>;
