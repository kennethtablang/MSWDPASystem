using MediatR;
using MSWDPASystem.Server.Common.Models;

namespace MSWDPASystem.Server.Features.Household.AssignBeneficiary;

public record AssignBeneficiaryCommand(Guid HouseholdId, Guid BeneficiaryId) : IRequest<Result>;
