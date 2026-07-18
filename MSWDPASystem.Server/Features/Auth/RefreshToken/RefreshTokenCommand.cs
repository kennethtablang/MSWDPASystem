using MediatR;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Features.Auth.Login;

namespace MSWDPASystem.Server.Features.Auth.RefreshToken;

public record RefreshTokenCommand(string RefreshToken) : IRequest<Result<LoginResponse>>;
