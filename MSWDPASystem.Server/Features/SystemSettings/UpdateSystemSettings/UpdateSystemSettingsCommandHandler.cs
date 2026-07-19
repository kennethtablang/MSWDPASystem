using System.Globalization;
using MediatR;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Common.Configuration;
using MSWDPASystem.Server.Common.Interfaces;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Domain.Entities;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.SystemSettings.UpdateSystemSettings;

public class UpdateSystemSettingsCommandHandler(
    ApplicationDbContext db,
    ISystemSettingsService settings,
    ICurrentUserService currentUser)
    : IRequestHandler<UpdateSystemSettingsCommand, Result>
{
    public async Task<Result> Handle(UpdateSystemSettingsCommand request, CancellationToken ct)
    {
        if (request.Settings.Count == 0)
            return Result.Failure("No settings were supplied.");

        var errors = new List<string>();
        var changes = new List<(SystemSettingDefinition Def, string Value)>();

        foreach (var (key, rawValue) in request.Settings)
        {
            var def = SystemSettingDefinitions.Find(key);
            if (def == null)
            {
                errors.Add($"'{key}' is not a recognised system parameter.");
                continue;
            }

            var value = (rawValue ?? string.Empty).Trim();
            var error = Validate(def, value);
            if (error != null)
            {
                errors.Add(error);
                continue;
            }

            changes.Add((def, value));
        }

        if (errors.Count > 0)
            return Result.Failure(errors);

        var keys = changes.Select(c => c.Def.Key).ToList();
        var existing = await db.SystemSettings
            .Where(s => keys.Contains(s.Key))
            .ToDictionaryAsync(s => s.Key, ct);

        var changedLabels = new List<string>();

        foreach (var (def, value) in changes)
        {
            if (existing.TryGetValue(def.Key, out var row))
            {
                if (row.Value == value) continue;
                row.Value = value;
                row.UpdatedByUserId = currentUser.UserId;
            }
            else
            {
                db.SystemSettings.Add(new SystemSetting
                {
                    Key = def.Key,
                    Value = value,
                    UpdatedByUserId = currentUser.UserId
                });
            }
            changedLabels.Add(def.Label);
        }

        if (changedLabels.Count == 0)
            return Result.Success();

        db.AuditLogs.Add(new AuditLog
        {
            UserId = currentUser.UserId,
            UserName = currentUser.UserName,
            Action = AuditAction.Update,
            EntityType = "SystemSetting",
            Description = $"Updated system parameters: {string.Join(", ", changedLabels)}.",
            Timestamp = DateTime.UtcNow
        });

        await db.SaveChangesAsync(ct);

        // Other services read settings through a cache; drop it so the new values apply at once.
        settings.InvalidateCache();

        return Result.Success();
    }

    private static string? Validate(SystemSettingDefinition def, string value)
    {
        if (string.IsNullOrWhiteSpace(value) && def.DataType != SettingDataType.MultilineText)
            return $"{def.Label} cannot be empty.";

        switch (def.DataType)
        {
            case SettingDataType.Integer:
                if (!int.TryParse(value, NumberStyles.Integer, CultureInfo.InvariantCulture, out var i))
                    return $"{def.Label} must be a whole number.";
                if (i < 0) return $"{def.Label} cannot be negative.";
                break;

            case SettingDataType.Decimal:
                if (!decimal.TryParse(value, NumberStyles.Number, CultureInfo.InvariantCulture, out var d))
                    return $"{def.Label} must be a number.";
                if (d < 0) return $"{def.Label} cannot be negative.";
                break;

            case SettingDataType.Boolean:
                if (!bool.TryParse(value, out _))
                    return $"{def.Label} must be true or false.";
                break;

            case SettingDataType.List:
                if (value.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).Length == 0)
                    return $"{def.Label} must contain at least one entry.";
                break;
        }

        // Guard rails on the values that would break the app if set to nonsense.
        if (def.Key == SystemSettingKeys.SessionTimeoutMinutes)
        {
            var minutes = int.Parse(value, CultureInfo.InvariantCulture);
            if (minutes is < 1 or > 480)
                return "Session timeout must be between 1 and 480 minutes.";
        }

        if (def.Key == SystemSettingKeys.UploadMaxSizeMb)
        {
            var mb = int.Parse(value, CultureInfo.InvariantCulture);
            if (mb is < 1 or > 100)
                return "Maximum upload size must be between 1 and 100 MB.";
        }

        if (def.Key == SystemSettingKeys.DuplicateSensitivity)
        {
            var score = int.Parse(value, CultureInfo.InvariantCulture);
            if (score is < 50 or > 100)
                return "Duplicate detection sensitivity must be between 50 and 100.";
        }

        return null;
    }
}
