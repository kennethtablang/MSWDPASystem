using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Common.Exceptions;
using MSWDPASystem.Server.Common.Interfaces;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Domain.Entities;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Assistance.CreateRequest;

public class CreateAssistanceRequestCommandHandler(
    ApplicationDbContext context,
    ICurrentUserService currentUser,
    UserManager<ApplicationUser> userManager)
    : IRequestHandler<CreateAssistanceRequestCommand, Result<CreateAssistanceRequestResponse>>
{
    public async Task<Result<CreateAssistanceRequestResponse>> Handle(
        CreateAssistanceRequestCommand request, CancellationToken cancellationToken)
    {
        var beneficiary = await context.Beneficiaries
            .FirstOrDefaultAsync(b => b.Id == request.BeneficiaryId, cancellationToken)
            ?? throw new NotFoundException("Beneficiary", request.BeneficiaryId);

        var assistanceType = await context.AssistanceTypes
            .FirstOrDefaultAsync(t => t.Id == request.AssistanceTypeId, cancellationToken)
            ?? throw new NotFoundException("AssistanceType", request.AssistanceTypeId);

        var requestNumber = await GenerateRequestNumberAsync(cancellationToken);

        var assistanceRequest = new AssistanceRequest
        {
            RequestNumber = requestNumber,
            BeneficiaryId = request.BeneficiaryId,
            AssistanceTypeId = request.AssistanceTypeId,
            WelfareProgramId = request.WelfareProgramId,
            Amount = request.Amount,
            Purpose = request.Purpose,
            Status = AssistanceRequestStatus.Submitted,
            SubmittedByUserId = currentUser.UserId
        };

        context.AssistanceRequests.Add(assistanceRequest);

        context.AssistanceRequestStatusHistories.Add(new AssistanceRequestStatusHistory
        {
            AssistanceRequestId = assistanceRequest.Id,
            Status = AssistanceRequestStatus.Submitted,
            ChangedByUserId = currentUser.UserId,
            ChangedAt = DateTime.UtcNow,
            Notes = "Request submitted."
        });

        // Notify all HeadCoordinators
        var headCoordinators = await userManager.GetUsersInRoleAsync("HeadCoordinator");
        foreach (var hc in headCoordinators)
        {
            context.Notifications.Add(new Notification
            {
                RecipientUserId = hc.Id,
                Title = "New Assistance Request",
                Message = $"A new {assistanceType.Name} request has been submitted for {beneficiary.FullName} ({requestNumber}).",
                Type = NotificationType.AssistanceStatusChange,
                RelatedEntityType = "AssistanceRequest",
                RelatedEntityId = assistanceRequest.Id.ToString()
            });
        }

        await context.SaveChangesAsync(cancellationToken);

        return Result<CreateAssistanceRequestResponse>.Success(new CreateAssistanceRequestResponse(
            assistanceRequest.Id, requestNumber,
            beneficiary.Id, beneficiary.FullName,
            assistanceType.Name, request.Amount,
            AssistanceRequestStatus.Submitted, assistanceRequest.CreatedAt));
    }

    private async Task<string> GenerateRequestNumberAsync(CancellationToken ct)
    {
        var year = DateTime.Today.Year;
        var prefix = $"REQ-{year}-";
        var last = await context.AssistanceRequests
            .Where(r => r.RequestNumber.StartsWith(prefix))
            .OrderByDescending(r => r.RequestNumber)
            .Select(r => r.RequestNumber)
            .FirstOrDefaultAsync(ct);

        var seq = 1;
        if (last != null)
        {
            var lastSeqStr = last.Split('-').LastOrDefault();
            if (int.TryParse(lastSeqStr, out var lastSeq))
                seq = lastSeq + 1;
        }
        return $"{prefix}{seq:D5}";
    }
}
