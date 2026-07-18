using MSWDPASystem.Server.Features.Reports.GetSummary;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace MSWDPASystem.Server.Features.Reports.Pdf;

/// <summary>QuestPDF document builders for the MSWD Caba reporting module.</summary>
public static class ReportPdfBuilder
{
    private static readonly Color Primary = Color.FromHex("#0038a8");
    private static readonly Color PrimaryDark = Color.FromHex("#081a45");
    private static readonly Color Accent = Color.FromHex("#ce1126");
    private static readonly Color HeaderBg = Color.FromHex("#eef4ff");
    private static readonly Color Border = Color.FromHex("#d1d5db");
    private static readonly Color Muted = Color.FromHex("#6b7280");

    public static byte[] BuildSummary(ReportSummaryDto s)
    {
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(32);
                page.DefaultTextStyle(x => x.FontSize(9).FontColor(Colors.Black));

                Header(page, $"{s.Period} Statistical Report", s.PeriodLabel, FilterLine(s.Barangay, s.ProgramName));

                page.Content().PaddingVertical(10).Column(col =>
                {
                    col.Spacing(14);

                    // Top-line figures
                    col.Item().Row(row =>
                    {
                        row.Spacing(10);
                        row.RelativeItem().Element(c => MetricBox(c, "New Registrations", s.TotalRegistrations.ToString()));
                        row.RelativeItem().Element(c => MetricBox(c, "Assistance Requests", s.TotalAssistanceRequests.ToString()));
                        row.RelativeItem().Element(c => MetricBox(c, "Amount Released", $"PHP {s.TotalAmountReleased:N2}"));
                    });

                    col.Item().Text("Beneficiary Demographics").FontSize(12).Bold().FontColor(PrimaryDark);
                    col.Item().Row(row =>
                    {
                        row.Spacing(12);
                        row.RelativeItem().Element(c => BreakdownTable(c, "By Sex", "Count", s.RegistrationsBySex));
                        row.RelativeItem().Element(c => BreakdownTable(c, "By Age Group", "Count", s.RegistrationsByAgeGroup));
                    });
                    col.Item().Row(row =>
                    {
                        row.Spacing(12);
                        row.RelativeItem().Element(c => BreakdownTable(c, "By Barangay (Top 10)", "Count", s.RegistrationsByBarangay));
                        row.RelativeItem().Element(c => BreakdownTable(c, "By Welfare Program", "Count", s.RegistrationsByProgram));
                    });

                    col.Item().PaddingTop(4).Text("Assistance Distribution").FontSize(12).Bold().FontColor(PrimaryDark);
                    col.Item().Element(c => BreakdownTable(c, "By Status", "Count", s.AssistanceByStatus));
                    col.Item().Element(c => AssistanceTypeTable(c, s.AssistanceByType));
                });

                Footer(page);
            });
        }).GeneratePdf();
    }

    public static byte[] BuildBeneficiaryList(IReadOnlyList<BeneficiaryRow> rows, string? barangay, string? status)
    {
        var filters = new List<string>();
        if (!string.IsNullOrWhiteSpace(barangay)) filters.Add($"Barangay: {barangay}");
        if (!string.IsNullOrWhiteSpace(status)) filters.Add($"Status: {status}");

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(28);
                page.DefaultTextStyle(x => x.FontSize(8).FontColor(Colors.Black));

                Header(page, "Beneficiaries List", $"{rows.Count} record(s)",
                    filters.Count > 0 ? string.Join("   •   ", filters) : "All records");

                page.Content().PaddingVertical(8).Table(table =>
                {
                    table.ColumnsDefinition(c =>
                    {
                        c.ConstantColumn(70);   // client no
                        c.RelativeColumn(2);     // name
                        c.ConstantColumn(28);    // sex
                        c.ConstantColumn(28);    // age
                        c.RelativeColumn(1.4f);  // barangay
                        c.RelativeColumn(1.4f);  // programs
                        c.ConstantColumn(52);    // status
                        c.ConstantColumn(58);    // registered
                    });

                    table.Header(h =>
                    {
                        HeaderCell(h, "Client No.");
                        HeaderCell(h, "Name");
                        HeaderCell(h, "Sex");
                        HeaderCell(h, "Age");
                        HeaderCell(h, "Barangay");
                        HeaderCell(h, "Programs");
                        HeaderCell(h, "Status");
                        HeaderCell(h, "Registered");
                    });

                    foreach (var r in rows)
                    {
                        BodyCell(table, r.ClientNumber);
                        BodyCell(table, r.FullName);
                        BodyCell(table, r.Sex);
                        BodyCell(table, r.Age.ToString());
                        BodyCell(table, r.Barangay);
                        BodyCell(table, r.Programs);
                        BodyCell(table, r.Status);
                        BodyCell(table, r.RegisteredOn);
                    }
                });

                Footer(page);
            });
        }).GeneratePdf();
    }

    public static byte[] BuildAssistanceList(IReadOnlyList<AssistanceRow> rows, string? status, DateTime? from, DateTime? to)
    {
        var filters = new List<string>();
        if (!string.IsNullOrWhiteSpace(status)) filters.Add($"Status: {status}");
        if (from.HasValue) filters.Add($"From: {from:yyyy-MM-dd}");
        if (to.HasValue) filters.Add($"To: {to:yyyy-MM-dd}");

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(28);
                page.DefaultTextStyle(x => x.FontSize(8).FontColor(Colors.Black));

                Header(page, "Assistance Requests", $"{rows.Count} record(s)",
                    filters.Count > 0 ? string.Join("   •   ", filters) : "All records");

                page.Content().PaddingVertical(8).Table(table =>
                {
                    table.ColumnsDefinition(c =>
                    {
                        c.ConstantColumn(78);    // request no
                        c.RelativeColumn(2);     // beneficiary
                        c.RelativeColumn(1.5f);  // type
                        c.RelativeColumn(1.5f);  // program
                        c.ConstantColumn(60);    // amount
                        c.ConstantColumn(56);    // status
                        c.ConstantColumn(58);    // submitted
                        c.ConstantColumn(58);    // released
                    });

                    table.Header(h =>
                    {
                        HeaderCell(h, "Request No.");
                        HeaderCell(h, "Beneficiary");
                        HeaderCell(h, "Type");
                        HeaderCell(h, "Program");
                        HeaderCell(h, "Amount");
                        HeaderCell(h, "Status");
                        HeaderCell(h, "Submitted");
                        HeaderCell(h, "Released");
                    });

                    foreach (var r in rows)
                    {
                        BodyCell(table, r.RequestNumber);
                        BodyCell(table, r.BeneficiaryName);
                        BodyCell(table, r.AssistanceType);
                        BodyCell(table, r.Program);
                        BodyCell(table, r.Amount);
                        BodyCell(table, r.Status);
                        BodyCell(table, r.SubmittedOn);
                        BodyCell(table, r.ReleasedOn);
                    }
                });

                Footer(page);
            });
        }).GeneratePdf();
    }

    // ---- shared composition helpers ----

    private static string FilterLine(string? barangay, string? program)
    {
        var parts = new List<string>();
        if (!string.IsNullOrWhiteSpace(barangay)) parts.Add($"Barangay: {barangay}");
        if (!string.IsNullOrWhiteSpace(program)) parts.Add($"Program: {program}");
        return parts.Count > 0 ? string.Join("   •   ", parts) : "All barangays • All programs";
    }

    private static void Header(PageDescriptor page, string title, string subtitle, string filters)
    {
        page.Header().Column(col =>
        {
            col.Item().Row(row =>
            {
                row.RelativeItem().Column(c =>
                {
                    c.Item().Text("MSWD Caba, La Union").FontSize(13).Bold().FontColor(Primary);
                    c.Item().Text("Municipal Social Welfare and Development Office").FontSize(8).FontColor(Muted);
                });
                row.ConstantItem(180).AlignRight().Column(c =>
                {
                    c.Item().Text(title).FontSize(12).Bold().FontColor(PrimaryDark);
                    c.Item().Text(subtitle).FontSize(9).FontColor(Muted);
                });
            });
            col.Item().PaddingTop(6).LineHorizontal(1.5f).LineColor(Primary);
            col.Item().PaddingTop(4).Text(filters).FontSize(8).Italic().FontColor(Muted);
        });
    }

    private static void Footer(PageDescriptor page)
    {
        page.Footer().PaddingTop(6).Row(row =>
        {
            row.RelativeItem().Text($"Generated {DateTime.Now:yyyy-MM-dd HH:mm}").FontSize(7).FontColor(Muted);
            row.RelativeItem().AlignRight().Text(x =>
            {
                x.DefaultTextStyle(t => t.FontSize(7).FontColor(Muted));
                x.Span("Page ");
                x.CurrentPageNumber();
                x.Span(" of ");
                x.TotalPages();
            });
        });
    }

    private static void MetricBox(IContainer container, string label, string value)
    {
        container.Border(1).BorderColor(Border).Background(HeaderBg).Padding(10).Column(col =>
        {
            col.Item().Text(label).FontSize(8).FontColor(Muted);
            col.Item().Text(value).FontSize(15).Bold().FontColor(PrimaryDark);
        });
    }

    private static void BreakdownTable(IContainer container, string title, string valueHeader, List<LabelCount> data)
    {
        container.Border(1).BorderColor(Border).Column(col =>
        {
            col.Item().Background(Primary).Padding(5).Text(title).FontColor(Colors.White).Bold().FontSize(9);
            if (data.Count == 0)
            {
                col.Item().Padding(6).Text("No data for this period.").FontColor(Muted).Italic();
                return;
            }
            col.Item().Table(table =>
            {
                table.ColumnsDefinition(c => { c.RelativeColumn(); c.ConstantColumn(50); });
                foreach (var d in data)
                {
                    table.Cell().BorderBottom(0.5f).BorderColor(Border).PaddingVertical(3).PaddingHorizontal(5).Text(d.Label);
                    table.Cell().BorderBottom(0.5f).BorderColor(Border).PaddingVertical(3).PaddingHorizontal(5).AlignRight().Text(d.Count.ToString());
                }
            });
        });
    }

    private static void AssistanceTypeTable(IContainer container, List<LabelAmount> data)
    {
        container.Border(1).BorderColor(Border).Column(col =>
        {
            col.Item().Background(Primary).Padding(5).Text("By Assistance Type").FontColor(Colors.White).Bold().FontSize(9);
            if (data.Count == 0)
            {
                col.Item().Padding(6).Text("No data for this period.").FontColor(Muted).Italic();
                return;
            }
            col.Item().Table(table =>
            {
                table.ColumnsDefinition(c => { c.RelativeColumn(); c.ConstantColumn(60); c.ConstantColumn(90); });
                table.Header(h =>
                {
                    h.Cell().Background(HeaderBg).PaddingVertical(3).PaddingHorizontal(5).Text("Type").Bold();
                    h.Cell().Background(HeaderBg).PaddingVertical(3).PaddingHorizontal(5).AlignRight().Text("Count").Bold();
                    h.Cell().Background(HeaderBg).PaddingVertical(3).PaddingHorizontal(5).AlignRight().Text("Released (PHP)").Bold();
                });
                foreach (var d in data)
                {
                    table.Cell().BorderBottom(0.5f).BorderColor(Border).PaddingVertical(3).PaddingHorizontal(5).Text(d.Label);
                    table.Cell().BorderBottom(0.5f).BorderColor(Border).PaddingVertical(3).PaddingHorizontal(5).AlignRight().Text(d.Count.ToString());
                    table.Cell().BorderBottom(0.5f).BorderColor(Border).PaddingVertical(3).PaddingHorizontal(5).AlignRight().Text(d.Amount.ToString("N2"));
                }
            });
        });
    }

    private static void HeaderCell(TableCellDescriptor h, string text)
    {
        h.Cell().Background(Primary).Padding(4).Text(text).FontColor(Colors.White).Bold();
    }

    private static void BodyCell(TableDescriptor table, string text)
    {
        table.Cell().BorderBottom(0.5f).BorderColor(Border).PaddingVertical(3).PaddingHorizontal(4).Text(text ?? "");
    }
}

public record BeneficiaryRow(
    string ClientNumber, string FullName, string Sex, int Age,
    string Barangay, string Programs, string Status, string RegisteredOn);

public record AssistanceRow(
    string RequestNumber, string BeneficiaryName, string AssistanceType, string Program,
    string Amount, string Status, string SubmittedOn, string ReleasedOn);
