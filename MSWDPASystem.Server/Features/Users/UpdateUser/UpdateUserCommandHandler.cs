using MediatR;
using Microsoft.AspNetCore.Identity;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Common.Exceptions;
using MSWDPASystem.Server.Domain.Entities;
using MSWDPASystem.Server.Features.Users.GetUsers;

namespace MSWDPASystem.Server.Features.Users.UpdateUser;

public class UpdateUserCommandHandler(UserManager<ApplicationUser> userManager)
    : IRequestHandler<UpdateUserCommand, Result<GetUsersResponse>>
{
    public async Task<Result<GetUsersResponse>> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        var user = await userManager.FindByIdAsync(request.Id)
            ?? throw new NotFoundException("User", request.Id);

        user.FullName = request.FullName;
        user.Email = request.Email;
        user.NormalizedEmail = request.Email.ToUpper();
        user.IsActive = request.IsActive;

        var currentRoles = await userManager.GetRolesAsync(user);
        if (!currentRoles.Contains(request.Role))
        {
            await userManager.RemoveFromRolesAsync(user, currentRoles);
            await userManager.AddToRoleAsync(user, request.Role);
        }

        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
            return Result<GetUsersResponse>.Failure(result.Errors.Select(e => e.Description).ToList());

        return Result<GetUsersResponse>.Success(new GetUsersResponse(
            user.Id, user.UserName!, user.FullName, user.Email!, request.Role,
            user.IsActive, user.CreatedAt, user.LastLoginAt));
    }
}
