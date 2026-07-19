using MediatR;
using MSWDPASystem.Server.Domain.Enums;

namespace MSWDPASystem.Server.Features.Content.GetPublicContent;

/// <summary>
/// Anonymous read of published content.
/// <paramref name="IncludeExpired"/> distinguishes the landing page (live only)
/// from the public archive (everything ever published).
/// </summary>
public record GetPublicContentQuery(
    ContentType Type,
    bool IncludeExpired = false,
    int Page = 1,
    int PageSize = 10) : IRequest<PublicContentPage>;

public record PublicContentPage(
    IReadOnlyList<PublicContentItemDto> Items,
    int Page,
    int PageSize,
    int TotalCount,
    int TotalPages);
