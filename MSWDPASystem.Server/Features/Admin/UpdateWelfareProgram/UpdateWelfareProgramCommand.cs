using MediatR;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Features.Admin.GetWelfarePrograms;

namespace MSWDPASystem.Server.Features.Admin.UpdateWelfareProgram;

public record UpdateWelfareProgramCommand(
    Guid Id,
    string Name,
    string? Description,
    string? Code,
    bool IsActive
) : IRequest<Result<WelfareProgramDto>>;
