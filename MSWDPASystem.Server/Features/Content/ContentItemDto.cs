using MSWDPASystem.Server.Domain.Entities;
using MSWDPASystem.Server.Domain.Enums;

namespace MSWDPASystem.Server.Features.Content;

/// <summary>Full shape, for the staff management screen.</summary>
public record ContentItemDto(
    Guid Id,
    ContentType Type,
    ContentStatus Status,
    string Title,
    string Body,
    DateTime? PublishAt,
    DateTime? ExpiresAt,
    int SortOrder,
    bool IsLive,
    string? CreatedByName,
    DateTime CreatedAt,
    string? UpdatedByName,
    DateTime? UpdatedAt);

/// <summary>
/// Trimmed shape for anonymous callers. Deliberately omits authorship, draft
/// state, and timestamps — who wrote an announcement is internal information.
/// </summary>
public record PublicContentItemDto(
    Guid Id,
    string Title,
    string Body,
    DateTime Date,
    bool IsExpired);

public static class ContentItemMapping
{
    /// <summary>
    /// The single definition of "currently on the landing page". Every query
    /// composes this rather than restating the predicate, so public visibility
    /// can never drift between endpoints.
    /// </summary>
    public static IQueryable<ContentItem> WhereLive(
        this IQueryable<ContentItem> source, DateTime now) =>
        source.Where(c =>
            !c.IsDeleted
            && c.Status == ContentStatus.Published
            && (c.PublishAt == null || c.PublishAt <= now)
            && (c.ExpiresAt == null || c.ExpiresAt > now));

    /// <summary>
    /// Everything the public may see, including items that have aged off the
    /// landing page. Scheduled-but-not-yet-published items stay hidden.
    /// </summary>
    public static IQueryable<ContentItem> WherePubliclyVisible(
        this IQueryable<ContentItem> source, DateTime now) =>
        source.Where(c =>
            !c.IsDeleted
            && c.Status == ContentStatus.Published
            && (c.PublishAt == null || c.PublishAt <= now));

    public static bool IsLive(this ContentItem c, DateTime now) =>
        !c.IsDeleted
        && c.Status == ContentStatus.Published
        && (c.PublishAt == null || c.PublishAt <= now)
        && (c.ExpiresAt == null || c.ExpiresAt > now);

    public static ContentItemDto ToDto(this ContentItem c, DateTime now) => new(
        c.Id, c.Type, c.Status, c.Title, c.Body,
        c.PublishAt, c.ExpiresAt, c.SortOrder, c.IsLive(now),
        c.CreatedByName, c.CreatedAt, c.UpdatedByName, c.UpdatedAt);
}
