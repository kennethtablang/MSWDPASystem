using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Common.Services;

public record KinshipResult(
    bool AreRelated,
    int? Degree,
    string Description,
    IReadOnlyList<KinshipStep> Path
);

public record KinshipStep(Guid BeneficiaryId, string FullName, RelationshipType Type);

public record RelatednessResult(
    Guid BeneficiaryId,
    string ClientNumber,
    string FullName,
    int Score,
    IReadOnlyList<string> Reasons
);

/// <summary>
/// Answers "how closely are these two people related?" in two different ways.
///
/// 1. <see cref="GetKinshipAsync"/> walks the *declared* relationship graph and
///    returns a civil-law degree of relationship — the count of steps between two
///    people through their nearest common ancestor. This is exact.
///
/// 2. <see cref="FindLikelyRelativesAsync"/> scores *undeclared* records on shared
///    surname, address and barangay. This is a heuristic and is deliberately kept
///    separate: it produces leads for staff to confirm, never a fact.
/// </summary>
public class KinshipService(ApplicationDbContext db)
{
    // Steps that move one generation or stay within one, used to weight the walk.
    private static readonly Dictionary<RelationshipType, int> StepCost = new()
    {
        [RelationshipType.Parent] = 1,
        [RelationshipType.Child] = 1,
        [RelationshipType.Sibling] = 2,      // via the shared parent
        [RelationshipType.Grandparent] = 2,
        [RelationshipType.Grandchild] = 2,
        [RelationshipType.AuntUncle] = 3,
        [RelationshipType.NieceNephew] = 3,
        [RelationshipType.Cousin] = 4,
        // Affinity (marriage) links carry no degree of consanguinity, but still
        // matter for household-level claim checks, so they cost 0 and are labelled.
        [RelationshipType.Spouse] = 0,
        [RelationshipType.ParentInLaw] = 0,
        [RelationshipType.ChildInLaw] = 0,
        [RelationshipType.SiblingInLaw] = 0,
        [RelationshipType.Guardian] = 0,
        [RelationshipType.Ward] = 0,
        [RelationshipType.Other] = 1,
    };

    private static readonly HashSet<RelationshipType> Affinity =
    [
        RelationshipType.Spouse, RelationshipType.ParentInLaw,
        RelationshipType.ChildInLaw, RelationshipType.SiblingInLaw,
        RelationshipType.Guardian, RelationshipType.Ward,
    ];

    /// <summary>
    /// Shortest declared path between two beneficiaries, as a degree of relationship.
    /// Breadth-first, so the first path found is the closest one.
    /// </summary>
    public async Task<KinshipResult> GetKinshipAsync(Guid fromId, Guid toId, int maxDepth = 6, CancellationToken ct = default)
    {
        if (fromId == toId)
            return new KinshipResult(true, 0, "Same person", []);

        // The whole edge set is small (one row per declared link per direction) and
        // a BFS issuing one query per hop would be far more expensive than this.
        var edges = await db.BeneficiaryRelationships
            .AsNoTracking()
            .Select(r => new { r.BeneficiaryId, r.RelativeId, r.Type })
            .ToListAsync(ct);

        var adjacency = edges
            .GroupBy(e => e.BeneficiaryId)
            .ToDictionary(g => g.Key, g => g.Select(e => (e.RelativeId, e.Type)).ToList());

        var visited = new HashSet<Guid> { fromId };
        var queue = new Queue<(Guid Id, int Cost, int Hops, List<(Guid Id, RelationshipType Type)> Path)>();
        queue.Enqueue((fromId, 0, 0, []));

        while (queue.Count > 0)
        {
            var (currentId, cost, hops, path) = queue.Dequeue();
            if (hops >= maxDepth) continue;
            if (!adjacency.TryGetValue(currentId, out var neighbours)) continue;

            foreach (var (neighbourId, type) in neighbours)
            {
                if (!visited.Add(neighbourId)) continue;

                var nextPath = new List<(Guid, RelationshipType)>(path) { (neighbourId, type) };
                var nextCost = cost + StepCost.GetValueOrDefault(type, 1);

                if (neighbourId == toId)
                    return await BuildResultAsync(nextPath, nextCost, ct);

                queue.Enqueue((neighbourId, nextCost, hops + 1, nextPath));
            }
        }

        return new KinshipResult(false, null, "No declared family link", []);
    }

