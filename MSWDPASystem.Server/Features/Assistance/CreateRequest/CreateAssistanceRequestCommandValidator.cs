using FluentValidation;

namespace MSWDPASystem.Server.Features.Assistance.CreateRequest;

public class CreateAssistanceRequestCommandValidator : AbstractValidator<CreateAssistanceRequestCommand>
{
    public CreateAssistanceRequestCommandValidator()
    {
        RuleFor(x => x.BeneficiaryId).NotEmpty();
        RuleFor(x => x.AssistanceTypeId).NotEmpty();
        RuleFor(x => x.Amount).GreaterThan(0).When(x => x.Amount.HasValue);
        RuleFor(x => x.Purpose).MaximumLength(1000);
    }
}
