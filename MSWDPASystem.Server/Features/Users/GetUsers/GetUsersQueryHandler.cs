using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Common.Models;
using MSWDPASystem.Server.Domain.Entities;

namespace MSWDPASystem.Server.Features.Users.GetUsers;

public class GetUsersQueryHandler(UserManager<ApplicationUser> userManager)
    : IRequestHandler<GetUsersQuery, PagedList<GetUsersResponse>>
{
    public async Task<PagedList<GetUsersResponse>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
    {
        var query = userManager.Users.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.ToLower();
            query = query.Where(u =>
                u.FullName.ToLower().Contains(search) ||
                (u.UserName != null && u.UserName.ToLower().Contains(search)) ||
                (u.Email != null && u.Email.ToLower().Contains(search)));
        }

        var total = await query.CountAsync(cancellationToken);
        var users = await query
            .OrderBy(u => u.FullName)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var items = new List<GetUsersResponse>();
        foreach (var user in users)
        {
            var roles = await userManager.GetRolesAsync(user);
            items.Add(new GetUsersResponse(
                user.Id,
                user.UserName ?? string.Empty,
                user.FullName,
                user.Email ?? string.Empty,
                roles.FirstOrDefault() ?? string.Empty,
                user.IsActive,
                user.CreatedAt,
                user.LastLoginAt));
        }

        return new PagedList<GetUsersResponse>
        {
            Items = items,
            TotalCount = total,
            PageNumber = request.Page,
            PageSize = request.PageSize
        };
    }
}
