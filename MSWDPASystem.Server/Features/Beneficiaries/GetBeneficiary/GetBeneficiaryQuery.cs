using MediatR;
using MSWDPASystem.Server.Common.Models;

namespace MSWDPASystem.Server.Features.Beneficiaries.GetBeneficiary;

public record GetBeneficiaryQuery(Guid Id) : IRequest<Result<BeneficiaryDetailDto>>;
