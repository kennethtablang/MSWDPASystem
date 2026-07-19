using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Features.Beneficiaries.RegisterBeneficiary;
using MSWDPASystem.Server.Features.DuplicateFlags.MergeDuplicate;
using MSWDPASystem.Server.Domain.Entities;

namespace MSWDPASystem.Server.Tests;

/// <summary>
/// FR-3.1 duplicate detection and FR-3.6 merge.
///
/// NFR-1.2 requires duplicate results to accurately reflect the underlying data,
/// and the merge is the single most destructive operation in the system — it moves
/// every record off one beneficiary and retires it. Both are covered here.
/// </summary>
public class DuplicateDetectionTests
{
    private static RegisterBeneficiaryCommand NewCommand(
        string firstName = "Maria",
        string lastName = "Reyes",
        DateOnly? dob = null) =>
        new(
            FirstName: firstName,
            MiddleName: null,
            LastName: lastName,
            Suffix: null,
            DateOfBirth: dob ?? new DateOnly(1960, 5, 12),
            Sex: Sex.Female,
            CivilStatus: CivilStatus.Married,
            Barangay: "Poblacion Norte",
            Address: "12 Rizal St",
            ContactNumber: null,
            EmailAddress: null,
            Occupation: null,
            MonthlyIncome: null,
            WelfareProgramIds: null);

    [Fact]
    public async Task First_registration_is_active_and_unflagged()
    {
        using var db = new TestDb();
        var handler = new RegisterBeneficiaryCommandHandler(db.Context, new FakeCurrentUser());

        var result = await handler.Handle(NewCommand(), default);

        Assert.True(result.IsSuccess);
        Assert.False(result.Data!.DuplicateFlagged);
        Assert.Equal(BeneficiaryStatus.Active, result.Data.Status);
        Assert.Empty(db.Context.DuplicateFlags);
    }

    [Fact]
    public async Task Matching_name_and_birth_date_raises_a_flag()
    {
        using var db = new TestDb();
        var handler = new RegisterBeneficiaryCommandHandler(db.Context, new FakeCurrentUser());

        await handler.Handle(NewCommand(), default);
        var second = await handler.Handle(NewCommand(), default);

        Assert.True(second.Data!.DuplicateFlagged);
        Assert.Equal(BeneficiaryStatus.Flagged, second.Data.Status);

        var flag = Assert.Single(db.Context.DuplicateFlags);
        Assert.Equal(DuplicateFlagStatus.Pending, flag.Status);
        Assert.True(flag.FlaggedBySystem);
    }

    [Theory]
    // Detection keys on first name, last name and date of birth together.
    [InlineData("Maria", "Reyes", 1960, 5, 13)]  // different day
    [InlineData("Maria", "Santos", 1960, 5, 12)] // different surname
    [InlineData("Marisa", "Reyes", 1960, 5, 12)] // different first name
    public async Task Any_differing_identifier_avoids_a_flag(
        string firstName, string lastName, int year, int month, int day)
    {
        using var db = new TestDb();
        var handler = new RegisterBeneficiaryCommandHandler(db.Context, new FakeCurrentUser());

        await handler.Handle(NewCommand(), default);
        var second = await handler.Handle(
            NewCommand(firstName, lastName, new DateOnly(year, month, day)), default);

        Assert.False(second.Data!.DuplicateFlagged);
        Assert.Empty(db.Context.DuplicateFlags);
    }

    [Fact]
    public async Task Client_numbers_run_sequentially_within_the_year()
    {
        using var db = new TestDb();
        var handler = new RegisterBeneficiaryCommandHandler(db.Context, new FakeCurrentUser());

        var first = await handler.Handle(NewCommand("Ana", "Cruz"), default);
        var second = await handler.Handle(NewCommand("Jose", "Bautista"), default);

        var year = DateTime.Today.Year;
        Assert.Equal($"CABA-{year}-0001", first.Data!.ClientNumber);
        Assert.Equal($"CABA-{year}-0002", second.Data!.ClientNumber);
    }

    [Fact]
    public async Task Registration_is_written_to_the_audit_trail()
    {
        using var db = new TestDb();
        var handler = new RegisterBeneficiaryCommandHandler(db.Context, new FakeCurrentUser());

        await handler.Handle(NewCommand(), default);

        var entry = Assert.Single(db.Context.AuditLogs);
        Assert.Equal(AuditAction.Create, entry.Action);
        Assert.Equal("Beneficiary", entry.EntityType);
        Assert.Equal("testuser", entry.UserName);
    }

    // ---- FR-3.6 merge ----

    private static async Task<(TestDb db, Beneficiary keep, Beneficiary merge, DuplicateFlag flag)>
        SetupMergePairAsync()
    {
        var db = new TestDb();
        var keep = db.AddBeneficiary("Maria", "Reyes", clientNumber: "CABA-2026-0001");
        var merge = db.AddBeneficiary("Maria", "Reyes", clientNumber: "CABA-2026-0002");

        var flag = new DuplicateFlag
        {
            OriginalBeneficiaryId = keep.Id,
            DuplicateBeneficiaryId = merge.Id,
            FlaggedBySystem = true,
            Status = DuplicateFlagStatus.Pending,
        };
        db.Context.DuplicateFlags.Add(flag);
        await db.Context.SaveChangesAsync();

        return (db, keep, merge, flag);
    }

