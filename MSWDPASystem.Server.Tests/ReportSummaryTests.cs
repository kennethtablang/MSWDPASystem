using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Features.Reports.GetSummary;

namespace MSWDPASystem.Server.Tests;

/// <summary>
/// FR-5.1/5.2/5.3 statistical reports and FR-5.8 filtering.
///
/// These figures are submitted to the LGU and DSWD, so a period boundary that is
/// off by a day or a filter that leaks other barangays into the count is a
/// reporting error with external consequences.
/// </summary>
public class ReportSummaryTests
{
    /// <summary>
    /// CreatedAt is set by the entity/database on insert, so tests that care about
    /// period boundaries have to place records explicitly afterwards.
    /// </summary>
    private static void Backdate(TestDb db, Guid beneficiaryId, DateTime createdAt)
    {
        var b = db.Context.Beneficiaries.Find(beneficiaryId)!;
        b.CreatedAt = createdAt;
        db.Context.SaveChanges();
    }

    [Fact]
    public async Task Daily_report_counts_only_the_reference_day()
    {
        using var db = new TestDb();
        var today = new DateTime(2026, 7, 15, 10, 0, 0);

        var inPeriod = db.AddBeneficiary("In", "Period");
        var yesterday = db.AddBeneficiary("Too", "Early");
        var tomorrow = db.AddBeneficiary("Too", "Late");

        Backdate(db, inPeriod.Id, today);
        Backdate(db, yesterday.Id, today.AddDays(-1));
        Backdate(db, tomorrow.Id, today.AddDays(1));

        var result = await new GetReportSummaryQueryHandler(db.Context)
            .Handle(new GetReportSummaryQuery(ReportPeriod.Daily, today), default);

        Assert.Equal(1, result.TotalRegistrations);
    }

    [Fact]
    public async Task Daily_period_includes_the_last_moment_of_the_day()
    {
        using var db = new TestDb();
        var day = new DateTime(2026, 7, 15);

        var justBeforeMidnight = db.AddBeneficiary("Late", "Entry");
        Backdate(db, justBeforeMidnight.Id, day.AddHours(23).AddMinutes(59));

        var result = await new GetReportSummaryQueryHandler(db.Context)
            .Handle(new GetReportSummaryQuery(ReportPeriod.Daily, day), default);

        // An exclusive end bound must still admit 23:59 on the reference day.
        Assert.Equal(1, result.TotalRegistrations);
    }

    [Fact]
    public async Task Monthly_report_spans_the_whole_calendar_month()
    {
        using var db = new TestDb();
        var reference = new DateTime(2026, 7, 15);

        var first = db.AddBeneficiary("First", "Day");
        var last = db.AddBeneficiary("Last", "Day");
        var nextMonth = db.AddBeneficiary("Next", "Month");

        Backdate(db, first.Id, new DateTime(2026, 7, 1));
        Backdate(db, last.Id, new DateTime(2026, 7, 31, 23, 0, 0));
        Backdate(db, nextMonth.Id, new DateTime(2026, 8, 1));

        var result = await new GetReportSummaryQueryHandler(db.Context)
            .Handle(new GetReportSummaryQuery(ReportPeriod.Monthly, reference), default);

        Assert.Equal(2, result.TotalRegistrations);
    }

    [Fact]
    public async Task Annual_report_spans_the_whole_year()
    {
        using var db = new TestDb();
        var reference = new DateTime(2026, 7, 15);

        var jan = db.AddBeneficiary("January", "Entry");
        var dec = db.AddBeneficiary("December", "Entry");
        var lastYear = db.AddBeneficiary("Previous", "Year");

        Backdate(db, jan.Id, new DateTime(2026, 1, 1));
        Backdate(db, dec.Id, new DateTime(2026, 12, 31, 12, 0, 0));
        Backdate(db, lastYear.Id, new DateTime(2025, 12, 31));

        var result = await new GetReportSummaryQueryHandler(db.Context)
            .Handle(new GetReportSummaryQuery(ReportPeriod.Annual, reference), default);

        Assert.Equal(2, result.TotalRegistrations);
    }

    [Fact]
    public async Task Barangay_filter_excludes_other_barangays()
    {
        using var db = new TestDb();
        var day = new DateTime(2026, 7, 15);

        var target = db.AddBeneficiary("In", "Barangay", barangay: "San Carlos");
        var other = db.AddBeneficiary("Other", "Barangay", barangay: "Urayong");
        Backdate(db, target.Id, day);
        Backdate(db, other.Id, day);

        var result = await new GetReportSummaryQueryHandler(db.Context)
            .Handle(new GetReportSummaryQuery(ReportPeriod.Daily, day, Barangay: "San Carlos"), default);

        Assert.Equal(1, result.TotalRegistrations);
        Assert.Equal("San Carlos", result.Barangay);
    }

    [Fact]
    public async Task Only_released_assistance_counts_towards_the_amount_released()
    {
        using var db = new TestDb();
        var day = new DateTime(2026, 7, 15);
        var beneficiary = db.AddBeneficiary();
        var type = db.AddAssistanceType();

        var released = db.AddRequest(beneficiary.Id, type.Id, 5000m, AssistanceRequestStatus.Released);
        var approved = db.AddRequest(beneficiary.Id, type.Id, 3000m, AssistanceRequestStatus.Approved);
        var denied = db.AddRequest(beneficiary.Id, type.Id, 9000m, AssistanceRequestStatus.Denied);

        foreach (var r in new[] { released, approved, denied })
        {
            var tracked = db.Context.AssistanceRequests.Find(r.Id)!;
            tracked.CreatedAt = day;
        }
        db.Context.SaveChanges();

        var result = await new GetReportSummaryQueryHandler(db.Context)
            .Handle(new GetReportSummaryQuery(ReportPeriod.Daily, day), default);

        Assert.Equal(3, result.TotalAssistanceRequests);
        // Approved-but-not-yet-released money has not left the office.
        Assert.Equal(5000m, result.TotalAmountReleased);
    }

    [Fact]
    public async Task Empty_period_reports_zeroes_rather_than_failing()
    {
        using var db = new TestDb();

        var result = await new GetReportSummaryQueryHandler(db.Context)
            .Handle(new GetReportSummaryQuery(ReportPeriod.Monthly, new DateTime(2020, 1, 15)), default);

        Assert.Equal(0, result.TotalRegistrations);
        Assert.Equal(0, result.TotalAssistanceRequests);
        Assert.Equal(0m, result.TotalAmountReleased);
        Assert.Empty(result.RegistrationsByBarangay);
    }

    [Fact]
    public async Task Demographic_breakdown_splits_by_sex()
    {
        using var db = new TestDb();
        var day = new DateTime(2026, 7, 15);

        foreach (var (first, sex) in new[]
                 {
                     ("Maria", Sex.Female), ("Ana", Sex.Female), ("Jose", Sex.Male),
                 })
        {
            var b = db.AddBeneficiary(first, "Test");
            var tracked = db.Context.Beneficiaries.Find(b.Id)!;
            tracked.Sex = sex;
            tracked.CreatedAt = day;
            db.Context.SaveChanges();
        }

        var result = await new GetReportSummaryQueryHandler(db.Context)
            .Handle(new GetReportSummaryQuery(ReportPeriod.Daily, day), default);

        Assert.Equal(3, result.TotalRegistrations);
        Assert.Equal(2, result.RegistrationsBySex.Single(x => x.Label == "Female").Count);
        Assert.Equal(1, result.RegistrationsBySex.Single(x => x.Label == "Male").Count);
    }
}
