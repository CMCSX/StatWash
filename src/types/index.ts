/* ────────────────────────────────────────────────────────────
   Core domain types — strict typing, no `any`
   ──────────────────────────────────────────────────────────── */

export type FileType =
  | "ACCOUNT_STATUS_BEL"
  | "ADA_PENALTY"
  | "BSP_ATTESTATION"
  | "PTP_REPORT_BEL"
  | "PTP_INVENTORY_BEL"
  | "CARDS_ATTENDANCE"
  | "FIELD_VISIT_REPORT_BEL";

export type IssueSeverity = "error" | "warning" | "info";
export type IssueType = "missing" | "invalid_format" | "duplicate" | "type_mismatch";
export type CellStatus = "clean" | "warning" | "error";

export interface CleaningIssue {
  row: number;
  column: string;
  type: IssueType;
  severity: IssueSeverity;
  message: string;
  originalValue: string | number | null;
  suggestedValue?: string | number;
}

export interface TransformationLog {
  type:
    | "normalize_column"
    | "fix_date"
    | "fix_casing"
    | "remove_duplicate"
    | "fill_default"
    | "trim_whitespace"
    | "convert_type";
  description: string;
  count: number;
}

export interface CleaningSummary {
  totalRows: number;
  cleanRows: number;
  warningRows: number;
  errorRows: number;
  duplicatesFound: number;
  duplicatesRemoved: number;
  transformationsApplied: number;
}

export interface CleaningResult {
  originalData: Record<string, unknown>[];
  cleanedData: Record<string, unknown>[];
  issues: CleaningIssue[];
  transformations: TransformationLog[];
  summary: CleaningSummary;
  detectedFileType: FileType | null;
  detectedFileTypeName: string;
  originalColumns: string[];
  normalizedColumns: string[];
}

export type TextCasing = "upper" | "lower" | "title" | "none";

export interface FileTypeConfig {
  id: FileType;
  name: string;
  /** Header patterns used to detect this file type (lowercased) */
  headerSignatures: string[];
  /** Canonical column names after normalization */
  expectedColumns: string[];
  /** Columns that must not be empty */
  requiredFields: string[];
  /** Columns that should contain dates */
  dateColumns: string[];
  /** Columns that should contain numbers */
  numericColumns: string[];
  /** Map raw header names (lowercased) → canonical column name */
  columnNameMap: Record<string, string>;
  /** Text casing to enforce per column */
  textCasingRules: Record<string, TextCasing>;
  /** Target date format for normalization */
  dateFormat: string;
}

export interface CellIssueMap {
  [rowCol: string]: CleaningIssue;
}
