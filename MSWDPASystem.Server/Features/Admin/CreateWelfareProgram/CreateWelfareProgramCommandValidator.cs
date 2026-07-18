using FluentValidation;

namespace MSWDPASystem.Server.Features.Admin.CreateWelfareProgram;

public class CreateWelfareProgramCommandValidator : AbstractValidator<CreateWelfareProgramCommand>
{
    public CreateWelfareProgramCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Code).MaximumLength(20);
        RuleFor(x => x.Description).MaximumLength(500);
    }
}
