"use client";

import { use, useEffect, useState } from "react";
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Database,
} from "lucide-react";
import Link from "next/link";
import { useCleaning } from "@/context/CleaningContext";
import { FileUploadZone } from "@/components/FileUploadZone";
import FILE_TYPE_CONFIGS from "@/config/fileTypes";
import { getTemplate, type StoredTemplate } from "@/services/templateStore";
import type { FileType } from "@/types";

const SLUG_TO_TYPE: Record<string, FileType> = {
  "account-status-bel": "ACCOUNT_STATUS_BEL",
  "ada-penalty": "ADA_PENALTY",
  "bsp-attestation": "BSP_ATTESTATION",
  "ptp-report-bel": "PTP_REPORT_BEL",
  "ptp-inventory-bel": "PTP_INVENTORY_BEL",
  "cards-attendance": "CARDS_ATTENDANCE",
  "field-visit-report-bel": "FIELD_VISIT_REPORT_BEL",
};

export default function CleaningTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = use(params);
  const fileType = SLUG_TO_TYPE[type];
  const config = fileType ? FILE_TYPE_CONFIGS[fileType] : null;
  const { files, result } = useCleaning();
  const [template, setTemplate] = useState<StoredTemplate | null>(null);

  useEffect(() => {
    if (fileType) {
      getTemplate(fileType).then(setTemplate);
    }
  }, [fileType]);

  if (!config) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Unknown File Type
        </h1>
        <p className="text-sm text-gray-500 dark:text-[#939393]">
          This cleaning type does not exist.
        </p>
      </div>
    );
  }

  // Check if the currently loaded file matches this type
  const isMatchingType = result?.detectedFileType === fileType;

  return (
    <div className="px-4 sm:px-8 py-8 max-w-4xl mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {config.name}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-[#939393]">
          Cleaning rules and expected structure for {config.name} files
        </p>
      </div>

      {/* Upload zone */}
      <div className="mb-6">
        <FileUploadZone />
        {files.length > 0 && (
          <div className="mt-3 text-center">
            <Link
              href="/data-viewing"
              className="inline-flex items-center gap-2 text-sm text-[#5B66E2] hover:underline"
            >
              View {files.length} uploaded file{files.length > 1 ? "s" : ""} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* File matching status */}
      {files.length > 0 && (
        <div
          className={`mb-6 rounded-xl border p-4 flex items-center gap-3 ${
            isMatchingType
              ? "border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10"
              : "border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10"
          }`}
        >
          {isMatchingType ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-medium ${
                isMatchingType
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-amber-700 dark:text-amber-400"
              }`}
            >
              {isMatchingType
                ? "Current file matches this type"
                : "Current file does not match this type"}
            </p>
            <p className="text-xs text-gray-500 dark:text-[#939393] mt-0.5">
              Detected type: {result?.detectedFileTypeName ?? "Unknown"}
            </p>
          </div>
          <Link
            href="/data-viewing"
            className="text-sm text-[#5B66E2] hover:underline flex items-center gap-1 flex-shrink-0"
          >
            View Data <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Template Status */}
      <div
        className={`mb-6 rounded-xl border p-4 flex items-center gap-3 ${
          template
            ? "border-[#5B66E2]/20 bg-[#5B66E2]/5"
            : "border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5"
        }`}
      >
        <div className={`rounded-lg p-2 ${template ? "bg-[#5B66E2]/10" : "bg-gray-100 dark:bg-white/10"}`}>
          <Database className={`h-5 w-5 ${template ? "text-[#5B66E2]" : "text-gray-400"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${template ? "text-[#5B66E2]" : "text-gray-600 dark:text-gray-400"}`}>
            {template ? "Template loaded" : "No template uploaded"}
          </p>
          {template ? (
            <p className="text-xs text-gray-500 dark:text-[#939393] mt-0.5">
              {template.fileName} &middot; {template.columns.length} columns &middot; {template.totalRows} rows
            </p>
          ) : (
            <p className="text-xs text-gray-400 dark:text-[#939393] mt-0.5">
              Upload a cleaned reference file in Settings to guide cleaning
            </p>
          )}
        </div>
        <Link
          href="/settings"
          className="text-xs text-[#5B66E2] hover:underline flex items-center gap-1 flex-shrink-0"
        >
          {template ? "Manage" : "Upload"} <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Expected Columns */}
      <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-sm overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-white/10">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            Expected Columns ({config.expectedColumns.length})
          </h2>
        </div>
        <div className="p-5">
          <div className="flex flex-wrap gap-2">
            {config.expectedColumns.map((col) => (
              <span
                key={col}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  config.requiredFields.includes(col)
                    ? "bg-[#5B66E2]/10 text-[#5B66E2] border border-[#5B66E2]/20"
                    : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400"
                }`}
              >
                {col}
                {config.requiredFields.includes(col) && (
                  <span className="ml-1 text-[10px]">*</span>
                )}
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-400 dark:text-[#939393]">
            <span className="text-[#5B66E2]">*</span> = Required field
          </p>
        </div>
      </div>

      {/* Cleaning Rules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Date Columns */}
        {config.dateColumns.length > 0 && (
          <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Date Columns
            </h3>
            <div className="space-y-1.5">
              {config.dateColumns.map((col) => (
                <p
                  key={col}
                  className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  {col} → YYYY-MM-DD
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Numeric Columns */}
        {config.numericColumns.length > 0 && (
          <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Numeric Columns
            </h3>
            <div className="space-y-1.5">
              {config.numericColumns.map((col) => (
                <p
                  key={col}
                  className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {col}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Text Casing Rules */}
        {Object.keys(config.textCasingRules).length > 0 && (
          <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Text Casing Rules
            </h3>
            <div className="space-y-1.5">
              {Object.entries(config.textCasingRules).map(([col, rule]) => (
                <p
                  key={col}
                  className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  {col} → {rule}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Header Signatures */}
        <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Detection Signatures
          </h3>
          <div className="space-y-1.5">
            {config.headerSignatures.map((sig) => (
              <p
                key={sig}
                className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                <code className="bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded">
                  {sig}
                </code>
              </p>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
