using MediatR;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Domain.Enums;

namespace MSWDPASystem.Server.Features.Assistance.GetRequests;

public record GetAssistanceRequestsQuery(
    int Page = 1,
    int PageSize = 20,
    Guid? BeneficiaryId = null,
    AssistanceRequestStatus? Status = null,
    Guid? ProgramId = null,
    DateTime? DateFrom = null,
    DateTime? DateTo = null
) : IRequest<PagedList<AssistanceRequestListDto>>;
