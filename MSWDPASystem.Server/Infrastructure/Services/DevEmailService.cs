using MSWDPASystem.Server.Common.Interfaces;

namespace MSWDPASystem.Server.Infrastructure.Services;

/// <summary>
/// Development email sender: writes the message to the application log instead
/// of sending it. Verification/reset links are also surfaced to the client via
/// dev-only response fields so the flow can be demonstrated without SMTP.
/// </summary>
public class DevEmailService(ILogger<DevEmailService> logger) : IEmailService
{
    public Task SendAsync(string to, string subject, string htmlBody, CancellationToken ct = default)
    {
        logger.LogInformation("DEV EMAIL to {To} — {Subject}\n{Body}", to, subject, htmlBody);
        return Task.CompletedTask;
    }
}
