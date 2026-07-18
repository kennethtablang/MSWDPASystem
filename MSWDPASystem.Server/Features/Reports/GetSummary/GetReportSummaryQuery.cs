using MediatR;

namespace MSWDPASystem.Server.Features.Reports.GetSummary;

public enum ReportPeriod
{
    Daily,
    Monthly,
    Annual
}

public record GetReportSummaryQuery(
    ReportPeriod Period,
    DateTime? ReferenceDate = null,
    string? Barangay = null,
    Guid? ProgramId = null
) : IRequest<ReportSummaryDto>;
