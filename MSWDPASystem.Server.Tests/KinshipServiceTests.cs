using MSWDPASystem.Server.Common.Services;
using MSWDPASystem.Server.Domain.Enums;

namespace MSWDPASystem.Server.Tests;

/// <summary>
/// Degree-of-relationship calculation and the relatedness heuristic.
///
/// These matter because eligibility rules are written in terms of degree, and
/// because the heuristic drives what staff are shown as "possible relatives" —
/// a wrong answer either misses a related claim or accuses unrelated people.
/// </summary>
public class KinshipServiceTests
{
    [Fact]
    public async Task Same_person_is_degree_zero()
    {
        using var db = new TestDb();
        var maria = db.AddBeneficiary("Maria", "Reyes");
        var service = new KinshipService(db.Context);

        var result = await service.GetKinshipAsync(maria.Id, maria.Id);

        Assert.True(result.AreRelated);
        Assert.Equal(0, result.Degree);
    }

    [Fact]
    public async Task Parent_child_is_first_degree()
    {
        using var db = new TestDb();
        var maria = db.AddBeneficiary("Maria", "Reyes");
        var ana = db.AddBeneficiary("Ana", "Reyes");
        db.AddRelationship(ana.Id, maria.Id, RelationshipType.Parent);

        var result = await new KinshipService(db.Context).GetKinshipAsync(ana.Id, maria.Id);

        Assert.True(result.AreRelated);
        Assert.Equal(1, result.Degree);
        Assert.Equal("Parent", result.Description);
    }

    [Fact]
    public async Task Inverse_direction_reads_as_child()
    {
        using var db = new TestDb();
        var maria = db.AddBeneficiary("Maria", "Reyes");
        var ana = db.AddBeneficiary("Ana", "Reyes");
        db.AddRelationship(ana.Id, maria.Id, RelationshipType.Parent);

        var result = await new KinshipService(db.Context).GetKinshipAsync(maria.Id, ana.Id);

        Assert.Equal("Child", result.Description);
    }

    [Fact]
    public async Task Siblings_are_second_degree()
    {
        using var db = new TestDb();
        var ana = db.AddBeneficiary("Ana", "Reyes");
        var lito = db.AddBeneficiary("Lito", "Reyes");
        db.AddRelationship(ana.Id, lito.Id, RelationshipType.Sibling);

        var result = await new KinshipService(db.Context).GetKinshipAsync(ana.Id, lito.Id);

        Assert.Equal(2, result.Degree);
    }

    [Fact]
    public async Task Grandchild_is_reached_through_two_parent_hops()
    {
        using var db = new TestDb();
        var lola = db.AddBeneficiary("Iska", "Reyes");
        var maria = db.AddBeneficiary("Maria", "Reyes");
        var ana = db.AddBeneficiary("Ana", "Reyes");

        // Ana -> Maria -> Iska, one generation each hop.
        db.AddRelationship(ana.Id, maria.Id, RelationshipType.Parent);
        db.AddRelationship(maria.Id, lola.Id, RelationshipType.Parent);

        var result = await new KinshipService(db.Context).GetKinshipAsync(ana.Id, lola.Id);

        Assert.True(result.AreRelated);
        Assert.Equal(2, result.Degree);
        // Two hops, so the walk is reported rather than a single named relationship.
        Assert.Equal(2, result.Path.Count);
    }

    [Fact]
    public async Task Spouse_is_related_but_carries_no_consanguinity_degree()
    {
        using var db = new TestDb();
        var maria = db.AddBeneficiary("Maria", "Reyes");
        var pedro = db.AddBeneficiary("Pedro", "Santos");
        db.AddRelationship(maria.Id, pedro.Id, RelationshipType.Spouse);

        var result = await new KinshipService(db.Context).GetKinshipAsync(maria.Id, pedro.Id);

        Assert.True(result.AreRelated);
        Assert.Null(result.Degree);
    }

    [Fact]
    public async Task Path_of_only_marriage_links_reports_as_related_by_marriage()
    {
        using var db = new TestDb();
        var maria = db.AddBeneficiary("Maria", "Reyes");
        var pedro = db.AddBeneficiary("Pedro", "Santos");
        var pedrosMother = db.AddBeneficiary("Elena", "Santos");

        db.AddRelationship(maria.Id, pedro.Id, RelationshipType.Spouse);
        db.AddRelationship(pedro.Id, pedrosMother.Id, RelationshipType.ParentInLaw);

        var result = await new KinshipService(db.Context).GetKinshipAsync(maria.Id, pedrosMother.Id);

        Assert.True(result.AreRelated);
        Assert.Null(result.Degree);
        Assert.Equal("Related by marriage", result.Description);
    }

    [Fact]
    public async Task Unrelated_people_return_no_link()
    {
        using var db = new TestDb();
        var a = db.AddBeneficiary("Maria", "Reyes");
        var b = db.AddBeneficiary("Jose", "Bautista");

        var result = await new KinshipService(db.Context).GetKinshipAsync(a.Id, b.Id);

        Assert.False(result.AreRelated);
        Assert.Null(result.Degree);
        Assert.Empty(result.Path);
    }

