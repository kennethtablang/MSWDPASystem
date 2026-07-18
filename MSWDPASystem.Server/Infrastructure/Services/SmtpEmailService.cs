using System.Net;
using System.Net.Mail;
using MSWDPASystem.Server.Common.Interfaces;

namespace MSWDPASystem.Server.Infrastructure.Services;

/// <summary>
/// SMTP email sender, enabled by setting Email:Mode to "Smtp" and configuring
/// the Email:Smtp section (Host, Port, User, Password, UseSsl, From).
/// </summary>
public class SmtpEmailService(IConfiguration config) : IEmailService
{
    public async Task SendAsync(string to, string subject, string htmlBody, CancellationToken ct = default)
    {
        var smtp = config.GetSection("Email:Smtp");
        var host = smtp["Host"] ?? throw new InvalidOperationException("Email:Smtp:Host is not configured.");
        var port = int.TryParse(smtp["Port"], out var p) ? p : 587;
        var from = smtp["From"] ?? smtp["User"] ?? throw new InvalidOperationException("Email:Smtp:From is not configured.");

        using var client = new SmtpClient(host, port)
        {
            EnableSsl = bool.TryParse(smtp["UseSsl"], out var ssl) ? ssl : true,
        };
        if (!string.IsNullOrEmpty(smtp["User"]))
            client.Credentials = new NetworkCredential(smtp["User"], smtp["Password"]);

        using var message = new MailMessage(from, to, subject, htmlBody) { IsBodyHtml = true };
        await client.SendMailAsync(message, ct);
    }
}
