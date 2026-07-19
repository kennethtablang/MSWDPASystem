using System.Text.Json;
using MediatR;
using Microsoft.AspNetCore.Identity;
using MSWDPASystem.Server.Common.Interfaces;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Domain.Entities;
using MSWDPASystem.Server.Features.Account.GetMyAccount;

namespace MSWDPASystem.Server.Features.Account.UpdateMyPreferences;

public class UpdateMyPreferencesCommandHandler(
    UserManager<ApplicationUser> userManager,
    ICurrentUserService currentUser)
    : IRequestHandler<UpdateMyPreferencesCommand, Result<MyPreferencesDto>>
{
    private static readonly string[] AllowedFontScales = ["base", "lg", "xl"];
    private static readonly string[] AllowedThemes = ["light", "dark", "system"];
    private static readonly string[] AllowedDensities = ["comfortable", "compact"];
    private static readonly int[] AllowedPageSizes = [10, 20, 50, 100];

    /// <summary>
    /// Landing pages a user may choose. Restricted to a known list rather than any
    /// string: this value is used to redirect after sign-in, so accepting arbitrary
    /// input would turn a preference into an open-redirect vector.
    /// </summary>
    private static readonly string[] AllowedLandingPages =
    [
        "/dashboard", "/beneficiaries", "/assistance", "/verification",
        "/households", "/messages", "/portal",
    ];

    private static string Pick(string[] allowed, string value, string fallback) =>
        allowed.Contains(value) ? value : fallback;

    public async Task<Result<MyPreferencesDto>> Handle(
        UpdateMyPreferencesCommand request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(currentUser.UserId))
            return Result<MyPreferencesDto>.Failure("Not authenticated.");

        var user = await userManager.FindByIdAsync(currentUser.UserId);
        if (user == null)
            return Result<MyPreferencesDto>.Failure("Account not found.");

        // Every constrained value is re-checked here. The client restricts these to
        // dropdowns, but the endpoint is reachable directly.
        var prefs = new MyPreferencesDto(
            NotifyOnAssistanceStatus: request.NotifyOnAssistanceStatus,
            NotifyOnNewMessage: request.NotifyOnNewMessage,
            NotifyOnDuplicateFlag: request.NotifyOnDuplicateFlag,
            ShowToastNotifications: request.ShowToastNotifications,
            FontScale: Pick(AllowedFontScales, request.FontScale, "base"),
            Theme: Pick(AllowedThemes, request.Theme, "system"),
            Density: Pick(AllowedDensities, request.Density, "comfortable"),
            SidebarCollapsedByDefault: request.SidebarCollapsedByDefault,
            LandingPage: Pick(AllowedLandingPages, request.LandingPage, "/dashboard"),
            DefaultPageSize: AllowedPageSizes.Contains(request.DefaultPageSize)
                ? request.DefaultPageSize
                : 20,
            DefaultBarangay: string.IsNullOrWhiteSpace(request.DefaultBarangay)
                ? null
                : request.DefaultBarangay.Trim(),
            AutoStartQrCamera: request.AutoStartQrCamera,
            MaskSensitiveData: request.MaskSensitiveData,
            ConfirmBeforeLeaving: request.ConfirmBeforeLeaving);

        user.Preferences = JsonSerializer.Serialize(prefs, GetMyAccountQueryHandler.JsonOptions);

        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
            return Result<MyPreferencesDto>.Failure(result.Errors.Select(e => e.Description).ToList());

        // Preferences are low-value personalisation, so they are intentionally not audited.
        return Result<MyPreferencesDto>.Success(prefs);
    }
}
