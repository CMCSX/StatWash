import * as XLSX from "xlsx";

type Row = Record<string, unknown>;

/**
 * Export cleaned data as an Excel file (.xlsx).
 * Triggers a browser download immediately.
 */
export function exportToExcel(
  data: Row[],
  columns: string[],
  fileName: string
): void {
  const ws = XLSX.utils.json_to_sheet(data, { header: columns });

  // Auto-size columns
  const colWidths = columns.map((col) => {
    let max = col.length;
    for (const row of data) {
      const val = row[col];
      const len = val !== null && val !== undefined ? String(val).length : 0;
      if (len > max) max = len;
    }
    return { wch: Math.min(max + 2, 50) };
  });
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Cleaned Data");

  // Generate download
  const cleanName = fileName.replace(/\.[^.]+$/, "");
  XLSX.writeFile(wb, `${cleanName}_cleaned.xlsx`);
}

/**
 * Export cleaned data as CSV.
 * Triggers a browser download immediately.
 */
export function exportToCSV(
  data: Row[],
  columns: string[],
  fileName: string
): void {
  const ws = XLSX.utils.json_to_sheet(data, { header: columns });
  const csv = XLSX.utils.sheet_to_csv(ws);

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName.replace(/\.[^.]+$/, "")}_cleaned.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
