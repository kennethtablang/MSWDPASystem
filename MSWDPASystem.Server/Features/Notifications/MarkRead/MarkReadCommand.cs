using MediatR;
using MSWDPASystem.Server.Common.Models;

namespace MSWDPASystem.Server.Features.Notifications.MarkRead;

public record MarkReadCommand(List<Guid>? Ids = null) : IRequest<Result>;
