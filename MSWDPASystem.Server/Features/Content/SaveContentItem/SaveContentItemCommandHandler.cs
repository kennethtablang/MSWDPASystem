using MediatR;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Common.Interfaces;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Domain.Entities;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Content.SaveContentItem;

public class SaveContentItemCommandHandler(
    ApplicationDbContext db,
    ICurrentUserService currentUser)
    : IRequestHandler<SaveContentItemCommand, Result<ContentItemDto>>
{
    public async Task<Result<ContentItemDto>> Handle(
        SaveContentItemCommand request, CancellationToken ct)
    {
        var errors = Validate(request);
        if (errors.Count > 0)
            return Result<ContentItemDto>.Failure(errors);

        var now = DateTime.UtcNow;
        var isCreate = request.Id is null;

        ContentItem item;
        string? oldValues = null;

        if (isCreate)
        {
            item = new ContentItem { Type = request.Type };
            item.CreatedByUserId = currentUser.UserId;
            item.CreatedByName = currentUser.UserName;
            db.ContentItems.Add(item);
        }
        else
        {
            var existing = await db.ContentItems
                .FirstOrDefaultAsync(c => c.Id == request.Id!.Value, ct);

            if (existing is null || existing.IsDeleted)
                return Result<ContentItemDto>.Failure("Content item not found.");

            oldValues = Describe(existing);
            item = existing;

            // Type is fixed at creation: moving an item between sections would
            // silently change where it appears publicly, and the audit trail
            // would read as a plain edit.
            if (existing.Type != request.Type)
                return Result<ContentItemDto>.Failure(
                    "The section of an existing item cannot be changed. Create a new item instead.");
        }

        item.Status = request.Status;
        item.Title = request.Title.Trim();
        item.Body = request.Body.Trim();
        item.ExpiresAt = request.ExpiresAt;
        item.SortOrder = request.SortOrder;

        // Publishing with no date set means "now" — otherwise the item would be
        // Published but invisible, which reads as a bug to the staff member.
        item.PublishAt = request.Status == ContentStatus.Published
            ? request.PublishAt ?? item.PublishAt ?? now
            : request.PublishAt;

        if (!isCreate)
        {
            item.UpdatedAt = now;
            item.UpdatedByUserId = currentUser.UserId;
            item.UpdatedByName = currentUser.UserName;
        }

        db.AuditLogs.Add(new AuditLog
        {
            UserId = currentUser.UserId,
            UserName = currentUser.UserName,
            Action = isCreate ? AuditAction.Create : AuditAction.Update,
            EntityType = nameof(ContentItem),
            EntityId = item.Id.ToString(),
            OldValues = oldValues,
            NewValues = Describe(item),
            Description = isCreate
                ? $"Created {request.Type} \"{item.Title}\" ({request.Status})."
                : $"Updated {request.Type} \"{item.Title}\" ({request.Status}).",
        });

        await db.SaveChangesAsync(ct);

        return Result<ContentItemDto>.Success(item.ToDto(now));
    }

    private static List<string> Validate(SaveContentItemCommand r)
    {
        var errors = new List<string>();

        if (string.IsNullOrWhiteSpace(r.Title))
            errors.Add("Title is required.");
        else if (r.Title.Trim().Length > 200)
            errors.Add("Title must be 200 characters or fewer.");

        if (string.IsNullOrWhiteSpace(r.Body))
            errors.Add("Body is required.");
        else if (r.Body.Trim().Length > 4000)
            errors.Add("Body must be 4000 characters or fewer.");

        if (!Enum.IsDefined(r.Type))
            errors.Add("Unknown content section.");

        if (!Enum.IsDefined(r.Status))
            errors.Add("Unknown status.");

        if (r.PublishAt.HasValue && r.ExpiresAt.HasValue && r.ExpiresAt <= r.PublishAt)
            errors.Add("The expiry date must be after the publish date.");

        return errors;
    }

    /// <summary>
    /// Audit snapshot. Deliberately not the full body — the audit log is read as
    /// a timeline, and a 4000-character paste would drown it. The body's length
    /// is recorded so a substantive rewrite is still visible.
    /// </summary>
    private static string Describe(ContentItem c) =>
        System.Text.Json.JsonSerializer.Serialize(new
        {
            c.Type,
            c.Status,
            c.Title,
            BodyLength = c.Body.Length,
            c.PublishAt,
            c.ExpiresAt,
            c.SortOrder,
        });
}
