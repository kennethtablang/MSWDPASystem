using Microsoft.AspNetCore.Identity;

namespace MSWDPASystem.Server.Domain.Entities;

public class ApplicationUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiry { get; set; }

    // FR-1.5: per-staff data-access configuration (JSON array of allowed module keys).
    // Null = full default access for the user's role.
    public string? ModuleAccess { get; set; }

    // Citizen accounts: link to the beneficiary record verified by MSWD staff.
    public Guid? LinkedBeneficiaryId { get; set; }
    public Beneficiary? LinkedBeneficiary { get; set; }
}
