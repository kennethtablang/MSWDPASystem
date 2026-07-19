using MSWDPASystem.Server.Domain.Entities;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Features.DuplicateFlags.ResolveFlag;

namespace MSWDPASystem.Server.Tests;

/// <summary>
/// FR-3.6 confirm/reject resolution.
///
/// The reactivation rule is the subtle part: rejecting one flag must not return a
/// record to Active while another flag against it is still pending, or a record
/// under review silently becomes usable again.
/// </summary>
public class ResolveFlagTests
{
    private static DuplicateFlag AddFlag(TestDb db, Guid originalId, Guid duplicateId)
    {
        var flag = new DuplicateFlag
        {
            OriginalBeneficiaryId = originalId,
            DuplicateBeneficiaryId = duplicateId,
            FlaggedBySystem = true,
            Status = DuplicateFlagStatus.Pending,
        };
        db.Context.DuplicateFlags.Add(flag);
        db.Context.SaveChanges();
        return flag;
    }

    [Fact]
    public async Task Confirming_deactivates_the_duplicate()
    {
        using var db = new TestDb();
        var original = db.AddBeneficiary("Maria", "Reyes");
        var duplicate = db.AddBeneficiary("Maria", "Reyes", status: BeneficiaryStatus.Flagged);
        var flag = AddFlag(db, original.Id, duplicate.Id);

        var result = await new ResolveFlagCommandHandler(db.Context, new FakeCurrentUser())
            .Handle(new ResolveFlagCommand(flag.Id, DuplicateFlagStatus.Confirmed, "same person"), default);

        Assert.True(result.IsSuccess);
        Assert.Equal(BeneficiaryStatus.Inactive, db.Context.Beneficiaries.Find(duplicate.Id)!.Status);
        Assert.Equal(BeneficiaryStatus.Active, db.Context.Beneficiaries.Find(original.Id)!.Status);
    }

    [Fact]
    public async Task Rejecting_returns_the_record_to_active()
    {
        using var db = new TestDb();
        var original = db.AddBeneficiary("Maria", "Reyes");
        var duplicate = db.AddBeneficiary("Maria", "Reyes", status: BeneficiaryStatus.Flagged);
        var flag = AddFlag(db, original.Id, duplicate.Id);

        await new ResolveFlagCommandHandler(db.Context, new FakeCurrentUser())
            .Handle(new ResolveFlagCommand(flag.Id, DuplicateFlagStatus.Rejected, "different people"), default);

        Assert.Equal(BeneficiaryStatus.Active, db.Context.Beneficiaries.Find(duplicate.Id)!.Status);
    }

    [Fact]
    public async Task Rejecting_leaves_the_record_flagged_while_another_flag_is_pending()
    {
        using var db = new TestDb();
        var firstOriginal = db.AddBeneficiary("Maria", "Reyes");
        var secondOriginal = db.AddBeneficiary("Maria", "Reyes");
        var duplicate = db.AddBeneficiary("Maria", "Reyes", status: BeneficiaryStatus.Flagged);

        var flagOne = AddFlag(db, firstOriginal.Id, duplicate.Id);
        AddFlag(db, secondOriginal.Id, duplicate.Id); // still pending

        await new ResolveFlagCommandHandler(db.Context, new FakeCurrentUser())
            .Handle(new ResolveFlagCommand(flagOne.Id, DuplicateFlagStatus.Rejected, null), default);

        // One flag cleared, but the record is still under review by the other.
        Assert.Equal(BeneficiaryStatus.Flagged, db.Context.Beneficiaries.Find(duplicate.Id)!.Status);
    }

    [Fact]
    public async Task Clearing_the_last_pending_flag_reactivates_the_record()
    {
        using var db = new TestDb();
        var firstOriginal = db.AddBeneficiary("Maria", "Reyes");
        var secondOriginal = db.AddBeneficiary("Maria", "Reyes");
        var duplicate = db.AddBeneficiary("Maria", "Reyes", status: BeneficiaryStatus.Flagged);

        var flagOne = AddFlag(db, firstOriginal.Id, duplicate.Id);
        var flagTwo = AddFlag(db, secondOriginal.Id, duplicate.Id);

        var handler = new ResolveFlagCommandHandler(db.Context, new FakeCurrentUser());
        await handler.Handle(new ResolveFlagCommand(flagOne.Id, DuplicateFlagStatus.Rejected, null), default);
        await handler.Handle(new ResolveFlagCommand(flagTwo.Id, DuplicateFlagStatus.Rejected, null), default);

        Assert.Equal(BeneficiaryStatus.Active, db.Context.Beneficiaries.Find(duplicate.Id)!.Status);
    }

    [Fact]
    public async Task Pending_is_not_a_valid_resolution()
    {
        using var db = new TestDb();
        var original = db.AddBeneficiary("Maria", "Reyes");
        var duplicate = db.AddBeneficiary("Maria", "Reyes", status: BeneficiaryStatus.Flagged);
        var flag = AddFlag(db, original.Id, duplicate.Id);

        var result = await new ResolveFlagCommandHandler(db.Context, new FakeCurrentUser())
            .Handle(new ResolveFlagCommand(flag.Id, DuplicateFlagStatus.Pending, null), default);

        Assert.False(result.IsSuccess);
    }

    [Fact]
    public async Task Resolution_records_who_decided_and_when()
    {
        using var db = new TestDb();
        var original = db.AddBeneficiary("Maria", "Reyes");
        var duplicate = db.AddBeneficiary("Maria", "Reyes", status: BeneficiaryStatus.Flagged);
        var flag = AddFlag(db, original.Id, duplicate.Id);

        await new ResolveFlagCommandHandler(db.Context, new FakeCurrentUser("coord-1", "coordinator"))
            .Handle(new ResolveFlagCommand(flag.Id, DuplicateFlagStatus.Confirmed, "verified in person"), default);

        var resolved = db.Context.DuplicateFlags.Find(flag.Id)!;
        Assert.Equal("coord-1", resolved.ResolvedByUserId);
        Assert.NotNull(resolved.ResolvedAt);
        Assert.Equal("verified in person", resolved.ResolutionNotes);

        var audit = Assert.Single(db.Context.AuditLogs);
        Assert.Equal(AuditAction.DuplicateResolution, audit.Action);
    }
}
