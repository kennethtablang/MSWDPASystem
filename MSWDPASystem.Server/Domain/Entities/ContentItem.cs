using MSWDPASystem.Server.Domain.Enums;

namespace MSWDPASystem.Server.Domain.Entities;

/// <summary>
/// Staff-editable content shown on the public landing page: announcements,
/// news items, and FAQ entries.
///
/// One table rather than three, because all three share the same lifecycle
/// (draft → published → expired), the same authorship trail, and the same
/// management screen. <see cref="ContentType"/> discriminates them.
///
/// For an FAQ, <see cref="Title"/> holds the question and <see cref="Body"/>
/// the answer — the shapes are identical, so a separate table would buy nothing
/// but duplicated CRUD.
/// </summary>
public class ContentItem : BaseEntity
{
    public ContentType Type { get; set; }

    public ContentStatus Status { get; set; } = ContentStatus.Draft;

    public string Title { get; set; } = string.Empty;

    public string Body { get; set; } = string.Empty;

    /// <summary>
    /// When the item becomes publicly visible. Null means "as soon as it is
    /// published". A future date lets staff prepare a payout notice in advance.
    /// </summary>
    public DateTime? PublishAt { get; set; }

    /// <summary>
    /// When the item drops off the landing page. Null means it stays until
    /// unpublished by hand. Expired items remain in the public archive — a
    /// payout schedule that has passed is still a public record.
    /// </summary>
    public DateTime? ExpiresAt { get; set; }

    /// <summary>
    /// Manual ordering, used by FAQs — which are not chronological, so staff
    /// need to put the most-asked question first. Announcements and news order
    /// by <see cref="PublishAt"/> and ignore this.
    /// </summary>
    public int SortOrder { get; set; }

    public string? CreatedByUserId { get; set; }
    public string? CreatedByName { get; set; }
    public string? UpdatedByUserId { get; set; }
    public string? UpdatedByName { get; set; }

    /// <summary>
    /// Soft delete. Public content that once appeared on a government site is
    /// not hard-deleted — the audit trail must still be able to explain what was
    /// published and when.
    /// </summary>
    public bool IsDeleted { get; set; }
}