    [Fact]
    public async Task Walk_stops_at_the_depth_limit()
    {
        using var db = new TestDb();

        // A chain of eight people, each the parent of the next.
        var chain = Enumerable.Range(0, 8)
            .Select(i => db.AddBeneficiary($"Person{i}", "Chain"))
            .ToList();
        for (var i = 0; i < chain.Count - 1; i++)
            db.AddRelationship(chain[i].Id, chain[i + 1].Id, RelationshipType.Parent);

        var service = new KinshipService(db.Context);

        var withinLimit = await service.GetKinshipAsync(chain[0].Id, chain[3].Id, maxDepth: 6);
        var beyondLimit = await service.GetKinshipAsync(chain[0].Id, chain[7].Id, maxDepth: 3);

        Assert.True(withinLimit.AreRelated);
        Assert.False(beyondLimit.AreRelated);
    }

    [Fact]
    public async Task Breadth_first_walk_returns_the_closest_link_not_the_first_found()
    {
        using var db = new TestDb();
        var a = db.AddBeneficiary("A", "Test");
        var b = db.AddBeneficiary("B", "Test");
        var middle = db.AddBeneficiary("M", "Test");

        // A and B are directly siblings, and also connected the long way round.
        db.AddRelationship(a.Id, middle.Id, RelationshipType.Parent);
        db.AddRelationship(middle.Id, b.Id, RelationshipType.Parent);
        db.AddRelationship(a.Id, b.Id, RelationshipType.Sibling);

        var result = await new KinshipService(db.Context).GetKinshipAsync(a.Id, b.Id);

        // The direct sibling edge is one hop, so that is what must be reported.
        Assert.Single(result.Path);
        Assert.Equal("Sibling", result.Description);
    }

    // ---- Relatedness heuristic ----

    [Fact]
    public async Task Shared_surname_and_address_scores_as_a_likely_relative()
    {
        using var db = new TestDb();
        var subject = db.AddBeneficiary("Maria", "Reyes", address: "12 Rizal St");
        db.AddBeneficiary("Ana", "Reyes", address: "12 Rizal St");

        var results = await new KinshipService(db.Context).FindLikelyRelativesAsync(subject.Id);

        var match = Assert.Single(results);
        Assert.Contains("Same surname", match.Reasons);
        Assert.Contains("Same address", match.Reasons);
        Assert.True(match.Score >= 60);
    }

    [Fact]
    public async Task Already_linked_relatives_are_not_suggested_again()
    {
        using var db = new TestDb();
        var subject = db.AddBeneficiary("Maria", "Reyes", address: "12 Rizal St");
        var ana = db.AddBeneficiary("Ana", "Reyes", address: "12 Rizal St");
        db.AddRelationship(subject.Id, ana.Id, RelationshipType.Child);

        var results = await new KinshipService(db.Context).FindLikelyRelativesAsync(subject.Id);

        Assert.Empty(results);
    }

    [Fact]
    public async Task Inactive_records_are_never_suggested()
    {
        using var db = new TestDb();
        var subject = db.AddBeneficiary("Maria", "Reyes", address: "12 Rizal St");
        db.AddBeneficiary("Ana", "Reyes", address: "12 Rizal St", status: BeneficiaryStatus.Inactive);

        var results = await new KinshipService(db.Context).FindLikelyRelativesAsync(subject.Id);

        Assert.Empty(results);
    }

    [Fact]
    public async Task Weak_matches_fall_below_the_threshold()
    {
        using var db = new TestDb();
        var subject = db.AddBeneficiary("Maria", "Reyes", barangay: "Poblacion Norte", address: "12 Rizal St");
        // Same barangay only (10 points) — far below the default minimum of 40.
        db.AddBeneficiary("Jose", "Bautista", barangay: "Poblacion Norte", address: "99 Bonifacio St");

        var results = await new KinshipService(db.Context).FindLikelyRelativesAsync(subject.Id);

        Assert.Empty(results);
    }

    [Fact]
    public async Task Results_are_ordered_with_the_strongest_match_first()
    {
        using var db = new TestDb();
        var household = db.AddHousehold().Id;
        var subject = db.AddBeneficiary("Maria", "Reyes", middleName: "Cruz",
            address: "12 Rizal St", householdId: household);

        // Surname only.
        db.AddBeneficiary("Weak", "Reyes", address: "99 Elsewhere St");
        // Surname + middle name + address + household.
        db.AddBeneficiary("Strong", "Reyes", middleName: "Cruz",
            address: "12 Rizal St", householdId: household);

        var results = await new KinshipService(db.Context).FindLikelyRelativesAsync(subject.Id);

        Assert.Equal(2, results.Count);
        Assert.Equal("Strong Reyes", results[0].FullName);
        Assert.True(results[0].Score > results[1].Score);
    }

    [Fact]
    public async Task Score_is_capped_at_one_hundred()
    {
        using var db = new TestDb();
        var household = db.AddHousehold().Id;
        var subject = db.AddBeneficiary("Maria", "Reyes", middleName: "Cruz",
            address: "12 Rizal St", contactNumber: "09171234567", householdId: household);
        db.AddBeneficiary("Ana", "Reyes", middleName: "Cruz",
            address: "12 Rizal St", contactNumber: "09171234567", householdId: household);

        var results = await new KinshipService(db.Context).FindLikelyRelativesAsync(subject.Id);

        Assert.Equal(100, Assert.Single(results).Score);
    }
}
