using MediatR;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Common.Exceptions;
using MSWDPASystem.Server.Common.Interfaces;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Beneficiaries.GetQrCode;

public class GetQrCodeQueryHandler(ApplicationDbContext context, IQrCodeService qrCodeService)
    : IRequestHandler<GetQrCodeQuery, Result<string>>
{
    public async Task<Result<string>> Handle(GetQrCodeQuery request, CancellationToken cancellationToken)
    {
        var beneficiary = await context.Beneficiaries
            .AsNoTracking()
            .FirstOrDefaultAsync(b => b.Id == request.BeneficiaryId, cancellationToken)
            ?? throw new NotFoundException("Beneficiary", request.BeneficiaryId);

        var qrData = beneficiary.ClientNumber;
        var base64 = qrCodeService.GenerateQrCodeBase64(qrData);
        return Result<string>.Success(base64);
    }
}
