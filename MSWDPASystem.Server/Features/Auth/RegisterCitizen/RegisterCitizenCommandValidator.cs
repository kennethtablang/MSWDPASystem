using FluentValidation;

namespace MSWDPASystem.Server.Features.Auth.RegisterCitizen;

public class RegisterCitizenCommandValidator : AbstractValidator<RegisterCitizenCommand>
{
    public RegisterCitizenCommandValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(150);
        RuleFor(x => x.UserName)
            .NotEmpty()
            .MinimumLength(4).WithMessage("Username must be at least 4 characters.")
            .MaximumLength(50)
            .Matches("^[a-zA-Z0-9._-]+$").WithMessage("Username may only contain letters, numbers, dots, dashes, and underscores.");
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.ContactNumber)
            .Matches(@"^(\+?63|0)?\d{10}$").When(x => !string.IsNullOrWhiteSpace(x.ContactNumber))
            .WithMessage("Enter a valid Philippine mobile number (e.g. 09171234567).");
        RuleFor(x => x.Barangay).NotEmpty().MaximumLength(100);
        // Mirror the Identity password policy so users get friendly errors up front.
        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(8).WithMessage("Password must be at least 8 characters.")
            .Matches("[A-Z]").WithMessage("Password must contain an uppercase letter.")
            .Matches("[a-z]").WithMessage("Password must contain a lowercase letter.")
            .Matches("[0-9]").WithMessage("Password must contain a digit.")
            .Matches("[^a-zA-Z0-9]").WithMessage("Password must contain a special character.");
        RuleFor(x => x.AcceptTerms)
            .Equal(true).WithMessage("You must accept the Terms and Conditions and Privacy Policy.");
    }
}
