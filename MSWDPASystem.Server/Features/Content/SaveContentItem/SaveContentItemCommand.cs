using MediatR;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Domain.Enums;

namespace MSWDPASystem.Server.Features.Content.SaveContentItem;

/// <summary>
/// Creates when <paramref name="Id"/> is null, updates otherwise. One command
/// because the validation and audit rules are identical either way, and the
/// management screen uses the same form for both.
/// </summary>
public record SaveContentItemCommand(
    Guid? Id,
    ContentType Type,
    ContentStatus Status,
    string Title,
    string Body,
    DateTime? PublishAt,
    DateTime? ExpiresAt,
    int SortOrder) : IRequest<Result<ContentItemDto>>;