    [Fact]
    public async Task Merge_moves_requests_and_documents_onto_the_surviving_record()
    {
        var (db, keep, merge, flag) = await SetupMergePairAsync();
        using var _ = db;

        var type = db.AddAssistanceType();
        db.AddRequest(merge.Id, type.Id);
        db.AddRequest(merge.Id, type.Id);
        db.Context.Documents.Add(new Document
        {
            BeneficiaryId = merge.Id,
            FileName = "indigency.pdf",
            FilePath = "/x",
            ContentType = "application/pdf",
        });
        await db.Context.SaveChangesAsync();

        var handler = new MergeDuplicateCommandHandler(db.Context, new FakeCurrentUser());
        var result = await handler.Handle(new MergeDuplicateCommand(flag.Id, keep.Id, "same person"), default);

        Assert.True(result.IsSuccess);
        Assert.Equal(2, result.Data!.MovedRequests);
        Assert.Equal(1, result.Data.MovedDocuments);

        Assert.Equal(2, await db.Context.AssistanceRequests.CountAsync(r => r.BeneficiaryId == keep.Id));
        Assert.Equal(0, await db.Context.AssistanceRequests.CountAsync(r => r.BeneficiaryId == merge.Id));
    }

    [Fact]
    public async Task Merge_retires_the_losing_record_rather_than_deleting_it()
    {
        var (db, keep, merge, flag) = await SetupMergePairAsync();
        using var _ = db;

        await new MergeDuplicateCommandHandler(db.Context, new FakeCurrentUser())
            .Handle(new MergeDuplicateCommand(flag.Id, keep.Id, null), default);

        var retired = await db.Context.Beneficiaries.FindAsync(merge.Id);

        // The client number must stay resolvable — it may be on a printed claim slip.
        Assert.NotNull(retired);
        Assert.Equal(BeneficiaryStatus.Inactive, retired!.Status);
        Assert.Equal("CABA-2026-0002", retired.ClientNumber);
    }

    [Fact]
    public async Task Merge_does_not_duplicate_a_program_both_records_share()
    {
        var (db, keep, merge, flag) = await SetupMergePairAsync();
        using var _ = db;

        var program = db.AddProgram();
        db.Context.BeneficiaryPrograms.AddRange(
            new BeneficiaryProgram
            {
                BeneficiaryId = keep.Id,
                WelfareProgramId = program.Id,
                EnrollmentDate = DateOnly.FromDateTime(DateTime.Today),
            },
            new BeneficiaryProgram
            {
                BeneficiaryId = merge.Id,
                WelfareProgramId = program.Id,
                EnrollmentDate = DateOnly.FromDateTime(DateTime.Today),
            });
        await db.Context.SaveChangesAsync();

        var result = await new MergeDuplicateCommandHandler(db.Context, new FakeCurrentUser())
            .Handle(new MergeDuplicateCommand(flag.Id, keep.Id, null), default);

        // The shared enrolment is dropped, not carried over into a key collision.
        Assert.Equal(0, result.Data!.MovedPrograms);
        Assert.Equal(1, await db.Context.BeneficiaryPrograms.CountAsync(bp => bp.BeneficiaryId == keep.Id));
        Assert.Equal(0, await db.Context.BeneficiaryPrograms.CountAsync(bp => bp.BeneficiaryId == merge.Id));
    }

    [Fact]
    public async Task Merge_fills_only_the_blanks_on_the_surviving_record()
    {
        var (db, keep, merge, flag) = await SetupMergePairAsync();
        using var _ = db;

        keep.ContactNumber = "09170000000";
        keep.Occupation = null;
        merge.ContactNumber = "09189999999";
        merge.Occupation = "Farmer";
        await db.Context.SaveChangesAsync();

        await new MergeDuplicateCommandHandler(db.Context, new FakeCurrentUser())
            .Handle(new MergeDuplicateCommand(flag.Id, keep.Id, null), default);

        var survivor = await db.Context.Beneficiaries.FindAsync(keep.Id);

        Assert.Equal("09170000000", survivor!.ContactNumber); // existing value preserved
        Assert.Equal("Farmer", survivor.Occupation);          // blank filled from the retired record
    }

    [Fact]
    public async Task Merge_can_keep_the_newer_record_instead()
    {
        var (db, keep, merge, flag) = await SetupMergePairAsync();
        using var _ = db;

        // Coordinator decides the flagged "duplicate" is the better record.
        var result = await new MergeDuplicateCommandHandler(db.Context, new FakeCurrentUser())
            .Handle(new MergeDuplicateCommand(flag.Id, merge.Id, null), default);

        Assert.True(result.IsSuccess);
        Assert.Equal(merge.Id, result.Data!.KeptBeneficiaryId);

        var retired = await db.Context.Beneficiaries.FindAsync(keep.Id);
        Assert.Equal(BeneficiaryStatus.Inactive, retired!.Status);
    }

    [Fact]
    public async Task Merge_rejects_a_record_outside_the_flagged_pair()
    {
        var (db, _, _, flag) = await SetupMergePairAsync();
        using var _d = db;
        var stranger = db.AddBeneficiary("Jose", "Bautista");

        var result = await new MergeDuplicateCommandHandler(db.Context, new FakeCurrentUser())
            .Handle(new MergeDuplicateCommand(flag.Id, stranger.Id, null), default);

        Assert.False(result.IsSuccess);
    }

    [Fact]
    public async Task Merge_refuses_an_already_resolved_flag()
    {
        var (db, keep, _, flag) = await SetupMergePairAsync();
        using var _ = db;

        flag.Status = DuplicateFlagStatus.Rejected;
        await db.Context.SaveChangesAsync();

        var result = await new MergeDuplicateCommandHandler(db.Context, new FakeCurrentUser())
            .Handle(new MergeDuplicateCommand(flag.Id, keep.Id, null), default);

        Assert.False(result.IsSuccess);
        Assert.Contains("already been resolved", result.Error);
    }
}
