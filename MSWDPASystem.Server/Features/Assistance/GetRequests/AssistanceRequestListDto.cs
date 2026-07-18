using MSWDPASystem.Server.Domain.Enums;

namespace MSWDPASystem.Server.Features.Assistance.GetRequests;

public record AssistanceRequestListDto(
    Guid Id,
    string RequestNumber,
    Guid BeneficiaryId,
    string BeneficiaryName,
    string BeneficiaryClientNumber,
    string AssistanceType,
    string? WelfareProgram,
    decimal? Amount,
    AssistanceRequestStatus Status,
    string SubmittedByUserId,
    DateTime CreatedAt
);
