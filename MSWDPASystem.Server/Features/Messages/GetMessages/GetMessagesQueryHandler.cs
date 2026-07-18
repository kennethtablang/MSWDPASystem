using MediatR;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Common.Interfaces;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Messages.GetMessages;

public class GetMessagesQueryHandler(ApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<GetMessagesQuery, List<MessageDto>>
{
    public async Task<List<MessageDto>> Handle(GetMessagesQuery request, CancellationToken ct)
    {
        var query = db.Messages
            .Include(m => m.Sender)
            .Include(m => m.Recipient)
            .AsQueryable();

        if (request.Inbox)
            query = query.Where(m => m.RecipientId == currentUser.UserId && !m.IsDeletedByRecipient);
        else
            query = query.Where(m => m.SenderId == currentUser.UserId && !m.IsDeletedBySender);

        return await query
            .OrderByDescending(m => m.CreatedAt)
            .Select(m => new MessageDto(
                m.Id,
                m.SenderId,
                m.Sender.FullName ?? m.Sender.UserName!,
                m.RecipientId,
                m.Recipient.FullName ?? m.Recipient.UserName!,
                m.Subject,
                m.Body,
                m.IsRead,
                m.ReadAt,
                m.CreatedAt))
            .ToListAsync(ct);
    }
}
