namespace MSWDPASystem.Server.Domain.Enums;

public enum BeneficiaryStatus
{
    Active,
    Flagged,
    Verified,
    Inactive
}

public enum AssistanceRequestStatus
{
    Submitted,
    UnderReview,
    Approved,
    Released,
    Denied
}

public enum AuditAction
{
    Create,
    Update,
    Delete,
    Login,
    Logout,
    View,
    QrScan,
    StatusChange,
    DocumentUpload,
    DuplicateResolution
}

public enum NotificationType
{
    AssistanceStatusChange,
    QrScanConfirmation,
    DuplicateFlag,
    SystemAlert,
    NewMessage
}

public enum DuplicateFlagStatus
{
    Pending,
    Confirmed,
    Rejected
}

public enum Sex
{
    Male,
    Female
}

/// <summary>
/// Why a beneficiary could not transact for themselves. Recorded so assisted
/// service is auditable rather than indistinguishable from ordinary encoding.
/// </summary>
public enum AssistanceReason
{
    Elderly,
    PersonWithDisability,
    Illiterate,
    NoDeviceOrInternet,
    MedicalCondition,
    NotPhysicallyPresent,
    LanguageBarrier,
    Other
}

/// <summary>What a staff member did on the beneficiary's behalf.</summary>
public enum AssistedServiceType
{
    Registration,
    ProfileUpdate,
    RequestFiling,
    DocumentSubmission,
    Release,
    Inquiry
}

/// <summary>
/// How one beneficiary relates to another. Stored on a directed edge
/// (Beneficiary → Relative); the inverse edge is written at the same time.
/// </summary>
public enum RelationshipType
{
    Spouse,
    Parent,
    Child,
    Sibling,
    Grandparent,
    Grandchild,
    AuntUncle,
    NieceNephew,
    Cousin,
    ParentInLaw,
    ChildInLaw,
    SiblingInLaw,
    Guardian,
    Ward,
    Other
}

public enum CivilStatus
{
    Single,
    Married,
    Widowed,
    Separated,
    Divorced
}

/// <summary>
/// Which landing-page section a <c>ContentItem</c> belongs to. Explicit values:
/// these are persisted, so renumbering would silently re-file existing rows.
/// </summary>
public enum ContentType
{
    Announcement = 1,
    News = 2,
    Faq = 3
}

/// <summary>
/// Publication state of a <c>ContentItem</c>. Expiry is a date, not a status —
/// an expired item is still Published, it has simply aged off the landing page.
/// </summary>
public enum ContentStatus
{
    Draft = 1,
    Published = 2
}
