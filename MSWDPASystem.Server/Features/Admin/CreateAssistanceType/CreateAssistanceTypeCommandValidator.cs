using FluentValidation;

namespace MSWDPASystem.Server.Features.Admin.CreateAssistanceType;

public class CreateAssistanceTypeCommandValidator : AbstractValidator<CreateAssistanceTypeCommand>
{
    public CreateAssistanceTypeCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).MaximumLength(500);
    }
}
