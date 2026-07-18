namespace MSWDPASystem.Server.Features.Reports.GetSummary;

public record ReportSummaryDto(
    string Period,
    string PeriodLabel,
    DateTime StartDate,
    DateTime EndDate,
    string? Barangay,
    string? ProgramName,
    // Registration statistics (FR-5.1/5.2/5.3 + FR-5.6 demographics)
    int TotalRegistrations,
    List<LabelCount> RegistrationsBySex,
    List<LabelCount> RegistrationsByAgeGroup,
    List<LabelCount> RegistrationsByBarangay,
    List<LabelCount> RegistrationsByProgram,
    // Assistance statistics (FR-5.7 assistance distribution)
    int TotalAssistanceRequests,
    decimal TotalAmountReleased,
    List<LabelCount> AssistanceByStatus,
    List<LabelAmount> AssistanceByType
);

public record LabelCount(string Label, int Count);

public record LabelAmount(string Label, int Count, decimal Amount);
