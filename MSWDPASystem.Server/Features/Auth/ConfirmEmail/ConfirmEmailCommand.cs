using MediatR;
using MSWDPASystem.Server.Common.Models;

namespace MSWDPASystem.Server.Features.Auth.ConfirmEmail;

public record ConfirmEmailCommand(string UserId, string Token) : IRequest<Result>;
