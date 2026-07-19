namespace MSWDPASystem.Server.Domain.Entities;

/// <summary>
/// FR-8.1: runtime-editable system configuration. Values are stored as strings and
/// interpreted according to the DataType declared in <c>SystemSettingDefinitions</c>,
/// so a new setting only needs a definition entry — no schema change.
/// </summary>
public class SystemSetting : BaseEntity
{
    public string Key { get; set; } = string.Empty;
    public string? Value { get; set; }
    public string? UpdatedByUserId { get; set; }
}
