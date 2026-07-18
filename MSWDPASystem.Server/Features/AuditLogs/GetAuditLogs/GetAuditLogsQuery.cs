using MediatR;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Domain.Enums;

namespace MSWDPASystem.Server.Features.AuditLogs.GetAuditLogs;

public record GetAuditLogsQuery(
    string? Search,
    AuditAction? Action,
    string? EntityType,
    DateTime? DateFrom,
    DateTime? DateTo,
    int Page = 1,
    int PageSize = 30
) : IRequest<PagedList<AuditLogDto>>;
