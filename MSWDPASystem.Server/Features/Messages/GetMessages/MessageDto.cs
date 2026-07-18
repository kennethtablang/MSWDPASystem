namespace MSWDPASystem.Server.Features.Messages.GetMessages;

public record MessageDto(
    Guid Id,
    string SenderId,
    string SenderName,
    string RecipientId,
    string RecipientName,
    string Subject,
    string Body,
    bool IsRead,
    DateTime? ReadAt,
    DateTime CreatedAt
);
