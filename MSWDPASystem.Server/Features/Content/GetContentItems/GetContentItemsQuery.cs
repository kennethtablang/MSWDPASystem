using MediatR;
using MSWDPASystem.Server.Domain.Enums;

namespace MSWDPASystem.Server.Features.Content.GetContentItems;

/// <summary>
/// Staff-side list. Returns drafts, scheduled, live, and expired items so the
/// management screen can show the whole picture; soft-deleted rows stay hidden
/// unless explicitly requested.
/// </summary>
public record GetContentItemsQuery(
    ContentType? Type = null,
    string? Search = null,
    bool IncludeDeleted = false,
    int Page = 1,
    int PageSize = 20) : IRequest<ContentItemsPage>;

public record ContentItemsPage(
    IReadOnlyList<ContentItemDto> Items,
    int Page,
    int PageSize,
    int TotalCount,
    int TotalPages);
