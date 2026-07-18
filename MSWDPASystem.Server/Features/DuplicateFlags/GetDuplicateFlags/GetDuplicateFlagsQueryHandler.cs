using MediatR;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.DuplicateFlags.GetDuplicateFlags;

public class GetDuplicateFlagsQueryHandler(ApplicationDbContext db)
    : IRequestHandler<GetDuplicateFlagsQuery, List<DuplicateFlagDto>>
{
    public async Task<List<DuplicateFlagDto>> Handle(GetDuplicateFlagsQuery request, CancellationToken ct)
    {
        var query = db.DuplicateFlags
            .Include(f => f.OriginalBeneficiary)
            .Include(f => f.DuplicateBeneficiary)
            .AsQueryable();

        if (request.Status.HasValue)
            query = query.Where(f => f.Status == request.Status.Value);

        return await query
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => new DuplicateFlagDto(
                f.Id,
                f.OriginalBeneficiaryId,
                f.OriginalBeneficiary.ClientNumber,
                f.OriginalBeneficiary.FirstName + " " + f.OriginalBeneficiary.LastName,
                f.DuplicateBeneficiaryId,
                f.DuplicateBeneficiary.ClientNumber,
                f.DuplicateBeneficiary.FirstName + " " + f.DuplicateBeneficiary.LastName,
                f.Status,
                f.FlaggedBySystem,
                f.ResolutionNotes,
                f.ResolvedAt,
                f.CreatedAt))
            .ToListAsync(ct);
    }
}
