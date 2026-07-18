using MediatR;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Common.Exceptions;
using MSWDPASystem.Server.Common.Interfaces;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Domain.Entities;
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

        return Result<VerifyQrCodeResponse>.Success(new VerifyQrCodeResponse(
            beneficiary.Id,
            beneficiary.ClientNumber,
            $"{beneficiary.FirstName} {beneficiary.LastName}",
            beneficiary.Status.ToString(),
            beneficiary.Barangay,
            beneficiary.ContactNumber,
            activePrograms,
            log.ScannedAt
        ));
    }
}
