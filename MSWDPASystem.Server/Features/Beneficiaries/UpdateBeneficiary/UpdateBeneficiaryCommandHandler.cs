using MediatR;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Common.Exceptions;
using MSWDPASystem.Server.Common.Interfaces;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Domain.Entities;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Features.Beneficiaries.GetBeneficiary;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Beneficiaries.UpdateBeneficiary;

public class UpdateBeneficiaryCommandHandler(
    ApplicationDbContext context,
    ICurrentUserService currentUser,
    IMediator mediator)
    : IRequestHandler<UpdateBeneficiaryCommand, Result<BeneficiaryDetailDto>>
{
    public async Task<Result<BeneficiaryDetailDto>> Handle(
        UpdateBeneficiaryCommand request, CancellationToken cancellationToken)
    {
        var beneficiary = await context.Beneficiaries
            .Include(b => b.Programs)
            .FirstOrDefaultAsync(b => b.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("Beneficiary", request.Id);

        beneficiary.FirstName = request.FirstName;
        beneficiary.MiddleName = request.MiddleName;
        beneficiary.LastName = request.LastName;
        beneficiary.Suffix = request.Suffix;
        beneficiary.DateOfBirth = request.DateOfBirth;
        beneficiary.Sex = request.Sex;
        beneficiary.CivilStatus = request.CivilStatus;
        beneficiary.Barangay = request.Barangay;
        beneficiary.Address = request.Address;
        beneficiary.ContactNumber = request.ContactNumber;
        beneficiary.EmailAddress = request.EmailAddress;
        beneficiary.Occupation = request.Occupation;
        beneficiary.MonthlyIncome = request.MonthlyIncome;
        beneficiary.UpdatedByUserId = currentUser.UserId;

        if (request.WelfareProgramIds != null)
        {
            beneficiary.Programs.Clear();
            foreach (var programId in request.WelfareProgramIds)
            {
                beneficiary.Programs.Add(new BeneficiaryProgram
                {
                    BeneficiaryId = beneficiary.Id,
                    WelfareProgramId = programId,
                    EnrollmentDate = DateOnly.FromDateTime(DateTime.Today)
                });
            }
        }

        context.AuditLogs.Add(new AuditLog
        {
            UserId = currentUser.UserId,
            UserName = currentUser.UserName,
            Action = AuditAction.Update,
            EntityType = "Beneficiary",
            EntityId = beneficiary.Id.ToString(),
            Description = $"Updated beneficiary '{beneficiary.FullName}'."
        });

        await context.SaveChangesAsync(cancellationToken);
        return await mediator.Send(new GetBeneficiaryQuery(request.Id), cancellationToken);
    }
}
