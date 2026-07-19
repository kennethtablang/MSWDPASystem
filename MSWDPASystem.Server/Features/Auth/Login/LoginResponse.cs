using MSWDPASystem.Server.Features.Account.GetMyAccount;

namespace MSWDPASystem.Server.Features.Auth.Login;

public record LoginResponse(
    string AccessToken,
    string RefreshToken,
    DateTime AccessTokenExpiry,
    string UserId,
    string UserName,
    string FullName,
    string Email,
    string Role,
    List<string>? AllowedModules,
    /// <summary>
    /// Returned with the sign-in so the client can honour the chosen landing page
    /// and appearance on the very first render, rather than flashing the default
    /// while a second request for the account completes.
    /// </summary>
    MyPreferencesDto Preferences
);
