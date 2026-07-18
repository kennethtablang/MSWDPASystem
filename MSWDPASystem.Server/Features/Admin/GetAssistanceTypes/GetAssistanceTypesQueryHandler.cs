using MediatR;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Admin.GetAssistanceTypes;

public class GetAssistanceTypesQueryHandler(ApplicationDbContext context)
    : IRequestHandler<GetAssistanceTypesQuery, List<AssistanceTypeDto>>
{
    public async Task<List<AssistanceTypeDto>> Handle(
        GetAssistanceTypesQuery request, CancellationToken cancellationToken)
    {
        var query = context.AssistanceTypes.AsNoTracking();
        if (request.ActiveOnly)
            query = query.Where(t => t.IsActive);

        return await query.OrderBy(t => t.Name)
            .Select(t => new AssistanceTypeDto(t.Id, t.Name, t.Description, t.IsActive, t.WelfareProgramId))
            .ToListAsync(cancellationToken);
    }
}
