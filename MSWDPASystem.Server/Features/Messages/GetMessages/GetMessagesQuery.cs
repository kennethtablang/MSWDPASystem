using MediatR;

namespace MSWDPASystem.Server.Features.Messages.GetMessages;

public record GetMessagesQuery(bool Inbox = true) : IRequest<List<MessageDto>>;
