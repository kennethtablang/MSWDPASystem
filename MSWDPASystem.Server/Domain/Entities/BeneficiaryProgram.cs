namespace MSWDPASystem.Server.Domain.Entities;

public class BeneficiaryProgram
{
    public Guid BeneficiaryId { get; set; }
    public Beneficiary Beneficiary { get; set; } = null!;

    public Guid WelfareProgramId { get; set; }
    public WelfareProgram WelfareProgram { get; set; } = null!;

    public DateOnly EnrollmentDate { get; set; }
    public bool IsActive { get; set; } = true;
    public string? Notes { get; set; }
}
