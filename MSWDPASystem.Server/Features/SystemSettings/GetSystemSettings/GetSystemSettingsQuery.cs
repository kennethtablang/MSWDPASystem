using MediatR;

namespace MSWDPASystem.Server.Features.SystemSettings.GetSystemSettings;

public record GetSystemSettingsQuery : IRequest<List<SystemSettingGroupDto>>;

public record SystemSettingGroupDto(string Category, List<SystemSettingDto> Settings);

public record SystemSettingDto(
    string Key,
    string Label,
    string Description,
    string DataType,
    string Value,
    string DefaultValue
);
