using MediatR;
using MSWDPASystem.Server.Common.Models;

namespace MSWDPASystem.Server.Features.Content.DeleteContentItem;

/// <summary>
/// Soft delete. <paramref name="Restore"/> reverses it, so an item removed by
/// mistake can be brought back without a database round trip by an administrator.
/// </summary>
public record DeleteContentItemCommand(Guid Id, bool Restore = false) : IRequest<Result>;
