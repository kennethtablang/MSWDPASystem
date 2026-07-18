using MediatR;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Common.Interfaces;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Features.Beneficiaries.DownloadDocument;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Beneficiaries.GetSignature;

public class GetSignatureQueryHandler(ApplicationDbContext db, IFileStorageService fileStorage)
    : IRequestHandler<GetSignatureQuery, Result<FileDownloadDto>>
{
    public async Task<Result<FileDownloadDto>> Handle(GetSignatureQuery request, CancellationToken ct)
    {
        var beneficiary = await db.Beneficiaries
            .AsNoTracking()
            .FirstOrDefaultAsync(b => b.Id == request.BeneficiaryId, ct);

        if (beneficiary == null)
            return Result<FileDownloadDto>.Failure("Beneficiary not found.");

        if (string.IsNullOrWhiteSpace(beneficiary.SignatureFilePath))
            return Result<FileDownloadDto>.Failure("No signature has been captured for this beneficiary.");

        var content = await fileStorage.ReadFileAsync(beneficiary.SignatureFilePath);
        if (content == null)
            return Result<FileDownloadDto>.Failure("Signature file is no longer available.");

        return Result<FileDownloadDto>.Success(
            new FileDownloadDto(content, "image/png", $"signature_{beneficiary.ClientNumber}.png"));
    }
}
