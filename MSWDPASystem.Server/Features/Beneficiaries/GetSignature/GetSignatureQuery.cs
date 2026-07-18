using MediatR;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Features.Beneficiaries.DownloadDocument;

namespace MSWDPASystem.Server.Features.Beneficiaries.GetSignature;

public record GetSignatureQuery(Guid BeneficiaryId) : IRequest<Result<FileDownloadDto>>;
