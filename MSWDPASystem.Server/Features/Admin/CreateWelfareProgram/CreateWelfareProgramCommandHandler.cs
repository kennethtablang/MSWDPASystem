using MediatR;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Domain.Entities;
using MSWDPASystem.Server.Features.Admin.GetWelfarePrograms;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Admin.CreateWelfareProgram;

public class CreateWelfareProgramCommandHandler(ApplicationDbContext context)
    : IRequestHandler<CreateWelfareProgramCommand, Result<WelfareProgramDto>>
{
    public async Task<Result<WelfareProgramDto>> Handle(
        CreateWelfareProgramCommand request, CancellationToken cancellationToken)
    {
        var program = new WelfareProgram
        {
            Name = request.Name,
            Description = request.Description,
            Code = request.Code
        };
        context.WelfarePrograms.Add(program);
        await context.SaveChangesAsync(cancellationToken);
        return Result<WelfareProgramDto>.Success(
            new WelfareProgramDto(program.Id, program.Name, program.Description, program.Code, program.IsActive));
    }
}
