using MediatR;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Content.GetContentItems;

public class GetContentItemsQueryHandler(ApplicationDbContext db)
    : IRequestHandler<GetContentItemsQuery, ContentItemsPage>
{
    public async Task<ContentItemsPage> Handle(GetContentItemsQuery request, CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var page = Math.Max(1, request.Page);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);

        var query = db.ContentItems.AsNoTracking().AsQueryable();

        if (!request.IncludeDeleted)
            query = query.Where(c => !c.IsDeleted);

        if (request.Type.HasValue)
            query = query.Where(c => c.Type == request.Type.Value);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var term = request.Search.Trim();
            query = query.Where(c => c.Title.Contains(term) || c.Body.Contains(term));
        }

        var totalCount = await query.CountAsync(ct);

        // Drafts first — they are the ones needing attention — then newest.
        var items = await query
            .OrderBy(c => c.Status)
            .ThenBy(c => c.SortOrder)
            .ThenByDescending(c => c.PublishAt ?? c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        return new ContentItemsPage(
            items.Select(c => c.ToDto(now)).ToList(),
            page, pageSize, totalCount, totalPages);
    }
}
