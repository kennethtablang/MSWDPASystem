using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Domain.Entities;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Features.DuplicateFlags.MergeDuplicate;

namespace MSWDPASystem.Server.Tests;

/// <summary>
/// FR-3.6 merge. The core reassignments (requests, documents, scan logs) are
/// straightforward moves; the cases worth pinning down are the graph-shaped ones:
/// relationship edges must follow the surviving record without creating self-loops
/// or colliding on the unique (BeneficiaryId, RelativeId) pair, and assisted-service
/// records must follow the person in both roles they can appear in.
/// </summary>
public class MergeDuplicateTests
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

    private static Task<Result<MergeDuplicateResponse>> Merge(TestDb db, DuplicateFlag flag, Guid keepId)
        => new MergeDuplicateCommandHandler(db.Context, new FakeCurrentUser())
            .Handle(new MergeDuplicateCommand(flag.Id, keepId, null), default);

    [Fact]
    public async Task Merge_moves_assistance_requests_to_the_kept_record()
    {
        using var db = new TestDb();
        var keep = db.AddBeneficiary("Maria", "Reyes");
        var dupe = db.AddBeneficiary("Maria", "Reyes", status: BeneficiaryStatus.Flagged);
        var type = db.AddAssistanceType();
        db.AddRequest(dupe.Id, type.Id);
        var flag = AddFlag(db, keep.Id, dupe.Id);

        await Merge(db, flag, keep.Id);

        Assert.Equal(1, await db.Context.AssistanceRequests.CountAsync(r => r.BeneficiaryId == keep.Id));
        Assert.Equal(0, await db.Context.AssistanceRequests.CountAsync(r => r.BeneficiaryId == dupe.Id));
        Assert.Equal(BeneficiaryStatus.Inactive, db.Context.Beneficiaries.Find(dupe.Id)!.Status);
    }

    [Fact]
    public async Task Merge_moves_assisted_transactions_in_both_roles()
    {
        using var db = new TestDb();
        var keep = db.AddBeneficiary("Maria", "Reyes");
        var dupe = db.AddBeneficiary("Maria", "Reyes", status: BeneficiaryStatus.Flagged);
        var other = db.AddBeneficiary("Jose", "Santos");

        db.Context.AssistedTransactions.Add(new AssistedTransaction
        {
            BeneficiaryId = dupe.Id,
            ServiceType = AssistedServiceType.RequestFiling,
            Reason = AssistanceReason.Elderly,
        });
        db.Context.AssistedTransactions.Add(new AssistedTransaction
        {
            BeneficiaryId = other.Id,
            RepresentativeBeneficiaryId = dupe.Id,
            BeneficiaryPresent = false,
            ServiceType = AssistedServiceType.RequestFiling,
            Reason = AssistanceReason.Elderly,
        });
        db.Context.SaveChanges();
        var flag = AddFlag(db, keep.Id, dupe.Id);

        await Merge(db, flag, keep.Id);

        Assert.Equal(1, await db.Context.AssistedTransactions.CountAsync(t => t.BeneficiaryId == keep.Id));
        Assert.Equal(1, await db.Context.AssistedTransactions.CountAsync(t => t.RepresentativeBeneficiaryId == keep.Id));
        Assert.Equal(0, await db.Context.AssistedTransactions.CountAsync(
            t => t.BeneficiaryId == dupe.Id || t.RepresentativeBeneficiaryId == dupe.Id));
    }

    [Fact]
    public async Task Merge_reassigns_relationship_edges_to_the_kept_record()
    {
        using var db = new TestDb();
        var keep = db.AddBeneficiary("Maria", "Reyes");
        var dupe = db.AddBeneficiary("Maria", "Reyes", status: BeneficiaryStatus.Flagged);
        var child = db.AddBeneficiary("Ana", "Reyes");
        db.AddRelationship(dupe.Id, child.Id, RelationshipType.Child);
        var flag = AddFlag(db, keep.Id, dupe.Id);

        await Merge(db, flag, keep.Id);

        var edges = await db.Context.BeneficiaryRelationships.ToListAsync();
        Assert.Equal(2, edges.Count);
        Assert.Contains(edges, e => e.BeneficiaryId == keep.Id && e.RelativeId == child.Id);
        Assert.Contains(edges, e => e.BeneficiaryId == child.Id && e.RelativeId == keep.Id);
        Assert.DoesNotContain(edges, e => e.BeneficiaryId == dupe.Id || e.RelativeId == dupe.Id);
    }

    [Fact]
    public async Task Merge_drops_edges_between_the_two_records_instead_of_creating_self_loops()
    {
        using var db = new TestDb();
        var keep = db.AddBeneficiary("Maria", "Reyes");
        var dupe = db.AddBeneficiary("Maria", "Reyes", status: BeneficiaryStatus.Flagged);
        db.AddRelationship(keep.Id, dupe.Id, RelationshipType.Sibling);
        var flag = AddFlag(db, keep.Id, dupe.Id);

        await Merge(db, flag, keep.Id);

        Assert.Empty(await db.Context.BeneficiaryRelationships.ToListAsync());
    }

    [Fact]
    public async Task Merge_does_not_duplicate_an_edge_both_records_already_declared()
    {
        using var db = new TestDb();
        var keep = db.AddBeneficiary("Maria", "Reyes");
        var dupe = db.AddBeneficiary("Maria", "Reyes", status: BeneficiaryStatus.Flagged);
        var child = db.AddBeneficiary("Ana", "Reyes");
        db.AddRelationship(keep.Id, child.Id, RelationshipType.Child);
        db.AddRelationship(dupe.Id, child.Id, RelationshipType.Child);
        var flag = AddFlag(db, keep.Id, dupe.Id);

        var result = await Merge(db, flag, keep.Id);

        Assert.True(result.IsSuccess);
        var edges = await db.Context.BeneficiaryRelationships.ToListAsync();
        Assert.Equal(2, edges.Count);
        Assert.Contains(edges, e => e.BeneficiaryId == keep.Id && e.RelativeId == child.Id);
        Assert.Contains(edges, e => e.BeneficiaryId == child.Id && e.RelativeId == keep.Id);
    }
}
