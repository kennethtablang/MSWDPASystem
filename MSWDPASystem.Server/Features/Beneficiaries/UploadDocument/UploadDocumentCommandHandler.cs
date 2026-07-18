using MediatR;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Common.Exceptions;
using MSWDPASystem.Server.Common.Interfaces;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Domain.Entities;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Features.Beneficiaries.GetBeneficiary;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Beneficiaries.UploadDocument;

public class UploadDocumentCommandHandler(
    ApplicationDbContext db,
    IFileStorageService fileStorage,
    ICurrentUserService currentUser)
    : IRequestHandler<UploadDocumentCommand, Result<DocumentDto>>
{
    public async Task<Result<DocumentDto>> Handle(UploadDocumentCommand request, CancellationToken ct)
    {
        var exists = await db.Beneficiaries.AnyAsync(b => b.Id == request.BeneficiaryId, ct);
        if (!exists) throw new NotFoundException("Beneficiary not found.");

        if (!fileStorage.IsValidFileType(request.ContentType, request.FileName))
            return Result<DocumentDto>.Failure("Invalid file type. Allowed: JPEG, PNG, PDF, Word.");

        if (!fileStorage.IsWithinSizeLimit(request.FileSize))
            return Result<DocumentDto>.Failure("File exceeds the 10 MB size limit.");

        var filePath = await fileStorage.SaveFileAsync(
            request.FileStream, request.FileName, $"documents/{request.BeneficiaryId}");

        var doc = new Document
        {
            BeneficiaryId = request.BeneficiaryId,
            FileName = request.FileName,
            FilePath = filePath,
            FileSize = request.FileSize,
            ContentType = request.ContentType,
            DocumentType = request.DocumentType,
            Description = request.Description,
            UploadedByUserId = currentUser.UserId,
        };

        db.Documents.Add(doc);

        db.AuditLogs.Add(new AuditLog
        {
            UserId = currentUser.UserId,
            UserName = currentUser.UserName,
            Action = AuditAction.DocumentUpload,
            EntityType = "Document",
            EntityId = doc.Id.ToString(),
            Description = $"Uploaded '{request.FileName}' for beneficiary {request.BeneficiaryId}",
            Timestamp = DateTime.UtcNow
        });

        await db.SaveChangesAsync(ct);

        return Result<DocumentDto>.Success(new DocumentDto(doc.Id, doc.FileName, doc.DocumentType ?? "General", doc.CreatedAt));
    }
}
