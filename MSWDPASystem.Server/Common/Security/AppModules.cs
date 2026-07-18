using System.Text.Json;

namespace MSWDPASystem.Server.Common.Security;

/// <summary>
/// FR-1.5 module catalog. The Head Coordinator can grant/revoke access to these
/// modules per MSWD Staff member; access is enforced centrally by ModuleAccessMiddleware.
/// </summary>
public static class AppModules
{
    public record ModuleInfo(string Key, string Label);

    // Modules whose access is configurable for MSWD Staff.
    public static readonly IReadOnlyList<ModuleInfo> Configurable =
    [
        new("beneficiaries", "Beneficiaries"),
        new("households", "Households"),
        new("assistance", "Assistance Requests"),
        new("verification", "QR Verification"),
        new("messages", "Messages"),
    ];

    public static readonly IReadOnlyList<string> ConfigurableKeys =
        Configurable.Select(m => m.Key).ToList();

    // Maps an API path prefix to the module that guards it.
    private static readonly Dictionary<string, string> PathToModule = new()
    {
        ["/api/beneficiaries"] = "beneficiaries",
        ["/api/households"] = "households",
        ["/api/assistance"] = "assistance",
        ["/api/qr-scan"] = "verification",
        ["/api/messages"] = "messages",
    };

    public static string? ResolveModule(PathString path)
    {
        foreach (var (prefix, module) in PathToModule)
            if (path.StartsWithSegments(prefix, StringComparison.OrdinalIgnoreCase))
                return module;
        return null;
    }

    /// <summary>Parsed allowed-module list, or null when the user has full default access.</summary>
    public static List<string>? Parse(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return null;
        try
        {
            return JsonSerializer.Deserialize<List<string>>(json);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    /// <summary>Serializes to JSON, keeping only valid configurable module keys.</summary>
    public static string Serialize(IEnumerable<string> modules) =>
        JsonSerializer.Serialize(modules.Where(ConfigurableKeys.Contains).Distinct().ToList());
}
