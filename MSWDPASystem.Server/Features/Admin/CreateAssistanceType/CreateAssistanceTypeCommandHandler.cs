using MediatR;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Domain.Entities;
using MSWDPASystem.Server.Features.Admin.GetAssistanceTypes;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Admin.CreateAssistanceType;

public class CreateAssistanceTypeCommandHandler(ApplicationDbContext context)
    : IRequestHandler<CreateAssistanceTypeCommand, Result<AssistanceTypeDto>>
{
    public async Task<Result<AssistanceTypeDto>> Handle(
        CreateAssistanceTypeCommand request, CancellationToken cancellationToken)
    {
        var type = new AssistanceType
        {
            Name = request.Name,
            Description = request.Description,
            WelfareProgramId = request.WelfareProgramId
        };
        context.AssistanceTypes.Add(type);
        await context.SaveChangesAsync(cancellationToken);
        return Result<AssistanceTypeDto>.Success(
            new AssistanceTypeDto(type.Id, type.Name, type.Description, type.IsActive, type.WelfareProgramId));
    }
}
