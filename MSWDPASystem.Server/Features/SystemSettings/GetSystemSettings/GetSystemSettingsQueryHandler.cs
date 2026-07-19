using MediatR;
using MSWDPASystem.Server.Common.Configuration;
using MSWDPASystem.Server.Common.Interfaces;

namespace MSWDPASystem.Server.Features.SystemSettings.GetSystemSettings;

public class GetSystemSettingsQueryHandler(ISystemSettingsService settings)
    : IRequestHandler<GetSystemSettingsQuery, List<SystemSettingGroupDto>>
{
    public async Task<List<SystemSettingGroupDto>> Handle(
        GetSystemSettingsQuery request, CancellationToken ct)
    {
        var values = await settings.GetAllAsync(ct);

        return SystemSettingDefinitions.All
            .GroupBy(d => d.Category)
            .Select(g => new SystemSettingGroupDto(
                g.Key,
                g.Select(d => new SystemSettingDto(
                    d.Key,
                    d.Label,
                    d.Description,
                    d.DataType.ToString(),
                    values.TryGetValue(d.Key, out var v) ? v : d.DefaultValue,
                    d.DefaultValue)).ToList()))
            .ToList();
    }
}
