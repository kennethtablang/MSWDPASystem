using MediatR;
using MSWDPASystem.Server.Common.Models;

namespace MSWDPASystem.Server.Features.Account.UpdateMyProfile;

public record UpdateMyProfileCommand(
    string FullName,
    string Email,
    string? ContactNumber
) : IRequest<Result>;
