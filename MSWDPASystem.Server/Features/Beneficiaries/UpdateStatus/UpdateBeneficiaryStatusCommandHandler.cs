using MediatR;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Common.Exceptions;
using MSWDPASystem.Server.Common.Interfaces;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Domain.Entities;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Beneficiaries.UpdateStatus;

public class UpdateBeneficiaryStatusCommandHandler(ApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<UpdateBeneficiaryStatusCommand, Result>
{
    public async Task<Result> Handle(UpdateBeneficiaryStatusCommand request, CancellationToken ct)
    {
        var beneficiary = await db.Beneficiaries.FirstOrDefaultAsync(b => b.Id == request.Id, ct)
            ?? throw new NotFoundException("Beneficiary not found.");

        var oldStatus = beneficiary.Status;
        beneficiary.Status = request.Status;

        db.AuditLogs.Add(new AuditLog
        {
            UserId = currentUser.UserId,
            UserName = currentUser.UserName,
            Action = AuditAction.StatusChange,
            EntityType = "Beneficiary",
            EntityId = beneficiary.Id.ToString(),
            OldValues = oldStatus.ToString(),
            NewValues = request.Status.ToString(),
            Description = $"Status changed from {oldStatus} to {request.Status}. {request.Notes}".TrimEnd(),
            Timestamp = DateTime.UtcNow
        });

        await db.SaveChangesAsync(ct);
        return Result.Success();
    }
}
