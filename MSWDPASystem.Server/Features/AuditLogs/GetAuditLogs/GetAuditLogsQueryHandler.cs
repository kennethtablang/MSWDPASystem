using MediatR;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.AuditLogs.GetAuditLogs;

public class GetAuditLogsQueryHandler(ApplicationDbContext db)
    : IRequestHandler<GetAuditLogsQuery, PagedList<AuditLogDto>>
{
    public Task<PagedList<AuditLogDto>> Handle(GetAuditLogsQuery request, CancellationToken ct)
    {
        var query = db.AuditLogs.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
            query = query.Where(l => l.UserName!.Contains(request.Search) || l.Description!.Contains(request.Search));

        if (request.Action.HasValue)
            query = query.Where(l => l.Action == request.Action.Value);

        if (!string.IsNullOrWhiteSpace(request.EntityType))
            query = query.Where(l => l.EntityType == request.EntityType);

        if (request.DateFrom.HasValue)
            query = query.Where(l => l.Timestamp >= request.DateFrom.Value);

        if (request.DateTo.HasValue)
            query = query.Where(l => l.Timestamp <= request.DateTo.Value.AddDays(1));

        var projected = query
            .OrderByDescending(l => l.Timestamp)
            .Select(l => new AuditLogDto(
                l.Id, l.UserName, l.Action, l.EntityType, l.EntityId,
                l.Description, l.IpAddress, l.Timestamp));

        return Task.FromResult(PagedList<AuditLogDto>.Create(projected, request.Page, request.PageSize));
    }
}
