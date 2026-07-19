using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using MSWDPASystem.Server.Common.Interfaces;
using MSWDPASystem.Server.Domain.Entities;
using MSWDPASystem.Server.Domain.Enums;
using MSWDPASystem.Server.Infrastructure.Data;

namespace MSWDPASystem.Server.Tests;

/// <summary>
/// A disposable database for one test.
///
/// SQLite in-memory rather than the EF in-memory provider: the code under test uses
/// ExecuteUpdateAsync and explicit transactions, which are relational-only APIs the
/// in-memory provider silently cannot honour. SQLite also enforces foreign keys, so
/// the delete guards are tested against real constraint behaviour rather than a
/// permissive fake.
/// </summary>
public sealed class TestDb : IDisposable
{
    private readonly SqliteConnection _connection;
    public ApplicationDbContext Context { get; }

    public TestDb()
    {
        // The connection must stay open for the lifetime of the test — closing it
        // destroys the in-memory database.
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite(_connection)
            .Options;

        Context = new ApplicationDbContext(options);
        Context.Database.EnsureCreated();
    }

    public void Dispose()
    {
        Context.Dispose();
        _connection.Dispose();
    }

    // ---- Builders. Defaults are valid so a test only states what it cares about. ----

    public Beneficiary AddBeneficiary(
        string firstName = "Juan",
        string lastName = "Dela Cruz",
        string? middleName = null,
        DateOnly? dateOfBirth = null,
        string barangay = "Poblacion Norte",
        string address = "123 Rizal St",
        string? contactNumber = null,
        Guid? householdId = null,
        BeneficiaryStatus status = BeneficiaryStatus.Active,
        string? clientNumber = null)
    {
        var beneficiary = new Beneficiary
        {
            ClientNumber = clientNumber ?? $"CABA-2026-{Random.Shared.Next(1000, 9999)}",
            FirstName = firstName,
            MiddleName = middleName,
            LastName = lastName,
            DateOfBirth = dateOfBirth ?? new DateOnly(1960, 5, 12),
            Barangay = barangay,
            Address = address,
            ContactNumber = contactNumber,
            HouseholdId = householdId,
            Status = status,
        };
        Context.Beneficiaries.Add(beneficiary);
        Context.SaveChanges();
        return beneficiary;
    }

    public void AddRelationship(Guid fromId, Guid toId, RelationshipType type, bool bothDirections = true)
    {
        Context.BeneficiaryRelationships.Add(new BeneficiaryRelationship
        {
            BeneficiaryId = fromId,
            RelativeId = toId,
            Type = type,
        });

        if (bothDirections)
        {
            Context.BeneficiaryRelationships.Add(new BeneficiaryRelationship
            {
                BeneficiaryId = toId,
                RelativeId = fromId,
                Type = Inverse(type),
            });
        }
        Context.SaveChanges();
    }

    /// <summary>
    /// Mirrors RelationshipsController.Invert. Duplicated deliberately: if the
    /// controller's mapping changes, these tests should keep asserting the
    /// behaviour they were written for rather than silently following it.
    /// </summary>
    private static RelationshipType Inverse(RelationshipType type) => type switch
    {
        RelationshipType.Parent => RelationshipType.Child,
        RelationshipType.Child => RelationshipType.Parent,
        RelationshipType.Grandparent => RelationshipType.Grandchild,
        RelationshipType.Grandchild => RelationshipType.Grandparent,
        RelationshipType.AuntUncle => RelationshipType.NieceNephew,
        RelationshipType.NieceNephew => RelationshipType.AuntUncle,
        RelationshipType.ParentInLaw => RelationshipType.ChildInLaw,
        RelationshipType.ChildInLaw => RelationshipType.ParentInLaw,
        RelationshipType.Guardian => RelationshipType.Ward,
        RelationshipType.Ward => RelationshipType.Guardian,
        _ => type,
    };

    public Household AddHousehold(
        string barangay = "Poblacion Norte",
        string address = "123 Rizal St",
        string? head = null)
    {
        var household = new Household
        {
            HouseholdNumber = $"HH-2026-{Random.Shared.Next(1000, 9999)}",
            Barangay = barangay,
            Address = address,
            HeadOfHouseholdName = head,
        };
        Context.Households.Add(household);
        Context.SaveChanges();
        return household;
    }

    public AssistanceType AddAssistanceType(string name = "Medical Assistance")
    {
        var type = new AssistanceType { Name = name };
        Context.AssistanceTypes.Add(type);
        Context.SaveChanges();
        return type;
    }

    public WelfareProgram AddProgram(string name = "Indigent Family Assistance", string code = "INDIGENT")
    {
        var program = new WelfareProgram { Name = name, Code = code };
        Context.WelfarePrograms.Add(program);
        Context.SaveChanges();
        return program;
    }

    public AssistanceRequest AddRequest(
        Guid beneficiaryId,
        Guid assistanceTypeId,
        decimal? amount = 5000m,
        AssistanceRequestStatus status = AssistanceRequestStatus.Submitted,
        DateTime? releasedAt = null)
    {
        var request = new AssistanceRequest
        {
            RequestNumber = $"REQ-2026-{Random.Shared.Next(10000, 99999)}",
            BeneficiaryId = beneficiaryId,
            AssistanceTypeId = assistanceTypeId,
            Amount = amount,
            Status = status,
            ReleasedAt = releasedAt,
        };
        Context.AssistanceRequests.Add(request);
        Context.SaveChanges();
        return request;
    }
}

/// <summary>Stand-in for the signed-in user.</summary>
public class FakeCurrentUser(
    string? userId = "test-user",
    string? userName = "testuser",
    string? role = "MSWDStaff") : ICurrentUserService
{
    public string? UserId { get; } = userId;
    public string? UserName { get; } = userName;
    public string? Role { get; } = role;
    public bool IsAuthenticated => UserId is not null;
}
