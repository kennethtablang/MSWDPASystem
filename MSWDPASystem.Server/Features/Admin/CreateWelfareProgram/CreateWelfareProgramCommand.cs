using MediatR;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Features.Admin.GetWelfarePrograms;

namespace MSWDPASystem.Server.Features.Admin.CreateWelfareProgram;

public record CreateWelfareProgramCommand(
    string Name, string? Description, string? Code
) : IRequest<Result<WelfareProgramDto>>;
