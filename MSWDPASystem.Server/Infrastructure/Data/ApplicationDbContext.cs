using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Domain.Entities;

namespace MSWDPASystem.Server.Infrastructure.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : IdentityDbContext<ApplicationUser>(options)
{
    public DbSet<Household> Households => Set<Household>();
    public DbSet<Beneficiary> Beneficiaries => Set<Beneficiary>();
    public DbSet<WelfareProgram> WelfarePrograms => Set<WelfareProgram>();
    public DbSet<BeneficiaryProgram> BeneficiaryPrograms => Set<BeneficiaryProgram>();
    public DbSet<AssistanceType> AssistanceTypes => Set<AssistanceType>();
    public DbSet<AssistanceRequest> AssistanceRequests => Set<AssistanceRequest>();
    public DbSet<AssistanceRequestStatusHistory> AssistanceRequestStatusHistories => Set<AssistanceRequestStatusHistory>();
    public DbSet<Document> Documents => Set<Document>();
    public DbSet<QrScanLog> QrScanLogs => Set<QrScanLog>();
    public DbSet<DuplicateFlag> DuplicateFlags => Set<DuplicateFlag>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<Message> Messages => Set<Message>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<BeneficiaryProgram>(entity =>
        {
            entity.HasKey(bp => new { bp.BeneficiaryId, bp.WelfareProgramId });

            entity.HasOne(bp => bp.Beneficiary)
                .WithMany(b => b.Programs)
                .HasForeignKey(bp => bp.BeneficiaryId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(bp => bp.WelfareProgram)
                .WithMany(wp => wp.Enrollments)
                .HasForeignKey(bp => bp.WelfareProgramId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<Beneficiary>(entity =>
        {
            entity.HasIndex(b => b.ClientNumber).IsUnique();
            entity.Property(b => b.MonthlyIncome).HasPrecision(18, 2);

            entity.HasOne(b => b.Household)
                .WithMany(h => h.Members)
                .HasForeignKey(b => b.HouseholdId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        builder.Entity<AssistanceRequest>(entity =>
        {
            entity.HasIndex(ar => ar.RequestNumber).IsUnique();
            entity.Property(ar => ar.Amount).HasPrecision(18, 2);

            entity.HasOne(ar => ar.Beneficiary)
                .WithMany(b => b.AssistanceRequests)
                .HasForeignKey(ar => ar.BeneficiaryId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(ar => ar.AssistanceType)
                .WithMany(at => at.AssistanceRequests)
                .HasForeignKey(ar => ar.AssistanceTypeId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(ar => ar.WelfareProgram)
                .WithMany(wp => wp.AssistanceRequests)
                .HasForeignKey(ar => ar.WelfareProgramId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        builder.Entity<AssistanceRequestStatusHistory>(entity =>
        {
            entity.HasOne(h => h.AssistanceRequest)
                .WithMany(ar => ar.StatusHistory)
                .HasForeignKey(h => h.AssistanceRequestId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<Document>(entity =>
        {
            entity.HasOne(d => d.Beneficiary)
                .WithMany(b => b.Documents)
                .HasForeignKey(d => d.BeneficiaryId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<QrScanLog>(entity =>
        {
            entity.HasOne(q => q.Beneficiary)
                .WithMany(b => b.QrScanLogs)
                .HasForeignKey(q => q.BeneficiaryId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<DuplicateFlag>(entity =>
        {
            entity.HasOne(df => df.OriginalBeneficiary)
                .WithMany(b => b.DuplicateFlagsAsOriginal)
                .HasForeignKey(df => df.OriginalBeneficiaryId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(df => df.DuplicateBeneficiary)
                .WithMany(b => b.DuplicateFlagsAsDuplicate)
                .HasForeignKey(df => df.DuplicateBeneficiaryId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<Notification>(entity =>
        {
            entity.HasOne(n => n.RecipientUser)
                .WithMany()
                .HasForeignKey(n => n.RecipientUserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<Message>(entity =>
        {
            entity.HasOne(m => m.Sender)
                .WithMany()
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(m => m.Recipient)
                .WithMany()
                .HasForeignKey(m => m.RecipientId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Modified)
                entry.Entity.UpdatedAt = DateTime.UtcNow;
        }
        return await base.SaveChangesAsync(cancellationToken);
    }
}
