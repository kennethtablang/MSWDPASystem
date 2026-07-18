using FluentValidation;

namespace MSWDPASystem.Server.Features.Beneficiaries.UpdateBeneficiary;

public class UpdateBeneficiaryCommandValidator : AbstractValidator<UpdateBeneficiaryCommand>
{
    public UpdateBeneficiaryCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.DateOfBirth).NotEmpty().LessThan(DateOnly.FromDateTime(DateTime.Today));
        RuleFor(x => x.Barangay).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Address).NotEmpty().MaximumLength(500);
        RuleFor(x => x.EmailAddress).EmailAddress().When(x => !string.IsNullOrEmpty(x.EmailAddress));
        RuleFor(x => x.MonthlyIncome).GreaterThanOrEqualTo(0).When(x => x.MonthlyIncome.HasValue);
    }
}
