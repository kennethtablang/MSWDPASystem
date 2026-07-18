using MediatR;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Beneficiaries.GetBeneficiaries;

public class GetBeneficiariesQueryHandler(ApplicationDbContext context)
    : IRequestHandler<GetBeneficiariesQuery, PagedList<BeneficiaryListDto>>
{
    public async Task<PagedList<BeneficiaryListDto>> Handle(
        GetBeneficiariesQuery request, CancellationToken cancellationToken)
    {
        var query = context.Beneficiaries
            .AsNoTracking()
            .Include(b => b.Programs)
                .ThenInclude(p => p.WelfareProgram)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var s = request.Search.ToLower();
            query = query.Where(b =>
                b.FirstName.ToLower().Contains(s) ||
                b.LastName.ToLower().Contains(s) ||
                b.ClientNumber.ToLower().Contains(s) ||
                (b.MiddleName != null && b.MiddleName.ToLower().Contains(s)));
        }

        if (!string.IsNullOrWhiteSpace(request.Barangay))
            query = query.Where(b => b.Barangay == request.Barangay);

        if (request.ProgramId.HasValue)
            query = query.Where(b => b.Programs.Any(p => p.WelfareProgramId == request.ProgramId));

        if (request.Status.HasValue)
            query = query.Where(b => b.Status == request.Status);

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(b => b.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(b => new BeneficiaryListDto(
                b.Id,
                b.ClientNumber,
                b.FirstName,
                b.MiddleName,
                b.LastName,
                b.FirstName + (b.MiddleName != null ? " " + b.MiddleName : "") + " " + b.LastName,
                b.Barangay,
                b.Status,
                b.Programs.Select(p => p.WelfareProgram.Name).ToList(),
                b.CreatedAt))
            .ToListAsync(cancellationToken);

        return new PagedList<BeneficiaryListDto>
        {
            Items = items,
            TotalCount = total,
            PageNumber = request.Page,
            PageSize = request.PageSize
        };
    }
}
