namespace MSWDPASystem.Server.Features.Auth.Login;

public record LoginResponse(
    string AccessToken,
    string RefreshToken,
    DateTime AccessTokenExpiry,
    string UserId,
    string UserName,
    string FullName,
    string Email,
    string Role
);
