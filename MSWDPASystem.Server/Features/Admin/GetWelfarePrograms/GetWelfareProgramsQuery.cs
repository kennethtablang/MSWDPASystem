using MediatR;

namespace MSWDPASystem.Server.Features.Admin.GetWelfarePrograms;

public record GetWelfareProgramsQuery(bool ActiveOnly = false) : IRequest<List<WelfareProgramDto>>;

public record WelfareProgramDto(Guid Id, string Name, string? Description, string? Code, bool IsActive);
