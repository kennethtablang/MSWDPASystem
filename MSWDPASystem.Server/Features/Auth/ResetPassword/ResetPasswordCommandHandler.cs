using MediatR;
using Microsoft.AspNetCore.Identity;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Domain.Entities;

namespace MSWDPASystem.Server.Features.Auth.ResetPassword;

public class ResetPasswordCommandHandler(UserManager<ApplicationUser> userManager)
    : IRequestHandler<ResetPasswordCommand, Result>
{
    public async Task<Result> Handle(ResetPasswordCommand request, CancellationToken ct)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is null || !user.IsActive)
            return Result.Failure("The reset link is invalid or has expired.");

        var result = await userManager.ResetPasswordAsync(user, request.Token, request.NewPassword);
        if (!result.Succeeded)
            return Result.Failure(result.Errors.Select(e => e.Description).ToList());

        return Result.Success();
    }
}
