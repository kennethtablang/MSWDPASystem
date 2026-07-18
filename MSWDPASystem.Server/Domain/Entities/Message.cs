namespace MSWDPASystem.Server.Domain.Entities;

public class Message : BaseEntity
{
    public string SenderId { get; set; } = string.Empty;
    public ApplicationUser Sender { get; set; } = null!;

    public string RecipientId { get; set; } = string.Empty;
    public ApplicationUser Recipient { get; set; } = null!;

    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public bool IsRead { get; set; } = false;
    public DateTime? ReadAt { get; set; }
    public bool IsDeletedBySender { get; set; } = false;
    public bool IsDeletedByRecipient { get; set; } = false;
}
