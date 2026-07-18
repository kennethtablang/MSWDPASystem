using MSWDPASystem.Server.Domain.Enums;

namespace MSWDPASystem.Server.Features.Assistance.CreateRequest;

public record CreateAssistanceRequestResponse(
    Guid Id,
    string RequestNumber,
    Guid BeneficiaryId,
    string BeneficiaryName,
    string AssistanceType,
    decimal? Amount,
    AssistanceRequestStatus Status,
    DateTime CreatedAt
);
