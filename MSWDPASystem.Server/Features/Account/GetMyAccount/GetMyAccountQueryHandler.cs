using System.Text.Json;
using MediatR;
using Microsoft.AspNetCore.Identity;
using MSWDPASystem.Server.Common.Interfaces;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Domain.Entities;

namespace MSWDPASystem.Server.Features.Account.GetMyAccount;

public class GetMyAccountQueryHandler(
    UserManager<ApplicationUser> userManager,
    ICurrentUserService currentUser)
    : IRequestHandler<GetMyAccountQuery, Result<MyAccountDto>>
{
    internal static readonly JsonSerializerOptions JsonOptions =
        new(JsonSerializerDefaults.Web);

    public async Task<Result<MyAccountDto>> Handle(GetMyAccountQuery request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(currentUser.UserId))
            return Result<MyAccountDto>.Failure("Not authenticated.");

        var user = await userManager.FindByIdAsync(currentUser.UserId);
        if (user == null)
            return Result<MyAccountDto>.Failure("Account not found.");

        var roles = await userManager.GetRolesAsync(user);

        return Result<MyAccountDto>.Success(new MyAccountDto(
            user.Id,
            user.UserName ?? string.Empty,
            user.FullName,
            user.Email ?? string.Empty,
            user.ContactNumber,
            roles.FirstOrDefault() ?? string.Empty,
            user.CreatedAt,
            user.LastLoginAt,
            ParsePreferences(user.Preferences)
        ));
    }

    internal static MyPreferencesDto ParsePreferences(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return new MyPreferencesDto();
        try
        {
            return JsonSerializer.Deserialize<MyPreferencesDto>(json, JsonOptions) ?? new MyPreferencesDto();
        }
        catch (JsonException)
        {
            return new MyPreferencesDto();
        }
    }
}
