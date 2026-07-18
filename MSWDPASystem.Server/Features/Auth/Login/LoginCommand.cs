using MediatR;
using MSWDPASystem.Server.Common.Models;

namespace MSWDPASystem.Server.Features.Auth.Login;

public record LoginCommand(string UserName, string Password) : IRequest<Result<LoginResponse>>;
