using MediatR;
using MSWDPASystem.Server.Common.Models;

namespace MSWDPASystem.Server.Features.Beneficiaries.UnlinkCitizen;

public record UnlinkCitizenCommand(Guid BeneficiaryId) : IRequest<Result>;
