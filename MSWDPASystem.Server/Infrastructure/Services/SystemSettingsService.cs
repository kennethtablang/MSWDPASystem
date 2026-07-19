using System.Globalization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using MSWDPASystem.Server.Common.Configuration;
using MSWDPASystem.Server.Common.Interfaces;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Infrastructure.Services;

public class SystemSettingsService(ApplicationDbContext db, IMemoryCache cache)
    : ISystemSettingsService
{
    private const string CacheKey = "system-settings";

    private async Task<Dictionary<string, string>> LoadAsync(CancellationToken ct)
    {
        if (cache.TryGetValue(CacheKey, out Dictionary<string, string>? cached) && cached != null)
            return cached;

        var stored = await db.SystemSettings
            .AsNoTracking()
            .ToDictionaryAsync(s => s.Key, s => s.Value ?? string.Empty, ct);

        // Fall back to the declared default so a setting added in code but not yet
        // persisted still resolves rather than returning empty.
        var effective = new Dictionary<string, string>();
        foreach (var def in SystemSettingDefinitions.All)
        {
            effective[def.Key] = stored.TryGetValue(def.Key, out var v) && !string.IsNullOrWhiteSpace(v)
                ? v
                : def.DefaultValue;
        }

        cache.Set(CacheKey, effective, TimeSpan.FromMinutes(10));
        return effective;
    }

    public async Task<string> GetStringAsync(string key, CancellationToken ct = default)
    {
        var all = await LoadAsync(ct);
        return all.TryGetValue(key, out var v) ? v : string.Empty;
    }

    public async Task<int> GetIntAsync(string key, CancellationToken ct = default)
    {
        var raw = await GetStringAsync(key, ct);
        if (int.TryParse(raw, NumberStyles.Integer, CultureInfo.InvariantCulture, out var parsed))
            return parsed;

        var fallback = SystemSettingDefinitions.Find(key)?.DefaultValue;
        return int.TryParse(fallback, NumberStyles.Integer, CultureInfo.InvariantCulture, out var d) ? d : 0;
    }

    public async Task<decimal> GetDecimalAsync(string key, CancellationToken ct = default)
    {
        var raw = await GetStringAsync(key, ct);
        if (decimal.TryParse(raw, NumberStyles.Number, CultureInfo.InvariantCulture, out var parsed))
            return parsed;

        var fallback = SystemSettingDefinitions.Find(key)?.DefaultValue;
        return decimal.TryParse(fallback, NumberStyles.Number, CultureInfo.InvariantCulture, out var d) ? d : 0m;
    }

    public async Task<bool> GetBoolAsync(string key, CancellationToken ct = default)
    {
        var raw = await GetStringAsync(key, ct);
        return bool.TryParse(raw, out var parsed) && parsed;
    }

    public async Task<List<string>> GetListAsync(string key, CancellationToken ct = default)
    {
        var raw = await GetStringAsync(key, ct);
        return raw.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .ToList();
    }

    public async Task<Dictionary<string, string>> GetAllAsync(CancellationToken ct = default)
        => new(await LoadAsync(ct));

    public void InvalidateCache() => cache.Remove(CacheKey);
}
