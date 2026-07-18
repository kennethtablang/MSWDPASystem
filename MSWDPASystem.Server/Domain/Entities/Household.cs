namespace MSWDPASystem.Server.Domain.Entities;

public class Household : BaseEntity
{
    public string HouseholdNumber { get; set; } = string.Empty;
    public string Barangay { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? HeadOfHouseholdName { get; set; }

    public ICollection<Beneficiary> Members { get; set; } = [];
}
