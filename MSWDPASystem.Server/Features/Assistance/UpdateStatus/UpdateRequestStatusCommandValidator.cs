using FluentValidation;
using MSWDPASystem.Server.Domain.Enums;

namespace MSWDPASystem.Server.Features.Assistance.UpdateStatus;

public class UpdateRequestStatusCommandValidator : AbstractValidator<UpdateRequestStatusCommand>
{
    public UpdateRequestStatusCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.NewStatus).IsInEnum();
        RuleFor(x => x.DenialReason)
            .NotEmpty().WithMessage("Denial reason is required when denying a request.")
            .When(x => x.NewStatus == AssistanceRequestStatus.Denied);
    }
}
