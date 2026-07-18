using MediatR;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Common.Interfaces;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Domain.Entities;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Beneficiaries.DownloadDocument;

public class DownloadDocumentQueryHandler(
    ApplicationDbContext db,
    IFileStorageService fileStorage,
    ICurrentUserService currentUser)
    : IRequestHandler<DownloadDocumentQuery, Result<FileDownloadDto>>
{
    public async Task<Result<FileDownloadDto>> Handle(DownloadDocumentQuery request, CancellationToken ct)
    {
        // Scope the lookup by beneficiary as well as document id so a valid document
        // id cannot be read through an unrelated beneficiary route.
        var document = await db.Documents
            .Include(d => d.Beneficiary)
            .FirstOrDefaultAsync(d => d.Id == request.DocumentId
                                   && d.BeneficiaryId == request.BeneficiaryId, ct);

        if (document == null)
            return Result<FileDownloadDto>.Failure("Document not found.");

        var content = await fileStorage.ReadFileAsync(document.FilePath);
        if (content == null)
            return Result<FileDownloadDto>.Failure("Document file is no longer available.");

        // Access to beneficiary personal data is an auditable event (FR-1.7, NFR-4.5).
        db.AuditLogs.Add(new AuditLog
        {
            UserId = currentUser.UserId,
            UserName = currentUser.UserName,
            Action = AuditAction.View,
            EntityType = "Document",
            EntityId = document.Id.ToString(),
            Description = $"Downloaded document '{document.FileName}' for beneficiary {document.Beneficiary.ClientNumber}.",
            Timestamp = DateTime.UtcNow
        });
        await db.SaveChangesAsync(ct);

        var contentType = string.IsNullOrWhiteSpace(document.ContentType)
            ? "application/octet-stream"
            : document.ContentType;

        return Result<FileDownloadDto>.Success(new FileDownloadDto(content, contentType, document.FileName));
    }
}
