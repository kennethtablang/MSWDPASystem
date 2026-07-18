using MSWDPASystem.Server.Domain.Entities;

namespace MSWDPASystem.Server.Common.Interfaces;

public interface ITokenService
{
    string GenerateAccessToken(ApplicationUser user, IList<string> roles);
    string GenerateRefreshToken();
    DateTime GetRefreshTokenExpiry();
}
