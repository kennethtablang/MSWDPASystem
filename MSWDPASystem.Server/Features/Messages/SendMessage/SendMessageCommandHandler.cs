using MediatR;
using Microsoft.AspNetCore.Identity;
using MSWDPASystem.Server.Common.Interfaces;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Domain.Entities;
using MSWDPASystem.Server.Features.Messages.GetMessages;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Messages.SendMessage;

public class SendMessageCommandHandler(
    ApplicationDbContext db,
    ICurrentUserService currentUser,
    UserManager<ApplicationUser> userManager)
    : IRequestHandler<SendMessageCommand, Result<MessageDto>>
{
    public async Task<Result<MessageDto>> Handle(SendMessageCommand request, CancellationToken ct)
    {
        var recipient = await userManager.FindByIdAsync(request.RecipientId);
        if (recipient == null)
            return Result<MessageDto>.Failure("Recipient not found.");

        var sender = await userManager.FindByIdAsync(currentUser.UserId!);

        var message = new Message
        {
            SenderId = currentUser.UserId!,
            RecipientId = request.RecipientId,
            Subject = request.Subject,
            Body = request.Body,
        };

        db.Messages.Add(message);

        db.Notifications.Add(new Notification
        {
            RecipientUserId = request.RecipientId,
            Title = $"New message from {sender?.FullName ?? currentUser.UserName}",
            Message = request.Subject,
            Type = Domain.Enums.NotificationType.NewMessage,
            RelatedEntityType = "Message",
            RelatedEntityId = message.Id.ToString(),
        });

        await db.SaveChangesAsync(ct);

        return Result<MessageDto>.Success(new MessageDto(
            message.Id,
            message.SenderId,
            sender?.FullName ?? currentUser.UserName ?? "",
            message.RecipientId,
            recipient.FullName ?? recipient.UserName ?? "",
            message.Subject,
            message.Body,
            false, null,
            message.CreatedAt));
    }
}
