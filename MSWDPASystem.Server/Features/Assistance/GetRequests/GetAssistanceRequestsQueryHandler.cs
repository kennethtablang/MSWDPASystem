using MediatR;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Assistance.GetRequests;

public class GetAssistanceRequestsQueryHandler(ApplicationDbContext context)
    : IRequestHandler<GetAssistanceRequestsQuery, PagedList<AssistanceRequestListDto>>
{
    public async Task<PagedList<AssistanceRequestListDto>> Handle(
        GetAssistanceRequestsQuery request, CancellationToken cancellationToken)
    {
        var query = context.AssistanceRequests
            .AsNoTracking()
            .Include(r => r.Beneficiary)
            .Include(r => r.AssistanceType)
            .Include(r => r.WelfareProgram)
            .AsQueryable();

        if (request.BeneficiaryId.HasValue)
            query = query.Where(r => r.BeneficiaryId == request.BeneficiaryId);

        if (request.Status.HasValue)
            query = query.Where(r => r.Status == request.Status);

        if (request.ProgramId.HasValue)
            query = query.Where(r => r.WelfareProgramId == request.ProgramId);

        if (request.DateFrom.HasValue)
            query = query.Where(r => r.CreatedAt >= request.DateFrom);

        if (request.DateTo.HasValue)
            query = query.Where(r => r.CreatedAt <= request.DateTo);

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(r => new AssistanceRequestListDto(
                r.Id, r.RequestNumber,
                r.BeneficiaryId, r.Beneficiary.FirstName + " " + r.Beneficiary.LastName,
                r.Beneficiary.ClientNumber,
                r.AssistanceType.Name,
                r.WelfareProgram != null ? r.WelfareProgram.Name : null,
                r.Amount, r.Status,
                r.SubmittedByUserId ?? string.Empty,
                r.CreatedAt))
            .ToListAsync(cancellationToken);

        return new PagedList<AssistanceRequestListDto>
        {
            Items = items,
            TotalCount = total,
            PageNumber = request.Page,
            PageSize = request.PageSize
        };
    }
}
