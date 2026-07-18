using MediatR;

namespace MSWDPASystem.Server.Features.Citizen.GetMyAssistanceRequests;

public record GetMyAssistanceRequestsQuery : IRequest<GetMyAssistanceRequestsResponse>;

public record CitizenAssistanceRequestDto(
    Guid Id,
    string RequestNumber,
    string AssistanceType,
    string? WelfareProgram,
    decimal? Amount,
    string? Purpose,
    string Status,
    DateTime CreatedAt,
    DateTime? ReleasedAt,
    string? DenialReason
);

public record GetMyAssistanceRequestsResponse(
    bool IsLinked,
    List<CitizenAssistanceRequestDto> Requests
);
