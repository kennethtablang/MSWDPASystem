using MediatR;

namespace MSWDPASystem.Server.Features.Beneficiaries.GetLinkCandidates;

public record GetLinkCandidatesQuery(string? Search) : IRequest<List<CitizenCandidateDto>>;

public record CitizenCandidateDto(string UserId, string FullName, string UserName, string Email);
