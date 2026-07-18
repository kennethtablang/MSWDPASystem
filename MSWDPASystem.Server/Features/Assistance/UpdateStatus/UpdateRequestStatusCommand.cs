using MediatR;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Domain.Enums;

namespace MSWDPASystem.Server.Features.Assistance.UpdateStatus;

public record UpdateRequestStatusCommand(
    Guid Id,
    AssistanceRequestStatus NewStatus,
    string? Notes,
    string? DenialReason
) : IRequest<Result<bool>>;
