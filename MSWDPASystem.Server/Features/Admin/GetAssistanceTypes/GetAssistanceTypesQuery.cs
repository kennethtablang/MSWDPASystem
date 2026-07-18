using MediatR;

namespace MSWDPASystem.Server.Features.Admin.GetAssistanceTypes;

public record GetAssistanceTypesQuery(bool ActiveOnly = false) : IRequest<List<AssistanceTypeDto>>;

public record AssistanceTypeDto(Guid Id, string Name, string? Description, bool IsActive, Guid? WelfareProgramId);
