using MediatR;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Common.Exceptions;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Beneficiaries.GetBeneficiary;

public class GetBeneficiaryQueryHandler(ApplicationDbContext context)
    : IRequestHandler<GetBeneficiaryQuery, Result<BeneficiaryDetailDto>>
{
    public async Task<Result<BeneficiaryDetailDto>> Handle(
        GetBeneficiaryQuery request, CancellationToken cancellationToken)
    {
        var b = await context.Beneficiaries
            .AsNoTracking()
            .Include(x => x.Programs).ThenInclude(p => p.WelfareProgram)
            .Include(x => x.AssistanceRequests).ThenInclude(r => r.AssistanceType)
            .Include(x => x.Documents)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("Beneficiary", request.Id);

        var age = DateTime.Today.Year - b.DateOfBirth.Year;
        if (b.DateOfBirth.DayOfYear > DateTime.Today.DayOfYear) age--;

        var linkedCitizen = await context.Users.AsNoTracking()
            .Where(u => u.LinkedBeneficiaryId == b.Id)
            .Select(u => new LinkedCitizenDto(u.Id, u.FullName, u.UserName!, u.Email!, u.EmailConfirmed))
            .FirstOrDefaultAsync(cancellationToken);

        return Result<BeneficiaryDetailDto>.Success(new BeneficiaryDetailDto(
            b.Id, b.ClientNumber,
            b.FirstName, b.MiddleName, b.LastName, b.Suffix, b.FullName,
            b.DateOfBirth, age,
            b.Sex, b.CivilStatus,
            b.Barangay, b.Address,
            b.ContactNumber, b.EmailAddress,
            b.Occupation, b.MonthlyIncome,
            b.Status,
            b.Programs.Select(p => new ProgramEnrollmentDto(
                p.WelfareProgramId, p.WelfareProgram.Name, p.EnrollmentDate, p.IsActive)).ToList(),
            b.AssistanceRequests.OrderByDescending(r => r.CreatedAt).Take(5)
                .Select(r => new RecentAssistanceDto(
                    r.Id, r.RequestNumber, r.AssistanceType.Name,
                    r.Amount, r.Status.ToString(), r.CreatedAt)).ToList(),
            b.Documents.OrderByDescending(d => d.CreatedAt)
                .Select(d => new DocumentDto(d.Id, d.FileName, d.DocumentType ?? "General", d.CreatedAt)).ToList(),
            !string.IsNullOrWhiteSpace(b.SignatureFilePath),
            linkedCitizen,
            b.CreatedAt, b.UpdatedAt));
    }
}
