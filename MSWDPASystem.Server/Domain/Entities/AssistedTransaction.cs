using MSWDPASystem.Server.Domain.Enums;

namespace MSWDPASystem.Server.Domain.Entities;

/// <summary>
/// A record that a staff member transacted on a beneficiary's behalf at the office.
///
/// The office's real caseload includes elderly clients, persons with disability and
/// clients with no device — they cannot use the citizen portal, so a staff member
/// operates the system for them. That is already how encoding works, but without
/// this record it is indistinguishable from staff acting unilaterally. Capturing
/// who was assisted, why, who physically appeared and what identification they
/// presented is what makes the transaction defensible under RA 10173 and auditable
/// by the LGU.
/// </summary>
public class AssistedTransaction : BaseEntity
{
    public Guid BeneficiaryId { get; set; }
    public Beneficiary Beneficiary { get; set; } = null!;

    /// <summary>The staff member who operated the system.</summary>
    public string? AssistedByUserId { get; set; }
    public string? AssistedByUserName { get; set; }

    public AssistedServiceType ServiceType { get; set; }
    public AssistanceReason Reason { get; set; }
    public string? ReasonNotes { get; set; }

    /// <summary>
    /// True when the beneficiary was physically present. False means an authorised
    /// representative appeared instead, and the representative fields below apply.
    /// </summary>
    public bool BeneficiaryPresent { get; set; } = true;

    // --- Authorised representative (a grandchild collecting for a grandmother) ---
    public string? RepresentativeName { get; set; }
    public string? RepresentativeRelation { get; set; }

    /// <summary>Set when the representative is themselves a registered beneficiary.</summary>
    public Guid? RepresentativeBeneficiaryId { get; set; }
    public Beneficiary? RepresentativeBeneficiary { get; set; }

    public string? RepresentativeIdType { get; set; }
    public string? RepresentativeIdNumber { get; set; }

    /// <summary>Scanned authorisation letter or barangay certification, if one was required.</summary>
    public string? AuthorizationDocumentPath { get; set; }

    /// <summary>
    /// Whether the client (or representative) acknowledged the transaction, and the
    /// captured signature backing that acknowledgement.
    /// </summary>
    public bool Acknowledged { get; set; }
    public string? AcknowledgementSignaturePath { get; set; }

    /// <summary>Links the record to what was actually done, e.g. an AssistanceRequest.</summary>
    public string? RelatedEntityType { get; set; }
    public string? RelatedEntityId { get; set; }

    public string? Notes { get; set; }
}
