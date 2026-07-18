using MediatR;
using MSWDPASystem.Server.Common.Models;

namespace MSWDPASystem.Server.Features.Beneficiaries.DownloadDocument;

public record DownloadDocumentQuery(Guid BeneficiaryId, Guid DocumentId) : IRequest<Result<FileDownloadDto>>;

public record FileDownloadDto(byte[] Content, string ContentType, string FileName);
