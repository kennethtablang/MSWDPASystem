using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Common.Interfaces;
using MSWDPASystem.Server.Common.Services;
using MSWDPASystem.Server.Domain.Entities;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Controllers;

/// <summary>
/// Family links between beneficiaries, and the degree-of-relationship queries
/// built on them.
/// </summary>
[ApiController]
[Route("api/relationships")]
[Authorize(Roles = "Admin,MSWDStaff,HeadCoordinator")]
public class RelationshipsController(
    ApplicationDbContext db,
    KinshipService kinship,
    ICurrentUserService currentUser) : ControllerBase
{
    /// <summary>Every declared relative of one beneficiary.</summary>
    [HttpGet("{beneficiaryId:guid}")]
    public async Task<IActionResult> GetRelatives(Guid beneficiaryId, CancellationToken ct)
    {
        var links = await db.BeneficiaryRelationships.AsNoTracking()
            .Where(r => r.BeneficiaryId == beneficiaryId)
            .Include(r => r.Relative)
            .OrderBy(r => r.Type)
            .Select(r => new
            {
                r.Id,
                relativeId = r.RelativeId,
                clientNumber = r.Relative.ClientNumber,
                fullName = r.Relative.FirstName + " " + r.Relative.LastName,
                barangay = r.Relative.Barangay,
                status = r.Relative.Status.ToString(),
                type = r.Type.ToString(),
                r.IsInferred,
                r.Notes,
            })
            .ToListAsync(ct);

        return Ok(links);
    }

    /// <summary>Degree of relationship between two beneficiaries.</summary>
    [HttpGet("degree")]
    public async Task<IActionResult> GetDegree(
        [FromQuery] Guid from, [FromQuery] Guid to, CancellationToken ct)
    {
        if (from == Guid.Empty || to == Guid.Empty)
            return BadRequest(new { message = "Both 'from' and 'to' beneficiary ids are required." });

        var result = await kinship.GetKinshipAsync(from, to, ct: ct);
        return Ok(result);
    }

    /// <summary>Unlinked records that look like relatives, for staff to confirm.</summary>
    [HttpGet("{beneficiaryId:guid}/suggestions")]
    public async Task<IActionResult> GetSuggestions(
        Guid beneficiaryId, [FromQuery] int minScore = 40, CancellationToken ct = default)
        => Ok(await kinship.FindLikelyRelativesAsync(beneficiaryId, minScore, ct));

    /// <summary>Declare a family link. Writes both directions.</summary>
    [HttpPost]
    [Authorize(Roles = "MSWDStaff,Admin")]
    public async Task<IActionResult> Create([FromBody] CreateRelationshipRequest body, CancellationToken ct)
    {
        if (body.BeneficiaryId == body.RelativeId)
            return BadRequest(new { message = "A beneficiary cannot be related to themselves." });

        var pair = await db.Beneficiaries
            .Where(b => b.Id == body.BeneficiaryId || b.Id == body.RelativeId)
            .ToListAsync(ct);
        if (pair.Count != 2)
            return NotFound(new { message = "One or both beneficiaries were not found." });

        var exists = await db.BeneficiaryRelationships
            .AnyAsync(r => r.BeneficiaryId == body.BeneficiaryId && r.RelativeId == body.RelativeId, ct);
        if (exists)
            return BadRequest(new { message = "These beneficiaries are already linked." });

        var inverse = Invert(body.Type);

        db.BeneficiaryRelationships.Add(new BeneficiaryRelationship
        {
            BeneficiaryId = body.BeneficiaryId,
            RelativeId = body.RelativeId,
            Type = body.Type,
            Notes = body.Notes,
            CreatedByUserId = currentUser.UserId,
        });
        db.BeneficiaryRelationships.Add(new BeneficiaryRelationship
        {
            BeneficiaryId = body.RelativeId,
            RelativeId = body.BeneficiaryId,
            Type = inverse,
            Notes = body.Notes,
            CreatedByUserId = currentUser.UserId,
        });

        var subject = pair.First(b => b.Id == body.BeneficiaryId);
        var relative = pair.First(b => b.Id == body.RelativeId);

        db.AuditLogs.Add(new AuditLog
        {
            UserId = currentUser.UserId,
            UserName = currentUser.UserName,
            Action = AuditAction.Create,
            EntityType = "BeneficiaryRelationship",
            EntityId = body.BeneficiaryId.ToString(),
            Description =
                $"Linked {relative.ClientNumber} ({relative.FullName}) as {body.Type} of " +
                $"{subject.ClientNumber} ({subject.FullName}).",
            Timestamp = DateTime.UtcNow,
        });

        await db.SaveChangesAsync(ct);
        return Ok(new { message = "Family link saved." });
    }

    /// <summary>Remove a link. Both directions go together.</summary>
    [HttpDelete("{beneficiaryId:guid}/{relativeId:guid}")]
    [Authorize(Roles = "MSWDStaff,Admin")]
    public async Task<IActionResult> Delete(Guid beneficiaryId, Guid relativeId, CancellationToken ct)
    {
        var links = await db.BeneficiaryRelationships
            .Where(r => (r.BeneficiaryId == beneficiaryId && r.RelativeId == relativeId)
                     || (r.BeneficiaryId == relativeId && r.RelativeId == beneficiaryId))
            .ToListAsync(ct);

        if (links.Count == 0) return NotFound(new { message = "No link found between these beneficiaries." });

        db.BeneficiaryRelationships.RemoveRange(links);

        db.AuditLogs.Add(new AuditLog
        {
            UserId = currentUser.UserId,
            UserName = currentUser.UserName,
            Action = AuditAction.Delete,
            EntityType = "BeneficiaryRelationship",
            EntityId = beneficiaryId.ToString(),
            Description = $"Removed family link between {beneficiaryId} and {relativeId}.",
            Timestamp = DateTime.UtcNow,
        });

        await db.SaveChangesAsync(ct);
        return Ok(new { message = "Family link removed." });
    }

    /// <summary>The inverse label, so each side of the edge reads correctly.</summary>
    private static RelationshipType Invert(RelationshipType type) => type switch
    {
        RelationshipType.Parent => RelationshipType.Child,
        RelationshipType.Child => RelationshipType.Parent,
        RelationshipType.Grandparent => RelationshipType.Grandchild,
        RelationshipType.Grandchild => RelationshipType.Grandparent,
        RelationshipType.AuntUncle => RelationshipType.NieceNephew,
        RelationshipType.NieceNephew => RelationshipType.AuntUncle,
        RelationshipType.ParentInLaw => RelationshipType.ChildInLaw,
        RelationshipType.ChildInLaw => RelationshipType.ParentInLaw,
        RelationshipType.Guardian => RelationshipType.Ward,
        RelationshipType.Ward => RelationshipType.Guardian,
        // Symmetric by nature.
        RelationshipType.Spouse => RelationshipType.Spouse,
        RelationshipType.Sibling => RelationshipType.Sibling,
        RelationshipType.SiblingInLaw => RelationshipType.SiblingInLaw,
        RelationshipType.Cousin => RelationshipType.Cousin,
        _ => RelationshipType.Other,
    };
}

public record CreateRelationshipRequest(Guid BeneficiaryId, Guid RelativeId, RelationshipType Type, string? Notes);
