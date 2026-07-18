namespace MSWDPASystem.Server.Features.Users.GetUsers;

public record GetUsersResponse(
    string Id,
    string UserName,
    string FullName,
    string Email,
    string Role,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? LastLoginAt
);
