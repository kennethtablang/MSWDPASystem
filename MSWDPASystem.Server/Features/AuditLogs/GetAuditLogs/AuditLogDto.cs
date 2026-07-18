using MSWDPASystem.Server.Domain.Enums;

namespace MSWDPASystem.Server.Features.AuditLogs.GetAuditLogs;

public record AuditLogDto(
    Guid Id,
    string? UserName,
    AuditAction Action,
    string EntityType,
    string? EntityId,
    string? Description,
    string? IpAddress,
    DateTime Timestamp
);
