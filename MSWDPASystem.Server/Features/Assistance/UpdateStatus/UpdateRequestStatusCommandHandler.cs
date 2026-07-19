using MediatR;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Common.Exceptions;
using MSWDPASystem.Server.Common.Interfaces;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Domain.Entities;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Features.Account.GetMyAccount;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Assistance.UpdateStatus;

public class UpdateRequestStatusCommandHandler(
    ApplicationDbContext context,
    ICurrentUserService currentUser)
    : IRequestHandler<UpdateRequestStatusCommand, Result<bool>>
{
    public async Task<Result<bool>> Handle(
        UpdateRequestStatusCommand request, CancellationToken cancellationToken)
    {
        var assistanceRequest = await context.AssistanceRequests
            .Include(r => r.AssistanceType)
            .Include(r => r.Beneficiary)
            .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("AssistanceRequest", request.Id);

        var now = DateTime.UtcNow;
        assistanceRequest.Status = request.NewStatus;

        switch (request.NewStatus)
        {
            case AssistanceRequestStatus.UnderReview:
                assistanceRequest.ReviewedAt = now;
                assistanceRequest.ReviewedByUserId = currentUser.UserId;
                break;
            case AssistanceRequestStatus.Approved:
                assistanceRequest.ApprovedAt = now;
                assistanceRequest.ApprovedByUserId = currentUser.UserId;
                break;
            case AssistanceRequestStatus.Released:
                assistanceRequest.ReleasedAt = now;
                assistanceRequest.ReleasedByUserId = currentUser.UserId;
                break;
            case AssistanceRequestStatus.Denied:
                assistanceRequest.DeniedAt = now;
                assistanceRequest.DeniedByUserId = currentUser.UserId;
                assistanceRequest.DenialReason = request.DenialReason;
                break;
        }

        context.AssistanceRequestStatusHistories.Add(new AssistanceRequestStatusHistory
        {
            AssistanceRequestId = assistanceRequest.Id,
            Status = request.NewStatus,
            Notes = request.Notes,
            ChangedByUserId = currentUser.UserId,
            ChangedAt = now
        });

        // Notify the submitter, unless they turned assistance-status alerts off.
        var submitterPrefsJson = assistanceRequest.SubmittedByUserId == null
            ? null
            : await context.Users
                .Where(u => u.Id == assistanceRequest.SubmittedByUserId)
                .Select(u => u.Preferences)
                .FirstOrDefaultAsync(cancellationToken);
        if (assistanceRequest.SubmittedByUserId != null &&
            GetMyAccountQueryHandler.ParsePreferences(submitterPrefsJson).NotifyOnAssistanceStatus)
        {
            context.Notifications.Add(new Notification
            {
                RecipientUserId = assistanceRequest.SubmittedByUserId,
                Title = $"Assistance Request {request.NewStatus}",
                Message = $"Request {assistanceRequest.RequestNumber} for {assistanceRequest.Beneficiary.FullName} has been {request.NewStatus.ToString().ToLower()}.",
                Type = NotificationType.AssistanceStatusChange,
                RelatedEntityType = "AssistanceRequest",
                RelatedEntityId = assistanceRequest.Id.ToString()
            });
        }

        context.AuditLogs.Add(new AuditLog
        {
            UserId = currentUser.UserId,
            UserName = currentUser.UserName,
            Action = AuditAction.StatusChange,
            EntityType = "AssistanceRequest",
            EntityId = assistanceRequest.Id.ToString(),
            Description = $"Status changed to '{request.NewStatus}' for request {assistanceRequest.RequestNumber}."
        });

        await context.SaveChangesAsync(cancellationToken);
        return Result<bool>.Success(true);
    }
}
