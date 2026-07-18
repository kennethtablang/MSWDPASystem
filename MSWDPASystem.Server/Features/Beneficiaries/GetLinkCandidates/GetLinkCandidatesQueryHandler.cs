using MediatR;
using Microsoft.AspNetCore.Identity;
using MSWDPASystem.Server.Domain.Entities;

namespace MSWDPASystem.Server.Features.Beneficiaries.GetLinkCandidates;

// Returns active citizen accounts not yet linked to any beneficiary, for staff to link.
public class GetLinkCandidatesQueryHandler(UserManager<ApplicationUser> userManager)
    : IRequestHandler<GetLinkCandidatesQuery, List<CitizenCandidateDto>>
{
    public async Task<List<CitizenCandidateDto>> Handle(GetLinkCandidatesQuery request, CancellationToken ct)
    {
        var citizens = await userManager.GetUsersInRoleAsync("Citizen");

        IEnumerable<ApplicationUser> candidates = citizens
            .Where(u => u.LinkedBeneficiaryId == null && u.IsActive);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var s = request.Search.Trim().ToLowerInvariant();
            candidates = candidates.Where(u =>
                u.FullName.ToLowerInvariant().Contains(s) ||
                (u.UserName != null && u.UserName.ToLowerInvariant().Contains(s)) ||
                (u.Email != null && u.Email.ToLowerInvariant().Contains(s)));
        }

        return candidates
            .OrderBy(u => u.FullName)
            .Take(10)
            .Select(u => new CitizenCandidateDto(u.Id, u.FullName, u.UserName ?? string.Empty, u.Email ?? string.Empty))
            .ToList();
    }
}
