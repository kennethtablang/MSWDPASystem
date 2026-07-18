using MediatR;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Household.GetHouseholds;

public class GetHouseholdsQueryHandler(ApplicationDbContext db)
    : IRequestHandler<GetHouseholdsQuery, PagedList<HouseholdDto>>
{
    public async Task<PagedList<HouseholdDto>> Handle(GetHouseholdsQuery request, CancellationToken ct)
    {
        var query = db.Households.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var s = request.Search.ToLower();
            query = query.Where(h =>
                h.HouseholdNumber.ToLower().Contains(s) ||
                h.Barangay.ToLower().Contains(s) ||
                (h.HeadOfHouseholdName != null && h.HeadOfHouseholdName.ToLower().Contains(s)));
        }

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(h => h.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(h => new HouseholdDto(
                h.Id,
                h.HouseholdNumber,
                h.Barangay,
                h.Address,
                h.HeadOfHouseholdName,
                h.Members.Count,
                h.CreatedAt))
            .ToListAsync(ct);

        return new PagedList<HouseholdDto>
        {
            Items = items,
            TotalCount = total,
            PageNumber = request.Page,
            PageSize = request.PageSize
        };
    }
}
