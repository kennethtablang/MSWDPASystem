using MediatR;
using MSWDPASystem.Server.Common.Models;

namespace MSWDPASystem.Server.Features.Account.GetMyAccount;

public record GetMyAccountQuery : IRequest<Result<MyAccountDto>>;

public record MyAccountDto(
    string UserId,
    string UserName,
    string FullName,
    string Email,
    string? ContactNumber,
    string Role,
    DateTime CreatedAt,
    DateTime? LastLoginAt,
    MyPreferencesDto Preferences
);

/// <summary>
/// Per-user preferences, persisted as JSON on the user record.
///
/// Every value here changes observable behaviour somewhere — a setting that does
/// nothing is worse than no setting, because staff will assume it works. Defaults
/// are the behaviour the system had before the option existed, so an account that
/// has never opened Settings is unaffected.
/// </summary>
public record MyPreferencesDto(
    // ---- Notifications ----
    bool NotifyOnAssistanceStatus = true,
    bool NotifyOnNewMessage = true,
    bool NotifyOnDuplicateFlag = true,
    /// <summary>Raise a toast as notifications arrive, not just the bell badge.</summary>
    bool ShowToastNotifications = true,

    // ---- Appearance ----
    string FontScale = "base",
    /// <summary>"light", "dark" or "system".</summary>
    string Theme = "system",
    /// <summary>"comfortable" or "compact" — row height in tables and lists.</summary>
    string Density = "comfortable",
    bool SidebarCollapsedByDefault = false,

    // ---- Workflow defaults ----
    /// <summary>Route to open after sign-in, e.g. "/dashboard" or "/verification".</summary>
    string LandingPage = "/dashboard",
    /// <summary>Rows per page in list views.</summary>
    int DefaultPageSize = 20,
    /// <summary>Pre-applies a barangay filter for staff assigned to one barangay.</summary>
    string? DefaultBarangay = null,
    /// <summary>Start the camera automatically on the QR verification page.</summary>
    bool AutoStartQrCamera = false,

    // ---- Privacy ----
    /// <summary>
    /// Hide contact numbers and income until revealed. Front desks are overlooked
    /// by the queue, and this data is protected under RA 10173.
    /// </summary>
    bool MaskSensitiveData = false,
    /// <summary>Warn before leaving a form with unsaved changes.</summary>
    bool ConfirmBeforeLeaving = true
);
