using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MSWDPASystem.Server.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddModuleAccess : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ModuleAccess",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ModuleAccess",
                table: "AspNetUsers");
        }
    }
}
