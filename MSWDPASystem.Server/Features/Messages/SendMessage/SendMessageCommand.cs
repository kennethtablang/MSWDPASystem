using MediatR;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Features.Messages.GetMessages;

namespace MSWDPASystem.Server.Features.Messages.SendMessage;

public record SendMessageCommand(string RecipientId, string Subject, string Body)
    : IRequest<Result<MessageDto>>;
