using MSWDPASystem.Server.Domain.Enums;

namespace MSWDPASystem.Server.Features.DuplicateFlags.GetDuplicateFlags;

public record DuplicateFlagDto(
    Guid Id,
    Guid OriginalBeneficiaryId,
    string OriginalClientNumber,
    string OriginalName,
    Guid DuplicateBeneficiaryId,
    string DuplicateClientNumber,
    string DuplicateName,
    DuplicateFlagStatus Status,
    bool FlaggedBySystem,
    string? ResolutionNotes,
    DateTime? ResolvedAt,
    DateTime CreatedAt
);
