namespace MSWDPASystem.Server.Common.Configuration;

public enum SettingDataType
{
    Text,
    MultilineText,
    Integer,
    Decimal,
    Boolean,
    List
}

public record SystemSettingDefinition(
    string Key,
    string Category,
    string Label,
    string Description,
    SettingDataType DataType,
    string DefaultValue
);

/// <summary>
/// The catalogue of every runtime-configurable parameter (FR-8.1). This is the single
/// source of truth: seeding, validation and the admin UI are all driven from it, so
/// adding a parameter means adding one entry here.
/// </summary>
public static class SystemSettingKeys
{
    // Office identity
    public const string OfficeName = "Office.Name";
    public const string OfficeMunicipality = "Office.Municipality";
    public const string OfficeAddress = "Office.Address";
    public const string OfficeContactNumber = "Office.ContactNumber";
    public const string OfficeEmail = "Office.Email";
    public const string ReportHeaderText = "Report.HeaderText";
    public const string ReportFooterText = "Report.FooterText";

    // Operational limits
    public const string Barangays = "Operational.Barangays";
    public const string UploadMaxSizeMb = "Upload.MaxSizeMb";
    public const string UploadAllowedTypes = "Upload.AllowedTypes";
    public const string DuplicateSensitivity = "Duplicate.Sensitivity";
    public const string SessionTimeoutMinutes = "Session.TimeoutMinutes";
    public const string AssistanceMaxAmount = "Assistance.MaxAmount";
}

public static class SystemSettingDefinitions
{
    public const string CategoryOffice = "Office Identity";
    public const string CategoryOperational = "Operational Limits";

    /// <summary>Official barangays of Caba, La Union.</summary>
    private const string DefaultBarangays =
        "Bautista,Poblacion Norte,Poblacion Sur,San Carlos,San Cornelio,San Fermin,San Gregorio," +
        "San Jose,Juan Cartas,Las-ud,Liquicia,Nangalisan,Santiago Norte,Santiago Sur," +
        "Sobredillo,Urayong,Wenceslao";

    private const string DefaultAllowedTypes =
        "image/jpeg,image/png,image/gif,image/webp,application/pdf,application/msword," +
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    public static readonly IReadOnlyList<SystemSettingDefinition> All =
    [
        new(SystemSettingKeys.OfficeName, CategoryOffice, "Office name",
            "Appears on report headers and printed documents.",
            SettingDataType.Text, "Municipal Social Welfare and Development Office"),

        new(SystemSettingKeys.OfficeMunicipality, CategoryOffice, "Municipality",
            "Municipality and province served by this office.",
            SettingDataType.Text, "Caba, La Union"),

        new(SystemSettingKeys.OfficeAddress, CategoryOffice, "Office address",
            "Street address shown on reports and contact details.",
            SettingDataType.Text, "Municipal Hall, Poblacion Norte, Caba, La Union"),

        new(SystemSettingKeys.OfficeContactNumber, CategoryOffice, "Contact number",
            "Public contact number for the office.",
            SettingDataType.Text, "(072) 888-0000"),

        new(SystemSettingKeys.OfficeEmail, CategoryOffice, "Office email",
            "Official email address for correspondence.",
            SettingDataType.Text, "mswd@caba-launion.gov.ph"),

        new(SystemSettingKeys.ReportHeaderText, CategoryOffice, "Report header",
            "Title line printed at the top of generated PDF reports.",
            SettingDataType.Text, "Republic of the Philippines"),

        new(SystemSettingKeys.ReportFooterText, CategoryOffice, "Report footer",
            "Note printed at the bottom of generated PDF reports.",
            SettingDataType.MultilineText,
            "This report is system-generated and contains personal data protected under RA 10173."),

        new(SystemSettingKeys.Barangays, CategoryOperational, "Barangays served",
            "Comma-separated list used by registration forms and report filters.",
            SettingDataType.List, DefaultBarangays),

        new(SystemSettingKeys.UploadMaxSizeMb, CategoryOperational, "Maximum upload size (MB)",
            "Largest supporting document that may be uploaded to a beneficiary profile.",
            SettingDataType.Integer, "10"),

        new(SystemSettingKeys.UploadAllowedTypes, CategoryOperational, "Allowed file types",
            "Comma-separated MIME types accepted for document uploads.",
            SettingDataType.List, DefaultAllowedTypes),

        new(SystemSettingKeys.DuplicateSensitivity, CategoryOperational, "Duplicate detection sensitivity",
            "Match score (0-100) at which a new registration is flagged as a potential duplicate. "
            + "Lower values flag more aggressively.",
            SettingDataType.Integer, "85"),

        new(SystemSettingKeys.SessionTimeoutMinutes, CategoryOperational, "Session timeout (minutes)",
            "Idle time before a signed-in user is automatically logged out (FR-1.9).",
            SettingDataType.Integer, "30"),

        new(SystemSettingKeys.AssistanceMaxAmount, CategoryOperational, "Maximum assistance amount (PHP)",
            "Upper limit accepted when encoding a single assistance request. Set to 0 to disable the check.",
            SettingDataType.Decimal, "50000"),
    ];

    public static SystemSettingDefinition? Find(string key) =>
        All.FirstOrDefault(d => d.Key == key);
}
