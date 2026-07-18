using MediatR;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Common.Exceptions;
using MSWDPASystem.Server.Common.Interfaces;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Citizen.GetMyProfile;

public class GetMyProfileQueryHandler(ApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<GetMyProfileQuery, GetMyProfileResponse>
{
    public async Task<GetMyProfileResponse> Handle(GetMyProfileQuery request, CancellationToken ct)
    {
        var userId = currentUser.UserId ?? throw new UnauthorizedException("Not signed in.");

        var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId, ct)
                   ?? throw new NotFoundException("User not found.");

        LinkedBeneficiaryDto? beneficiaryDto = null;
        if (user.LinkedBeneficiaryId is Guid beneficiaryId)
        {
            var b = await db.Beneficiaries.AsNoTracking()
                .Include(x => x.Programs).ThenInclude(p => p.WelfareProgram)
                .FirstOrDefaultAsync(x => x.Id == beneficiaryId, ct);
            if (b is not null)
            {
                beneficiaryDto = new LinkedBeneficiaryDto(
                    b.Id,
                    b.ClientNumber,
                    b.FullName,
                    b.Barangay,
                    b.Status.ToString(),
                    b.Programs.Where(p => p.IsActive)
                        .Select(p => p.WelfareProgram.Name)
                        .ToList());
            }
        }

        return new GetMyProfileResponse(
            user.Id,
            user.UserName ?? string.Empty,
            user.FullName,
            user.Email ?? string.Empty,
            user.PhoneNumber,
            user.CreatedAt,
            beneficiaryDto is not null,
            beneficiaryDto);
    }
}
