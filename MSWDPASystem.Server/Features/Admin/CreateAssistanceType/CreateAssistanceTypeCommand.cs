using MediatR;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Features.Admin.GetAssistanceTypes;

namespace MSWDPASystem.Server.Features.Admin.CreateAssistanceType;

public record CreateAssistanceTypeCommand(
    string Name, string? Description, Guid? WelfareProgramId
) : IRequest<Result<AssistanceTypeDto>>;
