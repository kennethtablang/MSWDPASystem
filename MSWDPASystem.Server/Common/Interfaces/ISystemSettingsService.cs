namespace MSWDPASystem.Server.Common.Interfaces;

/// <summary>
/// Read access to runtime system parameters (FR-8.1). Values are cached and the
/// cache is invalidated whenever an administrator saves changes.
/// </summary>
public interface ISystemSettingsService
{
    Task<string> GetStringAsync(string key, CancellationToken ct = default);
    Task<int> GetIntAsync(string key, CancellationToken ct = default);
    Task<decimal> GetDecimalAsync(string key, CancellationToken ct = default);
    Task<bool> GetBoolAsync(string key, CancellationToken ct = default);

    /// <summary>Splits a comma-separated List setting into trimmed, non-empty entries.</summary>
    Task<List<string>> GetListAsync(string key, CancellationToken ct = default);

    Task<Dictionary<string, string>> GetAllAsync(CancellationToken ct = default);

    void InvalidateCache();
}
