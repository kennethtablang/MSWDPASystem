using MediatR;
using MSWDPASystem.Server.Common.Models;

namespace MSWDPASystem.Server.Features.Beneficiaries.DeleteDocument;

public record DeleteDocumentCommand(Guid BeneficiaryId, Guid DocumentId) : IRequest<Result>;
