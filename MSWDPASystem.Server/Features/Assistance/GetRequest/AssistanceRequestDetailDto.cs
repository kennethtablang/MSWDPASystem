using MSWDPASystem.Server.Domain.Enums;

namespace MSWDPASystem.Server.Features.Assistance.GetRequest;

public record AssistanceRequestDetailDto(
    Guid Id,
    string RequestNumber,
    Guid BeneficiaryId,
    string BeneficiaryName,
    string BeneficiaryClientNumber,
    string AssistanceType,
    string? WelfareProgram,
    decimal? Amount,
    string? Purpose,
    string? Remarks,
    AssistanceRequestStatus Status,
    string? DenialReason,
    List<StatusHistoryDto> StatusHistory,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record StatusHistoryDto(
    AssistanceRequestStatus Status,
    string? Notes,
    string? ChangedByUserId,
    DateTime ChangedAt
);
