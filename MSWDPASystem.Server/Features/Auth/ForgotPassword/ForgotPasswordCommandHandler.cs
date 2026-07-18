using MediatR;
using Microsoft.AspNetCore.Identity;
using MSWDPASystem.Server.Common.Interfaces;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Domain.Entities;

namespace MSWDPASystem.Server.Features.Auth.ForgotPassword;

public class ForgotPasswordCommandHandler(
    UserManager<ApplicationUser> userManager,
    IEmailService emailService,
    IConfiguration config,
    IWebHostEnvironment env)
    : IRequestHandler<ForgotPasswordCommand, Result<ForgotPasswordResponse>>
{
    // Always report success so the endpoint cannot be used to enumerate accounts.
    private const string GenericMessage =
        "If an account exists for that email address, a password reset link has been sent.";

    public async Task<Result<ForgotPasswordResponse>> Handle(ForgotPasswordCommand request, CancellationToken ct)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is null || !user.IsActive)
            return Result<ForgotPasswordResponse>.Success(new ForgotPasswordResponse(GenericMessage, null));

        var token = await userManager.GeneratePasswordResetTokenAsync(user);
        var baseUrl = config["FrontendBaseUrl"]?.TrimEnd('/') ?? "";
        var link = $"{baseUrl}/reset-password?email={Uri.EscapeDataString(request.Email)}&token={Uri.EscapeDataString(token)}";

        await emailService.SendAsync(
            request.Email,
            "Reset your MSWD Caba account password",
            $"""
             <p>Magandang araw,</p>
             <p>We received a request to reset the password of your MSWD Caba account.
             Click the link below to choose a new password. This link expires shortly.</p>
             <p><a href="{link}">Reset my password</a></p>
             <p>If you did not request this, you can safely ignore this email.</p>
             <p>— Municipal Social Welfare and Development Office, Caba, La Union</p>
             """,
            ct);

        return Result<ForgotPasswordResponse>.Success(
            new ForgotPasswordResponse(GenericMessage, env.IsDevelopment() ? link : null));
    }
}
