import type {
  FileType,
  FileTypeConfig,
  CleaningResult,
  CleaningIssue,
  TransformationLog,
  CleaningSummary,
  TextCasing,
} from "@/types";
import FILE_TYPE_CONFIGS, { getAllFileTypes } from "@/config/fileTypes";

import type { StoredTemplate } from "@/services/templateStore";

type Row = Record<string, unknown>;

/* ─────────────────────────────── Detection ─────────────────────────────── */

/**
 * Detect the file type from the raw headers.
 * Scores each config by how many of its signature words appear in the headers.
 */
export function detectFileType(headers: string[]): FileType | null {
  const lowerHeaders = headers.map((h) => h.toLowerCase().trim());
  const headerString = lowerHeaders.join(" ");

  let bestType: FileType | null = null;
  let bestScore = 0;

  for (const config of getAllFileTypes()) {
    let score = 0;
    for (const sig of config.headerSignatures) {
      if (headerString.includes(sig)) score++;
    }
    // Also score by how many column-name-map keys match real headers
    for (const mapKey of Object.keys(config.columnNameMap)) {
      if (lowerHeaders.includes(mapKey)) score += 2;
    }
    if (score > bestScore) {
      bestScore = score;
      bestType = config.id;
    }
  }

  return bestScore >= 2 ? bestType : null;
}

/* ─────────────────────────────── Helpers ─────────────────────────────── */

function toTitleCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/(?:^|\s|[-/])\S/g, (c) => c.toUpperCase());
}

function applyCasing(value: string, casing: TextCasing): string {
  switch (casing) {
    case "upper":
      return value.toUpperCase();
    case "lower":
      return value.toLowerCase();
    case "title":
      return toTitleCase(value);
    case "none":
      return value;
  }
}

/** Try to parse a value as a date and return YYYY-MM-DD or null */
function normalizeDate(value: string | number | null): string | null {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  if (!str) return null;

  // Try native Date parse
  const d = new Date(str);
  if (!isNaN(d.getTime()) && d.getFullYear() > 1900 && d.getFullYear() < 2100) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  // Try DD/MM/YYYY or DD-MM-YYYY
  const parts = str.split(/[/\-\.]/);
  if (parts.length === 3) {
    const [a, b, c] = parts.map(Number);
    // Guess DD/MM/YYYY
    if (c > 1900 && b >= 1 && b <= 12 && a >= 1 && a <= 31) {
      return `${c}-${String(b).padStart(2, "0")}-${String(a).padStart(2, "0")}`;
    }
    // Guess MM/DD/YYYY
    if (c > 1900 && a >= 1 && a <= 12 && b >= 1 && b <= 31) {
      return `${c}-${String(a).padStart(2, "0")}-${String(b).padStart(2, "0")}`;
    }
    // YYYY/MM/DD
    if (a > 1900 && b >= 1 && b <= 12 && c >= 1 && c <= 31) {
      return `${a}-${String(b).padStart(2, "0")}-${String(c).padStart(2, "0")}`;
    }
  }

  return null;
}

function isNumericString(s: string): boolean {
  return /^-?\d+(\.\d+)?$/.test(s.replace(/,/g, "").trim());
}

function buildDuplicateKey(row: Row, fields: string[]): string {
  return fields.map((f) => String(row[f] ?? "").toLowerCase().trim()).join("|");
}

/* ──────────────────────────── Main Cleaning ──────────────────────────── */

