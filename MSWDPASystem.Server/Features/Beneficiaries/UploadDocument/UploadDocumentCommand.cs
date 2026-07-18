using MediatR;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Features.Beneficiaries.GetBeneficiary;

namespace MSWDPASystem.Server.Features.Beneficiaries.UploadDocument;

public record UploadDocumentCommand(
    Guid BeneficiaryId,
    Stream FileStream,
    string FileName,
    string ContentType,
    long FileSize,
    string? DocumentType,
    string? Description
) : IRequest<Result<DocumentDto>>;
