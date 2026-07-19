using MediatR;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Common.Exceptions;
using MSWDPASystem.Server.Common.Interfaces;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Domain.Entities;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.QrScan.VerifyQrCode;

public class VerifyQrCodeCommandHandler(ApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<VerifyQrCodeCommand, Result<VerifyQrCodeResponse>>
{
    public async Task<Result<VerifyQrCodeResponse>> Handle(VerifyQrCodeCommand request, CancellationToken ct)
    {
        var beneficiary = await db.Beneficiaries
            .Include(b => b.Programs).ThenInclude(bp => bp.WelfareProgram)
            .FirstOrDefaultAsync(b => b.ClientNumber == request.ClientNumber.Trim(), ct)
            ?? throw new NotFoundException($"No beneficiary found with client number '{request.ClientNumber}'.");

        // Captured before this scan is written so the operator can see when this
        // beneficiary was last verified — a same-day repeat scan is worth noticing.
        var previousScanAt = await db.QrScanLogs
            .Where(l => l.BeneficiaryId == beneficiary.Id)
            .OrderByDescending(l => l.ScannedAt)
            .Select(l => (DateTime?)l.ScannedAt)
            .FirstOrDefaultAsync(ct);

        var log = new QrScanLog
        {
            BeneficiaryId = beneficiary.Id,
            ScannedByUserId = currentUser.UserId,
            ScannedAt = DateTime.UtcNow,
            Notes = request.Notes,
        };

        db.QrScanLogs.Add(log);

        db.AuditLogs.Add(new AuditLog
        {
            UserId = currentUser.UserId,
            UserName = currentUser.UserName,
            Action = Domain.Enums.AuditAction.QrScan,
            EntityType = "Beneficiary",
            EntityId = beneficiary.Id.ToString(),
            Description = $"QR scan for {beneficiary.ClientNumber} — {beneficiary.FirstName} {beneficiary.LastName}",
            Timestamp = DateTime.UtcNow
        });

        await db.SaveChangesAsync(ct);

        var activePrograms = beneficiary.Programs
            .Where(bp => bp.IsActive)
            .Select(bp => bp.WelfareProgram.Name)
            .ToList();

        // FR-3.5: complete assistance history for this beneficiary.
        var history = await db.AssistanceRequests
            .AsNoTracking()
            .Where(r => r.BeneficiaryId == beneficiary.Id)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ScanAssistanceHistoryDto(
                r.Id,
                r.RequestNumber,
                r.AssistanceType.Name,
                r.WelfareProgram != null ? r.WelfareProgram.Name : null,
                r.Amount,
                r.Status.ToString(),
                r.CreatedAt,
                r.ReleasedAt))
            .ToListAsync(ct);

        var released = history.Where(h => h.Status == nameof(AssistanceRequestStatus.Released)).ToList();

        var pending = history.Count(h =>
            h.Status == nameof(AssistanceRequestStatus.Submitted) ||
            h.Status == nameof(AssistanceRequestStatus.UnderReview) ||
            h.Status == nameof(AssistanceRequestStatus.Approved));

        return Result<VerifyQrCodeResponse>.Success(new VerifyQrCodeResponse(
            beneficiary.Id,
            beneficiary.ClientNumber,
            $"{beneficiary.FirstName} {beneficiary.LastName}",
            beneficiary.Status.ToString(),
            beneficiary.Barangay,
            beneficiary.ContactNumber,
            activePrograms,
            log.ScannedAt,
            history,
            history.Count,
            released.Sum(h => h.Amount ?? 0m),
            released.Max(h => h.ReleasedAt),
            pending,
            previousScanAt
        ));
    }
}
