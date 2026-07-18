using MediatR;
using MSWDPASystem.Server.Common.Models;

namespace MSWDPASystem.Server.Features.Auth.RegisterCitizen;

public record RegisterCitizenCommand(
    string FullName,
    string UserName,
    string Email,
    string? ContactNumber,
    string Barangay,
    string Password,
    bool AcceptTerms
) : IRequest<Result<RegisterCitizenResponse>>;
