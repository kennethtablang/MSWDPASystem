using MediatR;
using Microsoft.AspNetCore.Identity;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Domain.Entities;

namespace MSWDPASystem.Server.Features.Auth.ConfirmEmail;

public class ConfirmEmailCommandHandler(UserManager<ApplicationUser> userManager)
    : IRequestHandler<ConfirmEmailCommand, Result>
{
    public async Task<Result> Handle(ConfirmEmailCommand request, CancellationToken ct)
    {
        var user = await userManager.FindByIdAsync(request.UserId);
        if (user is null)
            return Result.Failure("The verification link is invalid or has expired.");

        if (user.EmailConfirmed)
            return Result.Success();

        var result = await userManager.ConfirmEmailAsync(user, request.Token);
        if (!result.Succeeded)
            return Result.Failure("The verification link is invalid or has expired.");

        return Result.Success();
    }
}
