using MediatR;
using Microsoft.AspNetCore.Identity;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Domain.Entities;
using MSWDPASystem.Server.Features.Users.GetUsers;

namespace MSWDPASystem.Server.Features.Users.CreateUser;

public class CreateUserCommandHandler(UserManager<ApplicationUser> userManager)
    : IRequestHandler<CreateUserCommand, Result<GetUsersResponse>>
{
    public async Task<Result<GetUsersResponse>> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        if (await userManager.FindByNameAsync(request.UserName) != null)
            return Result<GetUsersResponse>.Failure("Username is already taken.");

        if (await userManager.FindByEmailAsync(request.Email) != null)
            return Result<GetUsersResponse>.Failure("Email is already registered.");

        var user = new ApplicationUser
        {
            UserName = request.UserName,
            FullName = request.FullName,
            Email = request.Email,
            EmailConfirmed = true,
            IsActive = true
        };

        var result = await userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
            return Result<GetUsersResponse>.Failure(result.Errors.Select(e => e.Description).ToList());

        await userManager.AddToRoleAsync(user, request.Role);

        return Result<GetUsersResponse>.Success(new GetUsersResponse(
            user.Id, user.UserName!, user.FullName, user.Email!, request.Role,
            user.IsActive, user.CreatedAt, user.LastLoginAt));
    }
}
