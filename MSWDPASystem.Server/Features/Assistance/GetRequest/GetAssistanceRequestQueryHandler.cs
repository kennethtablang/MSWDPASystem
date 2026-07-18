using MediatR;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Common.Exceptions;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Assistance.GetRequest;

public class GetAssistanceRequestQueryHandler(ApplicationDbContext context)
    : IRequestHandler<GetAssistanceRequestQuery, Result<AssistanceRequestDetailDto>>
{
    public async Task<Result<AssistanceRequestDetailDto>> Handle(
        GetAssistanceRequestQuery request, CancellationToken cancellationToken)
    {
        var r = await context.AssistanceRequests
            .AsNoTracking()
            .Include(x => x.Beneficiary)
            .Include(x => x.AssistanceType)
            .Include(x => x.WelfareProgram)
            .Include(x => x.StatusHistory)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("AssistanceRequest", request.Id);

        return Result<AssistanceRequestDetailDto>.Success(new AssistanceRequestDetailDto(
            r.Id, r.RequestNumber,
            r.BeneficiaryId, r.Beneficiary.FullName, r.Beneficiary.ClientNumber,
            r.AssistanceType.Name,
            r.WelfareProgram?.Name,
            r.Amount, r.Purpose, r.Remarks,
            r.Status, r.DenialReason,
            r.StatusHistory.OrderBy(h => h.ChangedAt)
                .Select(h => new StatusHistoryDto(h.Status, h.Notes, h.ChangedByUserId, h.ChangedAt))
                .ToList(),
            r.CreatedAt, r.UpdatedAt));
    }
}