export function cleanData(
  rawRows: Row[],
  rawHeaders: string[],
  fileType: FileType | null,
  template?: StoredTemplate | null
): CleaningResult {
  const config: FileTypeConfig | null = fileType ? FILE_TYPE_CONFIGS[fileType] : null;
  const issues: CleaningIssue[] = [];
  const transformations: TransformationLog[] = [];

  let rows = rawRows.map((r) => ({ ...r })); // shallow clone

  /* ── 1. Normalize column names ──────────────────────────────────────── */
  const normalizedColumns: string[] = [];
  const colMap = config?.columnNameMap ?? {};

  const renameMap = new Map<string, string>();
  let renameCount = 0;

  for (const header of rawHeaders) {
    const lower = header.toLowerCase().trim();
    const canonical = colMap[lower];
    if (canonical && canonical !== header) {
      renameMap.set(header, canonical);
      renameCount++;
      normalizedColumns.push(canonical);
    } else {
      // Even without config, trim & title-case the header
      const trimmed = header.trim();
      if (trimmed !== header) {
        renameMap.set(header, trimmed);
        renameCount++;
      }
      normalizedColumns.push(canonical ?? trimmed);
    }
  }

  if (renameCount > 0) {
    transformations.push({
      type: "normalize_column",
      description: `Standardized ${renameCount} column name(s) to canonical format`,
      count: renameCount,
    });
    rows = rows.map((row) => {
      const newRow: Row = {};
      for (const [oldKey, val] of Object.entries(row)) {
        const newKey = renameMap.get(oldKey) ?? oldKey;
        newRow[newKey] = val;
      }
      return newRow;
    });
  }

  /* ── 2. Trim whitespace ─────────────────────────────────────────────── */
  let trimCount = 0;
  rows = rows.map((row) => {
    const newRow: Row = {};
    for (const [key, val] of Object.entries(row)) {
      if (typeof val === "string") {
        const trimmed = val.trim();
        if (trimmed !== val) trimCount++;
        newRow[key] = trimmed;
      } else {
        newRow[key] = val;
      }
    }
    return newRow;
  });
  if (trimCount > 0) {
    transformations.push({
      type: "trim_whitespace",
      description: `Trimmed whitespace from ${trimCount} cell(s)`,
      count: trimCount,
    });
  }

  /* ── 3. Text casing ─────────────────────────────────────────────────── */
  if (config) {
    let casingCount = 0;
    const casingRules = config.textCasingRules;
    rows = rows.map((row) => {
      const newRow: Row = { ...row };
      for (const [col, casing] of Object.entries(casingRules)) {
        const val = newRow[col];
        if (typeof val === "string" && val.length > 0) {
          const fixed = applyCasing(val, casing);
          if (fixed !== val) {
            casingCount++;
            newRow[col] = fixed;
          }
        }
      }
      return newRow;
    });
    if (casingCount > 0) {
      transformations.push({
        type: "fix_casing",
        description: `Standardized text casing in ${casingCount} cell(s)`,
        count: casingCount,
      });
    }
  }

  /* ── 4. Date normalization ──────────────────────────────────────────── */
  if (config) {
    let dateFixCount = 0;
    const dateCols = config.dateColumns;
    rows = rows.map((row, rowIdx) => {
      const newRow: Row = { ...row };
      for (const col of dateCols) {
        const val = newRow[col];
        if (val === null || val === undefined || String(val).trim() === "") continue;
        const normalized = normalizeDate(val as string | number | null);
        if (normalized) {
          if (normalized !== String(val).trim()) {
            dateFixCount++;
          }
          newRow[col] = normalized;
        } else {
          issues.push({
            row: rowIdx,
            column: col,
            type: "invalid_format",
            severity: "error",
            message: `Invalid date format: "${val}"`,
            originalValue: val as string | number | null,
          });
        }
      }
      return newRow;
    });
    if (dateFixCount > 0) {
      transformations.push({
        type: "fix_date",
        description: `Normalized ${dateFixCount} date value(s) to YYYY-MM-DD`,
        count: dateFixCount,
      });
    }
  }

  /* ── 5. Numeric validation ──────────────────────────────────────────── */
  if (config) {
    let numFixCount = 0;
    const numCols = config.numericColumns;
    rows = rows.map((row, rowIdx) => {
      const newRow: Row = { ...row };
      for (const col of numCols) {
        const val = newRow[col];
        if (val === null || val === undefined || String(val).trim() === "") continue;
        if (typeof val === "number") continue;
        const stripped = String(val).replace(/,/g, "").trim();
        if (isNumericString(stripped)) {
          newRow[col] = parseFloat(stripped);
          numFixCount++;
        } else {
          issues.push({
            row: rowIdx,
            column: col,
            type: "type_mismatch",
            severity: "error",
            message: `Expected numeric value, got: "${val}"`,
            originalValue: val as string | number | null,
          });
        }
      }
      return newRow;
    });
    if (numFixCount > 0) {
      transformations.push({
        type: "convert_type",
        description: `Converted ${numFixCount} value(s) to numeric format`,
        count: numFixCount,
      });
    }
  }

  /* ── 6. Required field validation ───────────────────────────────────── */
  if (config) {
    for (let i = 0; i < rows.length; i++) {
      for (const field of config.requiredFields) {
        const val = rows[i][field];
        if (val === null || val === undefined || String(val).trim() === "") {
          issues.push({
            row: i,
            column: field,
            type: "missing",
            severity: "error",
            message: `Required field "${field}" is empty`,
            originalValue: (val as string | number | null) ?? null,
          });
        }
      }
    }
  }

  /* ── 7. Duplicate detection ─────────────────────────────────────────── */
  const keyFields = config?.requiredFields ?? normalizedColumns.slice(0, 3);
  const seen = new Map<string, number>();
  const duplicateIndices = new Set<number>();

  for (let i = 0; i < rows.length; i++) {
    const key = buildDuplicateKey(rows[i], keyFields);
    if (seen.has(key)) {
      duplicateIndices.add(i);
      issues.push({
        row: i,
        column: keyFields[0],
        type: "duplicate",
        severity: "warning",
        message: `Duplicate of row ${(seen.get(key) ?? 0) + 1}`,
        originalValue: null,
      });
    } else {
      seen.set(key, i);
    }
  }

  // Remove duplicates from cleaned data
  let cleanedRows = rows.filter((_, i) => !duplicateIndices.has(i));

  if (duplicateIndices.size > 0) {
    transformations.push({
      type: "remove_duplicate",
      description: `Found ${duplicateIndices.size} duplicate row(s) — removed from cleaned output`,
      count: duplicateIndices.size,
    });
  }

  /* ── 8. Template-guided column reordering ───────────────────────────── */
  let finalColumns = [...normalizedColumns];

  if (template && template.columns.length > 0) {
    // Build a mapping: template column (lowercased) → template column (original case)
    const templateColsLower = template.columns.map((c) => c.toLowerCase().trim());

    // Reorder normalizedColumns to match template column order, dropping extras
    const reorderedCols: string[] = [];
    const usedCols = new Set<string>();

    for (const tCol of template.columns) {
      const tLower = tCol.toLowerCase().trim();
      // Find matching column in our data
      const match = normalizedColumns.find(
        (nc) => nc.toLowerCase().trim() === tLower && !usedCols.has(nc)
      );
      if (match) {
        reorderedCols.push(match);
        usedCols.add(match);
      }
    }

    // Append any data columns not in the template
    for (const col of normalizedColumns) {
      if (!usedCols.has(col)) {
        reorderedCols.push(col);
      }
    }

    if (reorderedCols.length > 0) {
      const orderChanged = reorderedCols.some((c, i) => c !== normalizedColumns[i]);
      if (orderChanged) {
        finalColumns = reorderedCols;
        transformations.push({
          type: "normalize_column",
          description: `Reordered columns to match template (${template.fileName})`,
          count: reorderedCols.length,
        });
      }
    }

    // Sort cleaned data to match template data ordering if template has sample data
    if (template.sampleData.length > 0) {
      // Derive sort column from the first column in the template
      const sortCol = template.columns[0];
      if (sortCol) {
        const colLower = sortCol.toLowerCase().trim();
        const matchingCol = finalColumns.find(
          (c) => c.toLowerCase().trim() === colLower
        );
        if (matchingCol) {
          cleanedRows = [...cleanedRows].sort((a, b) => {
            const va = a[matchingCol] ?? "";
            const vb = b[matchingCol] ?? "";
            return String(va).localeCompare(String(vb));
          });
          transformations.push({
            type: "normalize_column",
            description: `Sorted data by "${matchingCol}" to match template order`,
            count: cleanedRows.length,
          });
        }
      }
    }
  }

  /* ── 9. Build summary ───────────────────────────────────────────────── */
  const errorRows = new Set<number>();
  const warningRows = new Set<number>();
  for (const issue of issues) {
    if (issue.severity === "error") errorRows.add(issue.row);
    else if (issue.severity === "warning") warningRows.add(issue.row);
  }

  const summary: CleaningSummary = {
    totalRows: rawRows.length,
    cleanRows: rawRows.length - errorRows.size - warningRows.size,
    warningRows: warningRows.size,
    errorRows: errorRows.size,
    duplicatesFound: duplicateIndices.size,
    duplicatesRemoved: duplicateIndices.size,
    transformationsApplied: transformations.reduce((sum, t) => sum + t.count, 0),
  };

  return {
    originalData: rawRows,
    cleanedData: cleanedRows,
    issues,
    transformations,
    summary,
    detectedFileType: fileType,
    detectedFileTypeName: config?.name ?? "Unknown File Type",
    originalColumns: rawHeaders,
    normalizedColumns: finalColumns,
  };
}
