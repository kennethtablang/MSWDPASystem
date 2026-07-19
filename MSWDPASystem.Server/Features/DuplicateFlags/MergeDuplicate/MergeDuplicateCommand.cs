using MediatR;
using MSWDPASystem.Server.Common.Models;

namespace MSWDPASystem.Server.Features.DuplicateFlags.MergeDuplicate;

/// <summary>
/// FR-3.6: resolve a flagged pair by merging the duplicate into the record that
/// is being kept, rather than only tagging it.
/// </summary>
/// <param name="Id">The duplicate flag being resolved.</param>
/// <param name="KeepBeneficiaryId">
/// Which of the two records survives. The coordinator chooses this explicitly — the
/// older record is not always the better one (the newer may hold the current address).
/// </param>
public record MergeDuplicateCommand(
    Guid Id,
    Guid KeepBeneficiaryId,
    string? Notes
) : IRequest<Result<MergeDuplicateResponse>>;

public record MergeDuplicateResponse(
    Guid KeptBeneficiaryId,
    string KeptClientNumber,
    Guid MergedBeneficiaryId,
    string MergedClientNumber,
    int MovedRequests,
    int MovedDocuments,
    int MovedScanLogs,
    int MovedPrograms,
    bool MovedCitizenLink
);
