using MediatR;
using MSWDPASystem.Server.Common.Models;

namespace MSWDPASystem.Server.Features.Household.RemoveBeneficiary;

public record RemoveBeneficiaryCommand(Guid HouseholdId, Guid BeneficiaryId) : IRequest<Result>;
