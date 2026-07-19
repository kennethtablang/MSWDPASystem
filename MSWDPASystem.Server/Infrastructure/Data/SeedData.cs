using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Common.Configuration;
using MSWDPASystem.Server.Domain.Entities;
using MSWDPASystem.Server.Domain.Enums;

namespace MSWDPASystem.Server.Infrastructure.Data;

public static class SeedData
{
    public static readonly string[] Roles = ["Admin", "MSWDStaff", "HeadCoordinator", "Citizen"];

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

        // FR-8.1: persist any configurable parameter that has no stored row yet.
        // Idempotent, so newly declared settings appear on the next startup without
        // disturbing values an administrator has already customised.
        var existingKeys = await db.SystemSettings.Select(s => s.Key).ToListAsync();
        var missing = SystemSettingDefinitions.All
            .Where(d => !existingKeys.Contains(d.Key))
            .Select(d => new SystemSetting { Key = d.Key, Value = d.DefaultValue });

        db.SystemSettings.AddRange(missing);

        await SeedLandingContentAsync(db);

        await db.SaveChangesAsync();
    }

    /// <summary>
    /// Carries the announcements, news, and FAQs that used to be hard-coded in
    /// the client's <c>siteContent.js</c> into the database, so the landing page
    /// is not blank on first run and staff have real examples to edit.
    ///
    /// Runs only when the table is empty. It must never re-add an item that
    /// staff have since deleted, so this is a first-run seed rather than the
    /// key-by-key reconciliation used for system settings above.
    /// </summary>
    private static async Task SeedLandingContentAsync(ApplicationDbContext db)
    {
        if (await db.ContentItems.AnyAsync()) return;

        var seeded = new[]
        {
            Announcement(
                "Social Pension payout schedule for the 3rd quarter",
                "Qualified senior citizens may claim their social pension at the Municipal Gymnasium. Bring your OSCA ID and QR beneficiary record. Schedules are released per barangay — check with your barangay hall.",
                new DateTime(2026, 7, 14, 0, 0, 0, DateTimeKind.Utc)),
            Announcement(
                "PWD ID renewal now accommodated every weekday",
                "Renewal of PWD identification cards is now processed Monday to Friday, 8:00 AM–3:00 PM at the MSWD office, Caba Municipal Hall.",
                new DateTime(2026, 7, 7, 0, 0, 0, DateTimeKind.Utc)),
            Announcement(
                "Online citizen accounts now available",
                "Residents may now create a citizen account on this website to view announcements and track their assistance requests online.",
                new DateTime(2026, 6, 30, 0, 0, 0, DateTimeKind.Utc)),

            News(
                "MSWD Caba conducts family development sessions in coastal barangays",
                "Family development sessions for 4Ps beneficiary families covered parenting, budgeting, and disaster preparedness topics.",
                new DateTime(2026, 7, 10, 0, 0, 0, DateTimeKind.Utc)),
            News(
                "Relief operations completed after heavy monsoon rains",
                "Food packs and non-food items were distributed to affected households in coordination with the MDRRMO and barangay officials.",
                new DateTime(2026, 6, 25, 0, 0, 0, DateTimeKind.Utc)),
            News(
                "Solo parents attend livelihood skills training",
                "Registered solo parents completed a skills training on food processing in partnership with the Public Employment Service Office.",
                new DateTime(2026, 6, 12, 0, 0, 0, DateTimeKind.Utc)),

            Faq(0,
                "How do I register as a beneficiary?",
                "Visit the MSWD office at the Caba Municipal Hall during office hours. Bring a valid ID, and depending on the program, supporting documents such as a barangay certificate of residency or indigency. Our staff will profile your household and enroll you in programs you qualify for."),
            Faq(1,
                "What are the usual requirements for assistance?",
                "Most assistance requests need a valid government ID, a barangay certificate of indigency, and documents specific to the request — for example, a medical abstract and prescription for medical assistance, or a death certificate for burial assistance."),
            Faq(2,
                "How long does an assistance request take?",
                "Simple requests are usually assessed within a few working days. Requests that need further verification or fund availability may take longer; you can follow up at the office or track your request online with a citizen account."),
            Faq(3,
                "What can I do with a citizen account on this website?",
                "A citizen account lets you view announcements, see your beneficiary record once it is linked by MSWD staff, and monitor the status of your assistance requests without visiting the office."),
            Faq(4,
                "Why does my account say it is not yet linked to a beneficiary record?",
                "For your protection, MSWD staff link citizen accounts to beneficiary records after verifying your identity at the office. Visit the MSWD office once with a valid ID to have your account linked."),
            Faq(5,
                "How is my personal information protected?",
                "The system complies with the Data Privacy Act of 2012 (RA 10173). Your information is used only for social welfare service delivery, is accessible only to authorized personnel, and every access is recorded in an audit trail."),
        };

        db.ContentItems.AddRange(seeded);

        static ContentItem Announcement(string title, string body, DateTime publishedOn) => new()
        {
            Type = ContentType.Announcement,
            Status = ContentStatus.Published,
            Title = title,
            Body = body,
            PublishAt = publishedOn,
            CreatedByName = "System",
        };

        static ContentItem News(string title, string body, DateTime publishedOn) => new()
        {
            Type = ContentType.News,
            Status = ContentStatus.Published,
            Title = title,
            Body = body,
            PublishAt = publishedOn,
            CreatedByName = "System",
        };

        static ContentItem Faq(int order, string question, string answer) => new()
        {
            Type = ContentType.Faq,
            Status = ContentStatus.Published,
            Title = question,
            Body = answer,
            SortOrder = order,
            PublishAt = new DateTime(2026, 6, 30, 0, 0, 0, DateTimeKind.Utc),
            CreatedByName = "System",
        };
    }
}
