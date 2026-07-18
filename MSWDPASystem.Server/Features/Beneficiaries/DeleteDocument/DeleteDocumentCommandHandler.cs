using MediatR;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Common.Exceptions;
using MSWDPASystem.Server.Common.Interfaces;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Beneficiaries.DeleteDocument;

public class DeleteDocumentCommandHandler(
    ApplicationDbContext db,
    IFileStorageService fileStorage,
    ICurrentUserService currentUser)
    : IRequestHandler<DeleteDocumentCommand, Result>
{
    public async Task<Result> Handle(DeleteDocumentCommand request, CancellationToken ct)
    {
        var doc = await db.Documents
            .FirstOrDefaultAsync(d => d.Id == request.DocumentId && d.BeneficiaryId == request.BeneficiaryId, ct)
            ?? throw new NotFoundException("Document not found.");

        await fileStorage.DeleteFileAsync(doc.FilePath);
        db.Documents.Remove(doc);

        db.AuditLogs.Add(new Domain.Entities.AuditLog
        {
            UserId = currentUser.UserId,
            UserName = currentUser.UserName,
            Action = Domain.Enums.AuditAction.Delete,
            EntityType = "Document",
            EntityId = doc.Id.ToString(),
            Description = $"Deleted document '{doc.FileName}'",
            Timestamp = DateTime.UtcNow
        });

        await db.SaveChangesAsync(ct);
        return Result.Success();
    }
}
