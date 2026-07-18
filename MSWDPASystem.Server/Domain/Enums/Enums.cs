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

public enum CivilStatus
{
    Single,
    Married,
    Widowed,
    Separated,
    Divorced
}
