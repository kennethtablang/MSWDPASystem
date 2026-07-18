using MediatR;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Domain.Enums;

namespace MSWDPASystem.Server.Features.Beneficiaries.UpdateStatus;

public record UpdateBeneficiaryStatusCommand(Guid Id, BeneficiaryStatus Status, string? Notes)
    : IRequest<Result>;
