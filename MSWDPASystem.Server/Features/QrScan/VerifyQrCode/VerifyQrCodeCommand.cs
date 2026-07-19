using MediatR;
using MSWDPASystem.Server.Common.Models;

namespace MSWDPASystem.Server.Features.QrScan.VerifyQrCode;

public record VerifyQrCodeCommand(string ClientNumber, string? Notes = null)
    : IRequest<Result<VerifyQrCodeResponse>>;

/// <summary>
/// FR-3.5: a single assistance record in the history shown after a successful scan.
/// </summary>
public record ScanAssistanceHistoryDto(
    Guid Id,
    string RequestNumber,
    string AssistanceType,
    string? ProgramName,
    decimal? Amount,
    string Status,
    DateTime RequestedAt,
    DateTime? ReleasedAt
);

public record VerifyQrCodeResponse(
    Guid BeneficiaryId,
    string ClientNumber,
    string FullName,
    string Status,
    string Barangay,
    string? ContactNumber,
    List<string> Programs,
    DateTime ScannedAt,
    // FR-3.5: complete assistance history, plus the roll-ups a releasing officer needs
    // at the claim table to spot a repeat claim without opening the full profile.
    List<ScanAssistanceHistoryDto> AssistanceHistory,
    int TotalRequests,
    decimal TotalReleasedAmount,
    DateTime? LastReleasedAt,
    int PendingRequests,
    DateTime? PreviousScanAt
);
