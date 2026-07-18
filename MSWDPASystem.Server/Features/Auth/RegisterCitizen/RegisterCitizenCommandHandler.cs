using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Common.Interfaces;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Domain.Entities;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Auth.RegisterCitizen;

public class RegisterCitizenCommandHandler(
    UserManager<ApplicationUser> userManager,
    ApplicationDbContext db,
    IEmailService emailService,
    IConfiguration config,
    IWebHostEnvironment env)
    : IRequestHandler<RegisterCitizenCommand, Result<RegisterCitizenResponse>>
{
    public async Task<Result<RegisterCitizenResponse>> Handle(RegisterCitizenCommand request, CancellationToken ct)
    {
        var user = new ApplicationUser
        {
            UserName = request.UserName.Trim(),
            Email = request.Email.Trim(),
            FullName = request.FullName.Trim(),
            PhoneNumber = request.ContactNumber?.Trim(),
            EmailConfirmed = false,
            IsActive = true,
        };

        // Auto-link when a beneficiary record already carries this exact email;
        // any other linking is done by staff after identity verification.
        var matchingBeneficiary = await db.Beneficiaries
            .FirstOrDefaultAsync(b => b.EmailAddress != null && b.EmailAddress == request.Email.Trim(), ct);
        if (matchingBeneficiary is not null)
            user.LinkedBeneficiaryId = matchingBeneficiary.Id;

        var createResult = await userManager.CreateAsync(user, request.Password);
        if (!createResult.Succeeded)
            return Result<RegisterCitizenResponse>.Failure(
                createResult.Errors.Select(e => e.Description).ToList());

        await userManager.AddToRoleAsync(user, "Citizen");

        var token = await userManager.GenerateEmailConfirmationTokenAsync(user);
        var baseUrl = config["FrontendBaseUrl"]?.TrimEnd('/') ?? "";
        var link = $"{baseUrl}/verify-email?userId={Uri.EscapeDataString(user.Id)}&token={Uri.EscapeDataString(token)}";

        await emailService.SendAsync(
            user.Email!,
            "Verify your MSWD Caba citizen account",
            $"""
             <p>Magandang araw, {user.FullName}!</p>
             <p>Thank you for creating a citizen account with the Municipal Social Welfare and
             Development Office of Caba, La Union. Click the link below to verify your email
             address and activate your account.</p>
             <p><a href="{link}">Verify my email address</a></p>
             <p>If you did not create this account, you can safely ignore this email.</p>
             <p>— MSWD Caba, La Union</p>
             """,
            ct);

        db.AuditLogs.Add(new AuditLog
        {
            UserId = user.Id,
            UserName = user.UserName,
            Action = AuditAction.Create,
            EntityType = "ApplicationUser",
            EntityId = user.Id,
            Description = $"Citizen account '{user.UserName}' registered."
        });
        await db.SaveChangesAsync(ct);

        return Result<RegisterCitizenResponse>.Success(new RegisterCitizenResponse(
            user.Id,
            "Account created. Please check your email for a verification link before signing in.",
            env.IsDevelopment() ? link : null));
    }
}
