using MediatR;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Content.GetPublicContent;

public class GetPublicContentQueryHandler(ApplicationDbContext db)
    : IRequestHandler<GetPublicContentQuery, PublicContentPage>
{
    private const int MaxPageSize = 50;

    public async Task<PublicContentPage> Handle(GetPublicContentQuery request, CancellationToken ct)
    {
        var now = DateTime.UtcNow;

        // Clamped rather than validated: this endpoint is anonymous, so a bad
        // page size is a scraper probing, not a user to return an error to.
        var page = Math.Max(1, request.Page);
        var pageSize = Math.Clamp(request.PageSize, 1, MaxPageSize);

        var query = db.ContentItems.AsNoTracking().Where(c => c.Type == request.Type);

        query = request.IncludeExpired
            ? query.WherePubliclyVisible(now)
            : query.WhereLive(now);

        // FAQs are curated, so they follow SortOrder. Announcements and news are
        // chronological, newest first. CreatedAt breaks ties on both.
        query = request.Type == ContentType.Faq
            ? query.OrderBy(c => c.SortOrder).ThenByDescending(c => c.CreatedAt)
            : query.OrderByDescending(c => c.PublishAt ?? c.CreatedAt).ThenByDescending(c => c.CreatedAt);

        var totalCount = await query.CountAsync(ct);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new PublicContentItemDto(
                c.Id,
                c.Title,
                c.Body,
                c.PublishAt ?? c.CreatedAt,
                c.ExpiresAt != null && c.ExpiresAt <= now))
            .ToListAsync(ct);

        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        return new PublicContentPage(items, page, pageSize, totalCount, totalPages);
    }
}
