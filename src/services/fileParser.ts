import * as XLSX from "xlsx";

export interface ParsedSheet {
  name: string;
  headers: string[];
  rows: Record<string, string | number | null>[];
}

/**
 * Parse an Excel file (ArrayBuffer) into structured JSON.
 * Uses the first non-empty row as headers.
 */
export function parseExcelFile(buffer: ArrayBuffer): ParsedSheet[] {
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });

  return workbook.SheetNames.map((name) => {
    const sheet = workbook.Sheets[name];
    const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: null,
      raw: false,
    });

    if (jsonData.length === 0) {
      return { name, headers: [], rows: [] };
    }

    const headers = Object.keys(jsonData[0]);

    const rows: Record<string, string | number | null>[] = jsonData.map((row) => {
      const cleaned: Record<string, string | number | null> = {};
      for (const key of headers) {
        const val = row[key];
        if (val === null || val === undefined) {
          cleaned[key] = null;
        } else if (typeof val === "number") {
          cleaned[key] = val;
        } else {
          cleaned[key] = String(val);
        }
      }
      return cleaned;
    });

    return { name, headers, rows };
  });
}
