using FluentValidation;

namespace MSWDPASystem.Server.Features.Household.CreateHousehold;

public class CreateHouseholdValidator : AbstractValidator<CreateHouseholdCommand>
{
    public CreateHouseholdValidator()
    {
        RuleFor(x => x.Barangay).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Address).NotEmpty().MaximumLength(255);
    }
}
