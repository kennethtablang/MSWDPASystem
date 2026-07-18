using FluentValidation;

namespace MSWDPASystem.Server.Features.Beneficiaries.RegisterBeneficiary;

public class RegisterBeneficiaryCommandValidator : AbstractValidator<RegisterBeneficiaryCommand>
{
    public RegisterBeneficiaryCommandValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.MiddleName).MaximumLength(100);
        RuleFor(x => x.DateOfBirth).NotEmpty()
            .LessThan(DateOnly.FromDateTime(DateTime.Today))
            .WithMessage("Date of birth must be in the past.");
        RuleFor(x => x.Barangay).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Address).NotEmpty().MaximumLength(500);
        RuleFor(x => x.ContactNumber).MaximumLength(20);
        RuleFor(x => x.EmailAddress).EmailAddress().When(x => !string.IsNullOrEmpty(x.EmailAddress));
        RuleFor(x => x.MonthlyIncome).GreaterThanOrEqualTo(0).When(x => x.MonthlyIncome.HasValue);
    }
}
