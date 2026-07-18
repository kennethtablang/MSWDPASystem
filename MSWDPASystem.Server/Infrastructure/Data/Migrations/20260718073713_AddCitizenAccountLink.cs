using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MSWDPASystem.Server.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCitizenAccountLink : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "LinkedBeneficiaryId",
                table: "AspNetUsers",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_LinkedBeneficiaryId",
                table: "AspNetUsers",
                column: "LinkedBeneficiaryId");

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUsers_Beneficiaries_LinkedBeneficiaryId",
                table: "AspNetUsers",
                column: "LinkedBeneficiaryId",
                principalTable: "Beneficiaries",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_Beneficiaries_LinkedBeneficiaryId",
                table: "AspNetUsers");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_LinkedBeneficiaryId",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "LinkedBeneficiaryId",
                table: "AspNetUsers");
        }
    }
}
