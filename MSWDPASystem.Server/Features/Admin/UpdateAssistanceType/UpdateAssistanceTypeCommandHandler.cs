using MediatR;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Common.Exceptions;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Features.Admin.GetAssistanceTypes;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Admin.UpdateAssistanceType;

public class UpdateAssistanceTypeCommandHandler(ApplicationDbContext db)
    : IRequestHandler<UpdateAssistanceTypeCommand, Result<AssistanceTypeDto>>
{
    public async Task<Result<AssistanceTypeDto>> Handle(UpdateAssistanceTypeCommand request, CancellationToken ct)
    {
        var type = await db.AssistanceTypes.FirstOrDefaultAsync(t => t.Id == request.Id, ct)
            ?? throw new NotFoundException("Assistance type not found.");

        type.Name = request.Name;
        type.Description = request.Description;
        type.IsActive = request.IsActive;

        await db.SaveChangesAsync(ct);
        return Result<AssistanceTypeDto>.Success(
            new AssistanceTypeDto(type.Id, type.Name, type.Description, type.IsActive, type.WelfareProgramId));
    }
}
