using FluentValidation;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Users.CreateUser;

public class CreateUserCommandValidator : AbstractValidator<CreateUserCommand>
{
    private static readonly string[] ValidRoles = ["Admin", "MSWDStaff", "HeadCoordinator"];

    public CreateUserCommandValidator()
    {
        RuleFor(x => x.UserName).NotEmpty().MinimumLength(3).MaximumLength(50);
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8)
            .Matches("[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
            .Matches("[a-z]").WithMessage("Password must contain at least one lowercase letter.")
            .Matches("[0-9]").WithMessage("Password must contain at least one digit.")
            .Matches("[^a-zA-Z0-9]").WithMessage("Password must contain at least one special character.");
        RuleFor(x => x.Role).NotEmpty().Must(r => ValidRoles.Contains(r))
            .WithMessage($"Role must be one of: {string.Join(", ", ValidRoles)}");
    }
}
