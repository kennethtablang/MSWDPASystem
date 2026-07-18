using MediatR;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Common.Exceptions;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Features.Admin.GetWelfarePrograms;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Admin.UpdateWelfareProgram;

public class UpdateWelfareProgramCommandHandler(ApplicationDbContext db)
    : IRequestHandler<UpdateWelfareProgramCommand, Result<WelfareProgramDto>>
{
    public async Task<Result<WelfareProgramDto>> Handle(UpdateWelfareProgramCommand request, CancellationToken ct)
    {
        var program = await db.WelfarePrograms.FirstOrDefaultAsync(w => w.Id == request.Id, ct)
            ?? throw new NotFoundException("Welfare program not found.");

        var nameConflict = await db.WelfarePrograms
            .AnyAsync(w => w.Name == request.Name && w.Id != request.Id, ct);
        if (nameConflict)
            return Result<WelfareProgramDto>.Failure("A welfare program with that name already exists.");

        program.Name = request.Name;
        program.Description = request.Description;
        program.Code = request.Code;
        program.IsActive = request.IsActive;

        await db.SaveChangesAsync(ct);
        return Result<WelfareProgramDto>.Success(
            new WelfareProgramDto(program.Id, program.Name, program.Description, program.Code, program.IsActive));
    }
}
