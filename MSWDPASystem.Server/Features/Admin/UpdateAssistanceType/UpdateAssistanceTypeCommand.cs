using MediatR;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Features.Admin.GetAssistanceTypes;

namespace MSWDPASystem.Server.Features.Admin.UpdateAssistanceType;

public record UpdateAssistanceTypeCommand(
    Guid Id,
    string Name,
    string? Description,
    bool IsActive
) : IRequest<Result<AssistanceTypeDto>>;
