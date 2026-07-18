namespace MSWDPASystem.Server.Features.Auth.RegisterCitizen;

public record RegisterCitizenResponse(
    string UserId,
    string Message,
    string? DevConfirmationLink
);
