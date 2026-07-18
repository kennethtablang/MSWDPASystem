using MediatR;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Common.Interfaces;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Domain.Entities;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Features.Household.GetHouseholds;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Features.Household.CreateHousehold;

public class CreateHouseholdCommandHandler(
    ApplicationDbContext db,
    ICurrentUserService currentUser)
    : IRequestHandler<CreateHouseholdCommand, Result<HouseholdDto>>
{
    public async Task<Result<HouseholdDto>> Handle(CreateHouseholdCommand request, CancellationToken ct)
    {
        var householdNumber = await GenerateHouseholdNumberAsync(ct);

        var household = new Domain.Entities.Household
        {
            HouseholdNumber = householdNumber,
            Barangay = request.Barangay,
            Address = request.Address,
            HeadOfHouseholdName = request.HeadOfHouseholdName
        };

        db.Households.Add(household);

        db.AuditLogs.Add(new AuditLog
        {
            UserId = currentUser.UserId,
            UserName = currentUser.UserName,
            Action = AuditAction.Create,
            EntityType = "Household",
            EntityId = household.Id.ToString(),
            Description = $"Created household '{householdNumber}' in {request.Barangay}."
        });

        await db.SaveChangesAsync(ct);

        return Result<HouseholdDto>.Success(new HouseholdDto(
            household.Id, household.HouseholdNumber, household.Barangay,
            household.Address, household.HeadOfHouseholdName, 0, household.CreatedAt));
    }

    private async Task<string> GenerateHouseholdNumberAsync(CancellationToken ct)
    {
        var year = DateTime.Today.Year;
        var prefix = $"HH-{year}-";
        var last = await db.Households
            .Where(h => h.HouseholdNumber.StartsWith(prefix))
            .OrderByDescending(h => h.HouseholdNumber)
            .Select(h => h.HouseholdNumber)
            .FirstOrDefaultAsync(ct);

        var seq = 1;
        if (last != null)
        {
            var lastSeqStr = last.Split('-').LastOrDefault();
            if (int.TryParse(lastSeqStr, out var lastSeq))
                seq = lastSeq + 1;
        }

        return $"{prefix}{seq:D4}";
    }
}
