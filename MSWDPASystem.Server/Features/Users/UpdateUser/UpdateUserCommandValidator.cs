using FluentValidation;

namespace MSWDPASystem.Server.Features.Users.UpdateUser;

public class UpdateUserCommandValidator : AbstractValidator<UpdateUserCommand>
{
    private static readonly string[] ValidRoles = ["Admin", "MSWDStaff", "HeadCoordinator"];

    public UpdateUserCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Role).NotEmpty().Must(r => ValidRoles.Contains(r))
            .WithMessage($"Role must be one of: {string.Join(", ", ValidRoles)}");
    }
}
