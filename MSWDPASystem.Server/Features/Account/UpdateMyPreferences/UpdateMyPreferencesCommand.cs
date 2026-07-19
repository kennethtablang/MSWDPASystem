using MediatR;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Features.Account.GetMyAccount;

namespace MSWDPASystem.Server.Features.Account.UpdateMyPreferences;

/// <summary>
/// Mirrors <see cref="MyPreferencesDto"/>. Defaults are repeated here so a client
/// that omits a field gets the documented default rather than a zero value.
/// </summary>
public record UpdateMyPreferencesCommand(
    bool NotifyOnAssistanceStatus = true,
    bool NotifyOnNewMessage = true,
    bool NotifyOnDuplicateFlag = true,
    bool ShowToastNotifications = true,
    string FontScale = "base",
    string Theme = "system",
    string Density = "comfortable",
    bool SidebarCollapsedByDefault = false,
    string LandingPage = "/dashboard",
    int DefaultPageSize = 20,
    string? DefaultBarangay = null,
    bool AutoStartQrCamera = false,
    bool MaskSensitiveData = false,
    bool ConfirmBeforeLeaving = true
) : IRequest<Result<MyPreferencesDto>>;
