using MediatR;
using MSWDPASystem.Server.Common.Models;

namespace MSWDPASystem.Server.Features.Auth.Logout;

public record LogoutCommand : IRequest<Result>;
