using MediatR;
using MSWDPASystem.Server.Common.Models;

namespace MSWDPASystem.Server.Features.Beneficiaries.SaveSignature;

public record SaveSignatureCommand(Guid BeneficiaryId, string SignatureDataUrl)
    : IRequest<Result<string>>;
