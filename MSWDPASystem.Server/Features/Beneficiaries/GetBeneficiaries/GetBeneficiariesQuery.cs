using MediatR;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Domain.Enums;

namespace MSWDPASystem.Server.Features.Beneficiaries.GetBeneficiaries;

public record GetBeneficiariesQuery(
    int Page = 1,
    int PageSize = 20,
    string? Search = null,
    string? Barangay = null,
    Guid? ProgramId = null,
    BeneficiaryStatus? Status = null
) : IRequest<PagedList<BeneficiaryListDto>>;
