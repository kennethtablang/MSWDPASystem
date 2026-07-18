using MediatR;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Common.Interfaces;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Domain.Entities;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Beneficiaries.SaveSignature;

public class SaveSignatureCommandHandler(
    ApplicationDbContext db,
    IFileStorageService fileStorage,
    ICurrentUserService currentUser)
    : IRequestHandler<SaveSignatureCommand, Result<string>>
{
    public async Task<Result<string>> Handle(SaveSignatureCommand request, CancellationToken ct)
    {
        var beneficiary = await db.Beneficiaries.FirstOrDefaultAsync(b => b.Id == request.BeneficiaryId, ct);
        if (beneficiary == null)
            return Result<string>.Failure("Beneficiary not found.");

        var bytes = DecodePngDataUrl(request.SignatureDataUrl);
        if (bytes == null || bytes.Length == 0)
            return Result<string>.Failure("Invalid signature image. Expected a PNG data URL.");

        // Replace any previous signature file.
        if (!string.IsNullOrWhiteSpace(beneficiary.SignatureFilePath))
            await fileStorage.DeleteFileAsync(beneficiary.SignatureFilePath);

        using var ms = new MemoryStream(bytes);
        var filePath = await fileStorage.SaveFileAsync(ms, "signature.png", $"signatures/{beneficiary.Id}");

        beneficiary.SignatureFilePath = filePath;

        db.AuditLogs.Add(new AuditLog
        {
            UserId = currentUser.UserId,
            UserName = currentUser.UserName,
            Action = AuditAction.Update,
            EntityType = "Beneficiary",
            EntityId = beneficiary.Id.ToString(),
            Description = $"Captured signature for beneficiary {beneficiary.ClientNumber}.",
            Timestamp = DateTime.UtcNow
        });

        await db.SaveChangesAsync(ct);

        // The image is served only from the authorized signature endpoint.
        return Result<string>.Success($"/api/beneficiaries/{beneficiary.Id}/signature");
    }

    private static byte[]? DecodePngDataUrl(string dataUrl)
    {
        if (string.IsNullOrWhiteSpace(dataUrl)) return null;

        var payload = dataUrl;
        var commaIndex = dataUrl.IndexOf(',');
        if (dataUrl.StartsWith("data:", StringComparison.OrdinalIgnoreCase) && commaIndex >= 0)
        {
            var header = dataUrl[..commaIndex];
            if (!header.Contains("image/png", StringComparison.OrdinalIgnoreCase))
                return null;
            payload = dataUrl[(commaIndex + 1)..];
        }

        try
        {
            return Convert.FromBase64String(payload);
        }
        catch (FormatException)
        {
            return null;
        }
    }
}
