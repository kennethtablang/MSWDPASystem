using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MSWDPASystem.Server.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddRelationshipsAndAssistedService : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AssistedReason",
                table: "AssistanceRequests",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsAssisted",
                table: "AssistanceRequests",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ReleasedToName",
                table: "AssistanceRequests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReleasedToRelation",
                table: "AssistanceRequests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "AssistedTransactions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BeneficiaryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AssistedByUserId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AssistedByUserName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ServiceType = table.Column<int>(type: "int", nullable: false),
                    Reason = table.Column<int>(type: "int", nullable: false),
                    ReasonNotes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BeneficiaryPresent = table.Column<bool>(type: "bit", nullable: false),
                    RepresentativeName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresentativeRelation = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresentativeBeneficiaryId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    RepresentativeIdType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepresentativeIdNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AuthorizationDocumentPath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Acknowledged = table.Column<bool>(type: "bit", nullable: false),
                    AcknowledgementSignaturePath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RelatedEntityType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RelatedEntityId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AssistedTransactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AssistedTransactions_Beneficiaries_BeneficiaryId",
                        column: x => x.BeneficiaryId,
                        principalTable: "Beneficiaries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AssistedTransactions_Beneficiaries_RepresentativeBeneficiaryId",
                        column: x => x.RepresentativeBeneficiaryId,
                        principalTable: "Beneficiaries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "BeneficiaryRelationships",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BeneficiaryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RelativeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    IsInferred = table.Column<bool>(type: "bit", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedByUserId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BeneficiaryRelationships", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BeneficiaryRelationships_Beneficiaries_BeneficiaryId",
                        column: x => x.BeneficiaryId,
                        principalTable: "Beneficiaries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BeneficiaryRelationships_Beneficiaries_RelativeId",
                        column: x => x.RelativeId,
                        principalTable: "Beneficiaries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AssistedTransactions_BeneficiaryId",
                table: "AssistedTransactions",
                column: "BeneficiaryId");

            migrationBuilder.CreateIndex(
                name: "IX_AssistedTransactions_CreatedAt",
                table: "AssistedTransactions",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_AssistedTransactions_RepresentativeBeneficiaryId",
                table: "AssistedTransactions",
                column: "RepresentativeBeneficiaryId");

            migrationBuilder.CreateIndex(
                name: "IX_BeneficiaryRelationships_BeneficiaryId_RelativeId",
                table: "BeneficiaryRelationships",
                columns: new[] { "BeneficiaryId", "RelativeId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BeneficiaryRelationships_RelativeId",
                table: "BeneficiaryRelationships",
                column: "RelativeId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AssistedTransactions");

            migrationBuilder.DropTable(
                name: "BeneficiaryRelationships");

            migrationBuilder.DropColumn(
                name: "AssistedReason",
                table: "AssistanceRequests");

            migrationBuilder.DropColumn(
                name: "IsAssisted",
                table: "AssistanceRequests");

            migrationBuilder.DropColumn(
                name: "ReleasedToName",
                table: "AssistanceRequests");

            migrationBuilder.DropColumn(
                name: "ReleasedToRelation",
                table: "AssistanceRequests");
        }
    }
}
