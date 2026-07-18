using MediatR;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Household.GetHousehold;

public class GetHouseholdQueryHandler(ApplicationDbContext db)
    : IRequestHandler<GetHouseholdQuery, Result<HouseholdDetailDto>>
{
    public async Task<Result<HouseholdDetailDto>> Handle(GetHouseholdQuery request, CancellationToken ct)
    {
        var household = await db.Households
            .Include(h => h.Members)
            .FirstOrDefaultAsync(h => h.Id == request.Id, ct);

        if (household == null)
            return Result<HouseholdDetailDto>.Failure("Household not found.");

        var members = household.Members
            .Select(m => new HouseholdMemberDto(m.Id, m.ClientNumber, m.FullName, m.Barangay, m.Status.ToString()))
            .ToList();

        return Result<HouseholdDetailDto>.Success(new HouseholdDetailDto(
            household.Id, household.HouseholdNumber, household.Barangay,
            household.Address, household.HeadOfHouseholdName, members, household.CreatedAt));
    }
}
