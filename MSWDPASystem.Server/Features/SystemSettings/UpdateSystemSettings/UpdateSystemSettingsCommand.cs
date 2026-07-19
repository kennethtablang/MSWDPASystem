using MediatR;
using MSWDPASystem.Server.Common.Models;

namespace MSWDPASystem.Server.Features.SystemSettings.UpdateSystemSettings;

/// <summary>Applies a partial set of changes — only the supplied keys are written.</summary>
public record UpdateSystemSettingsCommand(Dictionary<string, string> Settings) : IRequest<Result>;
