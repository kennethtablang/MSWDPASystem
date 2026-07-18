using MediatR;
using MSWDPASystem.Server.Common.Models;

namespace MSWDPASystem.Server.Features.Beneficiaries.GetQrCode;

public record GetQrCodeQuery(Guid BeneficiaryId) : IRequest<Result<string>>;
