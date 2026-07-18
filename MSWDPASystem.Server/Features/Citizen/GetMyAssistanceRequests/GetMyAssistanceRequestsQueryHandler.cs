using MediatR;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Common.Exceptions;
using MSWDPASystem.Server.Common.Interfaces;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Citizen.GetMyAssistanceRequests;

public class GetMyAssistanceRequestsQueryHandler(ApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<GetMyAssistanceRequestsQuery, GetMyAssistanceRequestsResponse>
{
    public async Task<GetMyAssistanceRequestsResponse> Handle(GetMyAssistanceRequestsQuery request, CancellationToken ct)
    {
        var userId = currentUser.UserId ?? throw new UnauthorizedException("Not signed in.");

        var linkedBeneficiaryId = await db.Users.AsNoTracking()
            .Where(u => u.Id == userId)
            .Select(u => u.LinkedBeneficiaryId)
            .FirstOrDefaultAsync(ct);

        if (linkedBeneficiaryId is not Guid beneficiaryId)
            return new GetMyAssistanceRequestsResponse(false, []);

        var requests = await db.AssistanceRequests.AsNoTracking()
            .Where(r => r.BeneficiaryId == beneficiaryId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new CitizenAssistanceRequestDto(
                r.Id,
                r.RequestNumber,
                r.AssistanceType.Name,
                r.WelfareProgram != null ? r.WelfareProgram.Name : null,
                r.Amount,
                r.Purpose,
                r.Status.ToString(),
                r.CreatedAt,
                r.ReleasedAt,
                r.DenialReason))
            .ToListAsync(ct);

        return new GetMyAssistanceRequestsResponse(true, requests);
    }
}
