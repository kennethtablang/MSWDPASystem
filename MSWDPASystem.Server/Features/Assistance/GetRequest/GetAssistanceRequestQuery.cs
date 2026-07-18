using MediatR;
using MSWDPASystem.Server.Common.Models;

namespace MSWDPASystem.Server.Features.Assistance.GetRequest;

public record GetAssistanceRequestQuery(Guid Id) : IRequest<Result<AssistanceRequestDetailDto>>;
