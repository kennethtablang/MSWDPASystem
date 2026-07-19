using MSWDPASystem.Server.Domain.Enums;

namespace MSWDPASystem.Server.Domain.Entities;

/// <summary>
/// A declared family link between two beneficiaries.
///
/// Stored as a directed edge so the label reads correctly from each side
/// ("Ana is the Child of Maria" / "Maria is the Parent of Ana"). Both edges are
/// written together and removed together, which keeps traversal simple: the
/// degree calculator can walk the graph without special-casing direction.
/// </summary>
public class BeneficiaryRelationship : BaseEntity
{
    public Guid BeneficiaryId { get; set; }
    public Beneficiary Beneficiary { get; set; } = null!;

    public Guid RelativeId { get; set; }
    public Beneficiary Relative { get; set; } = null!;

    /// <summary>What the Relative is *to* the Beneficiary.</summary>
    public RelationshipType Type { get; set; }

    /// <summary>
    /// True for links created by the system (household inference) rather than
    /// declared by staff, so an inferred link can be distinguished on screen.
    /// </summary>
    public bool IsInferred { get; set; }

    public string? Notes { get; set; }
    public string? CreatedByUserId { get; set; }
}
