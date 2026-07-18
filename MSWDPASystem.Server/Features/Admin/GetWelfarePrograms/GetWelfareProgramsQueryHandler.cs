using MediatR;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Admin.GetWelfarePrograms;

public class GetWelfareProgramsQueryHandler(ApplicationDbContext context)
    : IRequestHandler<GetWelfareProgramsQuery, List<WelfareProgramDto>>
{
    public async Task<List<WelfareProgramDto>> Handle(
        GetWelfareProgramsQuery request, CancellationToken cancellationToken)
    {
        var query = context.WelfarePrograms.AsNoTracking();
        if (request.ActiveOnly)
            query = query.Where(w => w.IsActive);

        return await query.OrderBy(w => w.Name)
            .Select(w => new WelfareProgramDto(w.Id, w.Name, w.Description, w.Code, w.IsActive))
            .ToListAsync(cancellationToken);
    }
}
