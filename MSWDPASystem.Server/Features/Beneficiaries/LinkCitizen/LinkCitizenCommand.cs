using MediatR;
using MSWDPASystem.Server.Common.Models;

namespace MSWDPASystem.Server.Features.Beneficiaries.LinkCitizen;

public record LinkCitizenCommand(Guid BeneficiaryId, string UserId) : IRequest<Result>;
