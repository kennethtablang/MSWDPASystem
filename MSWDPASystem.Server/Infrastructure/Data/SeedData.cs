using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Domain.Entities;

namespace MSWDPASystem.Server.Infrastructure.Data;

public static class SeedData
{
    public static readonly string[] Roles = ["Admin", "MSWDStaff", "HeadCoordinator"];

    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

        await db.Database.MigrateAsync();

        foreach (var role in Roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole(role));
        }

        if (await userManager.FindByNameAsync("admin") == null)
        {
            var admin = new ApplicationUser
            {
                UserName = "admin",
                Email = "admin@mswd-caba.gov.ph",
                FullName = "System Administrator",
                EmailConfirmed = true,
                IsActive = true
            };
            var result = await userManager.CreateAsync(admin, "Admin@123456");
            if (result.Succeeded)
                await userManager.AddToRoleAsync(admin, "Admin");
        }

        if (!db.WelfarePrograms.Any())
        {
            db.WelfarePrograms.AddRange(
                new WelfareProgram { Name = "Social Pension Program", Code = "SOCPEN", Description = "Social Pension for Indigent Senior Citizens (RA 9994)" },
                new WelfareProgram { Name = "Pantawid Pamilyang Pilipino Program", Code = "4PS", Description = "Conditional cash transfer program (4Ps)" },
                new WelfareProgram { Name = "Persons with Disability Program", Code = "PWD", Description = "PWD assistance and ID issuance (RA 7277)" },
                new WelfareProgram { Name = "Solo Parent Welfare Program", Code = "SOLOPARENT", Description = "Solo parent assistance and ID processing (RA 8972)" },
                new WelfareProgram { Name = "Indigent Family Assistance", Code = "INDIGENT", Description = "Financial and in-kind assistance for indigent families" },
                new WelfareProgram { Name = "Calamity Assistance", Code = "CALAMITY", Description = "Emergency relief for calamity-affected households" }
            );
        }

        if (!db.AssistanceTypes.Any())
        {
            db.AssistanceTypes.AddRange(
                new AssistanceType { Name = "Financial Assistance", Description = "Monetary aid for immediate needs" },
                new AssistanceType { Name = "Medical Assistance", Description = "Support for medical expenses, medicines, and hospitalization" },
                new AssistanceType { Name = "Burial/Funeral Assistance", Description = "Aid for funeral and burial expenses" },
                new AssistanceType { Name = "Educational Assistance", Description = "Support for school fees and educational materials" },
                new AssistanceType { Name = "Livelihood Assistance", Description = "Assistance for livelihood projects and capital" },
                new AssistanceType { Name = "Relief Assistance", Description = "Food and non-food items for emergency relief" }
            );
        }

        await db.SaveChangesAsync();
    }
}