    private async Task<KinshipResult> BuildResultAsync(
        List<(Guid Id, RelationshipType Type)> path, int degree, CancellationToken ct)
    {
        var ids = path.Select(p => p.Id).ToList();
        var names = await db.Beneficiaries.AsNoTracking()
            .Where(b => ids.Contains(b.Id))
            .Select(b => new { b.Id, b.FirstName, b.MiddleName, b.LastName, b.Suffix })
            .ToListAsync(ct);

        var steps = path.Select(p =>
        {
            var n = names.FirstOrDefault(x => x.Id == p.Id);
            var full = n is null ? "Unknown" : $"{n.FirstName} {n.LastName}".Trim();
            return new KinshipStep(p.Id, full, p.Type);
        }).ToList();

        // A path made only of marriage/guardianship links is a relationship of
        // affinity, which has no consanguinity degree to report.
        var isAffinityOnly = path.All(p => Affinity.Contains(p.Type));
        var direct = path.Count == 1;

        var description = direct
            ? Humanise(path[0].Type)
            : isAffinityOnly
                ? "Related by marriage"
                : $"{Ordinal(degree)} degree relative";

        return new KinshipResult(true, isAffinityOnly ? null : degree, description, steps);
    }

    private static string Humanise(RelationshipType type) => type switch
    {
        RelationshipType.AuntUncle => "Aunt / Uncle",
        RelationshipType.NieceNephew => "Niece / Nephew",
        RelationshipType.ParentInLaw => "Parent-in-law",
        RelationshipType.ChildInLaw => "Child-in-law",
        RelationshipType.SiblingInLaw => "Sibling-in-law",
        _ => type.ToString(),
    };

    private static string Ordinal(int n) => n switch
    {
        1 => "1st", 2 => "2nd", 3 => "3rd", _ => $"{n}th",
    };

    /// <summary>
    /// Heuristic search for records that look like relatives of the given
    /// beneficiary but carry no declared link yet. Intended to surface candidates
    /// for staff to confirm — never treated as an established relationship.
    /// </summary>
    public async Task<List<RelatednessResult>> FindLikelyRelativesAsync(
        Guid beneficiaryId, int minimumScore = 40, CancellationToken ct = default)
    {
        var subject = await db.Beneficiaries.AsNoTracking()
            .FirstOrDefaultAsync(b => b.Id == beneficiaryId, ct);
        if (subject is null) return [];

        var alreadyLinked = await db.BeneficiaryRelationships.AsNoTracking()
            .Where(r => r.BeneficiaryId == beneficiaryId)
            .Select(r => r.RelativeId)
            .ToListAsync(ct);

        // Narrowed in the database first: only records sharing a surname or an
        // address are ever plausible, and scanning every beneficiary would not
        // scale past the office's first few thousand records.
        var candidates = await db.Beneficiaries.AsNoTracking()
            .Where(b => b.Id != beneficiaryId
                        && b.Status != BeneficiaryStatus.Inactive
                        && !alreadyLinked.Contains(b.Id)
                        && (b.LastName == subject.LastName || b.Address == subject.Address))
            .Select(b => new
            {
                b.Id, b.ClientNumber, b.FirstName, b.MiddleName, b.LastName, b.Suffix,
                b.Address, b.Barangay, b.HouseholdId, b.ContactNumber,
            })
            .Take(200)
            .ToListAsync(ct);

        var results = new List<RelatednessResult>();

        foreach (var c in candidates)
        {
            var score = 0;
            var reasons = new List<string>();

            if (string.Equals(c.LastName, subject.LastName, StringComparison.OrdinalIgnoreCase))
            {
                score += 35;
                reasons.Add("Same surname");
            }

            // A shared mother's maiden name in the middle name is a strong signal
            // among siblings in Philippine naming convention.
            if (!string.IsNullOrWhiteSpace(c.MiddleName) &&
                string.Equals(c.MiddleName, subject.MiddleName, StringComparison.OrdinalIgnoreCase))
            {
                score += 25;
                reasons.Add("Same middle name");
            }

            if (string.Equals(c.Address, subject.Address, StringComparison.OrdinalIgnoreCase))
            {
                score += 25;
                reasons.Add("Same address");
            }
            else if (string.Equals(c.Barangay, subject.Barangay, StringComparison.OrdinalIgnoreCase))
            {
                score += 10;
                reasons.Add("Same barangay");
            }

            if (c.HouseholdId is not null && c.HouseholdId == subject.HouseholdId)
            {
                score += 30;
                reasons.Add("Same household");
            }

            if (!string.IsNullOrWhiteSpace(c.ContactNumber) &&
                c.ContactNumber == subject.ContactNumber)
            {
                score += 15;
                reasons.Add("Same contact number");
            }

            if (score < minimumScore) continue;

            var fullName = $"{c.FirstName} {c.LastName}{(c.Suffix != null ? " " + c.Suffix : "")}".Trim();
            results.Add(new RelatednessResult(c.Id, c.ClientNumber, fullName, Math.Min(score, 100), reasons));
        }

        return results.OrderByDescending(r => r.Score).ToList();
    }
}
