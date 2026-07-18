using MediatR;
using MSWDPASystem.Server.Common.Models;

namespace MSWDPASystem.Server.Features.Assistance.CreateRequest;

public record CreateAssistanceRequestCommand(
    Guid BeneficiaryId,
    Guid AssistanceTypeId,
    Guid? WelfareProgramId,
    decimal? Amount,
    string? Purpose
) : IRequest<Result<CreateAssistanceRequestResponse>>;
