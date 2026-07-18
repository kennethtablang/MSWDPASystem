using MediatR;
using MSWDPASystem.Server.Common.Models;

namespace MSWDPASystem.Server.Features.QrScan.VerifyQrCode;

public record VerifyQrCodeCommand(string ClientNumber, string? Notes = null)
    : IRequest<Result<VerifyQrCodeResponse>>;

public record VerifyQrCodeResponse(
    Guid BeneficiaryId,
    string ClientNumber,
    string FullName,
    string Status,
    string Barangay,
    string? ContactNumber,
    List<string> Programs,
    DateTime ScannedAt
);
