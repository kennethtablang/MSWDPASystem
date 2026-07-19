using MediatR;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Common.Interfaces;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Domain.Entities;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Features.Account.GetMyAccount;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Beneficiaries.RegisterBeneficiary;

public class RegisterBeneficiaryCommandHandler(
    ApplicationDbContext context,
    ICurrentUserService currentUser)
    : IRequestHandler<RegisterBeneficiaryCommand, Result<RegisterBeneficiaryResponse>>
{
    public async Task<Result<RegisterBeneficiaryResponse>> Handle(
        RegisterBeneficiaryCommand request, CancellationToken cancellationToken)
    {
        var clientNumber = await GenerateClientNumberAsync(cancellationToken);

        var beneficiary = new Beneficiary
        {
            ClientNumber = clientNumber,
            FirstName = request.FirstName,
            MiddleName = request.MiddleName,
            LastName = request.LastName,
            Suffix = request.Suffix,
            DateOfBirth = request.DateOfBirth,
            Sex = request.Sex,
            CivilStatus = request.CivilStatus,
            Barangay = request.Barangay,
            Address = request.Address,
            ContactNumber = request.ContactNumber,
            EmailAddress = request.EmailAddress,
            Occupation = request.Occupation,
            MonthlyIncome = request.MonthlyIncome,
            Status = BeneficiaryStatus.Active,
            CreatedByUserId = currentUser.UserId
        };

        context.Beneficiaries.Add(beneficiary);

        if (request.WelfareProgramIds?.Any() == true)
        {
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

        await context.SaveChangesAsync(cancellationToken);

        var duplicateFlagged = await RunDuplicateDetectionAsync(beneficiary, cancellationToken);

        context.AuditLogs.Add(new AuditLog
        {
            UserId = currentUser.UserId,
            UserName = currentUser.UserName,
            Action = AuditAction.Create,
            EntityType = "Beneficiary",
            EntityId = beneficiary.Id.ToString(),
            Description = $"Registered beneficiary '{beneficiary.FullName}' with client number '{clientNumber}'."
        });
        await context.SaveChangesAsync(cancellationToken);

        return Result<RegisterBeneficiaryResponse>.Success(new RegisterBeneficiaryResponse(
            beneficiary.Id, clientNumber, beneficiary.FullName, beneficiary.Status, duplicateFlagged));
    }

    private async Task<string> GenerateClientNumberAsync(CancellationToken ct)
    {
        var year = DateTime.Today.Year;
        var prefix = $"CABA-{year}-";
        var lastInYear = await context.Beneficiaries
            .Where(b => b.ClientNumber.StartsWith(prefix))
            .OrderByDescending(b => b.ClientNumber)
            .Select(b => b.ClientNumber)
            .FirstOrDefaultAsync(ct);

        var seq = 1;
        if (lastInYear != null)
        {
            var lastSeqStr = lastInYear.Split('-').LastOrDefault();
            if (int.TryParse(lastSeqStr, out var lastSeq))
                seq = lastSeq + 1;
        }

        return $"{prefix}{seq:D4}";
    }

    private async Task<bool> RunDuplicateDetectionAsync(Beneficiary newBeneficiary, CancellationToken ct)
    {
        var potentialDuplicates = await context.Beneficiaries
            .Where(b => b.Id != newBeneficiary.Id &&
                        b.LastName == newBeneficiary.LastName &&
                        b.FirstName == newBeneficiary.FirstName &&
                        b.DateOfBirth == newBeneficiary.DateOfBirth)
            .ToListAsync(ct);

        if (!potentialDuplicates.Any()) return false;

        newBeneficiary.Status = BeneficiaryStatus.Flagged;

        foreach (var duplicate in potentialDuplicates)
        {
            context.DuplicateFlags.Add(new DuplicateFlag
            {
                OriginalBeneficiaryId = duplicate.Id,
                DuplicateBeneficiaryId = newBeneficiary.Id,
                FlaggedBySystem = true,
                Status = DuplicateFlagStatus.Pending
            });
        }

        // Tell the people who can resolve flags (per DuplicateFlagsController this
        // is Admin and HeadCoordinator), except whoever just did the registering —
        // they are looking at the flag on screen already.
        var reviewers = await (
                from ur in context.UserRoles
                join role in context.Roles on ur.RoleId equals role.Id
                join user in context.Users on ur.UserId equals user.Id
                where (role.Name == "Admin" || role.Name == "HeadCoordinator") &&
                      user.Id != currentUser.UserId
                select new { user.Id, user.Preferences })
            .Distinct()
            .ToListAsync(ct);

        foreach (var reviewer in reviewers)
        {
            if (!GetMyAccountQueryHandler.ParsePreferences(reviewer.Preferences).NotifyOnDuplicateFlag)
                continue;

            context.Notifications.Add(new Notification
            {
                RecipientUserId = reviewer.Id,
                Title = "Possible duplicate registration",
                Message = $"'{newBeneficiary.FullName}' ({newBeneficiary.ClientNumber}) matches an existing record and needs review.",
                Type = NotificationType.DuplicateFlag,
                RelatedEntityType = "Beneficiary",
                RelatedEntityId = newBeneficiary.Id.ToString()
            });
        }

        return true;
    }
}
