"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Sun, Moon, Monitor, Upload, FileSpreadsheet, Trash2, CheckCircle2, Settings2, Palette, Info, Shield, ChevronDown } from "lucide-react";
import { useTheme } from "next-themes";
import {
  saveTemplate,
  getAllTemplates,
  deleteTemplate,
  type StoredTemplate,
} from "@/services/templateStore";
import { parseExcelFile } from "@/services/fileParser";
import type { FileType } from "@/types";

const FILE_TYPES: { id: FileType; name: string }[] = [
  { id: "ACCOUNT_STATUS_BEL", name: "Account Status BEL" },
  { id: "ADA_PENALTY", name: "ADA Penalty" },
  { id: "BSP_ATTESTATION", name: "BSP Attestation" },
  { id: "PTP_REPORT_BEL", name: "PTP Report BEL" },
  { id: "PTP_INVENTORY_BEL", name: "PTP Inventory BEL" },
  { id: "CARDS_ATTENDANCE", name: "Cards Attendance" },
  { id: "FIELD_VISIT_REPORT_BEL", name: "Field Visit Report BEL" },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [templates, setTemplates] = useState<Record<string, StoredTemplate>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    setMounted(true);
    // Load all stored templates
    getAllTemplates().then((list) => {
      const map: Record<string, StoredTemplate> = {};
      for (const t of list) map[t.fileType] = t;
      setTemplates(map);
    });
  }, []);

  const handleTemplateUpload = useCallback(
    async (fileType: FileType, file: File) => {
      setUploading(fileType);
      try {
        const buffer = await file.arrayBuffer();
        const sheets = parseExcelFile(buffer);
        const sheet = sheets.find((s) => s.rows.length > 0) ?? sheets[0];
        if (!sheet || sheet.rows.length === 0) {
          throw new Error("No data found in the uploaded file");
        }

        const template: StoredTemplate = {
          fileType,
          fileName: file.name,
          columns: sheet.headers,
          sampleData: sheet.rows.slice(0, 500),
          totalRows: sheet.rows.length,
          uploadedAt: Date.now(),
        };

        await saveTemplate(template);
        setTemplates((prev) => ({ ...prev, [fileType]: template }));
      } catch (err) {
        console.error("Failed to upload template:", err);
      } finally {
        setUploading(null);
      }
    },
    []
  );

  const handleDeleteTemplate = useCallback(async (fileType: FileType) => {
    await deleteTemplate(fileType);
    setTemplates((prev) => {
      const next = { ...prev };
      delete next[fileType];
      return next;
    });
  }, []);

  const uploadedCount = Object.keys(templates).length;

  if (!mounted) return null;

  return (
    <div className="px-4 sm:px-8 py-8">
      <div className="w-full">
        {/* Page Header */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-1">
            <div className="rounded-xl bg-[#5B66E2]/10 p-2.5">
              <Settings2 className="h-5 w-5 text-[#5B66E2]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Settings
              </h1>
              <p className="text-sm text-gray-500 dark:text-[#939393]">
                Manage cleaning templates and customize your experience
              </p>
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          {/* LEFT COLUMN: Appearance + About */}
          <div className="flex flex-col gap-4 animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
            {/* Appearance */}
            <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-sm p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="rounded-lg bg-amber-500/10 p-1.5">
                  <Palette className="h-4 w-4 text-amber-500" />
                </div>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Appearance
                </h2>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "light", label: "Light", icon: Sun },
                  { value: "dark", label: "Dark", icon: Moon },
                  { value: "system", label: "System", icon: Monitor },
                ].map((opt) => {
                  const Icon = opt.icon;
                  const active = theme === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setTheme(opt.value)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all duration-200 ${
                        active
                          ? "border-[#5B66E2] bg-[#5B66E2]/10 text-[#5B66E2]"
                          : "border-gray-200 dark:border-white/10 text-gray-500 dark:text-[#939393] hover:border-[#5B66E2]/50 hover:bg-[#5B66E2]/5"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs font-medium">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* About */}
            <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-sm p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="rounded-lg bg-emerald-500/10 p-1.5">
                  <Shield className="h-4 w-4 text-emerald-500" />
                </div>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                  About StatWash
                </h2>
              </div>
              <div className="space-y-2.5 text-xs text-gray-600 dark:text-[#939393] leading-relaxed">
                <p>
                  Fully client-side Excel data cleaning. All processing happens in your browser — no data is sent to any server.
                </p>
                <p>
                  Templates persist locally via IndexedDB across sessions.
                </p>
                <div className="pt-2 mt-2 border-t border-gray-100 dark:border-white/5">
                  <p className="text-[11px] text-gray-400 dark:text-gray-600">
                    v1.0.0 &middot; Next.js + TypeScript
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Templates */}
          <div
            className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-sm overflow-hidden animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="px-6 py-5 border-b border-gray-200 dark:border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[#5B66E2]/10 p-2">
                    <FileSpreadsheet className="h-4 w-4 text-[#5B66E2]" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                      Cleaning Templates
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-[#939393] mt-0.5">
                      Upload a cleaned reference file for each type to guide cleaning
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <div className="flex items-center gap-2 rounded-full bg-[#5B66E2]/10 px-3 py-1.5">
                    <div className="h-2 w-2 rounded-full bg-[#5B66E2]" />
                    <span className="text-xs font-medium text-[#5B66E2]">
                      {uploadedCount}/{FILE_TYPES.length}
                    </span>
                  </div>
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-4 h-1.5 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#5B66E2] transition-all duration-500"
                  style={{ width: `${(uploadedCount / FILE_TYPES.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {FILE_TYPES.map((ft, i) => {
                const template = templates[ft.id];
                const isUploading = uploading === ft.id;
                const isExpanded = expanded[ft.id] ?? false;
                const previewRows = template?.sampleData?.slice(0, 10) ?? [];
                return (
                  <div key={ft.id}>
                    <div className="flex items-center gap-4 px-6 py-4 transition-all hover:bg-gray-50/50 dark:hover:bg-white/5 group">
                      {/* Chevron */}
                      <button
                        onClick={() =>
                          template &&
                          setExpanded((prev) => ({
                            ...prev,
                            [ft.id]: !prev[ft.id],
                          }))
                        }
                        className={`flex-shrink-0 rounded-md p-1 transition-all ${
                          template
                            ? "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer"
                            : "text-gray-200 dark:text-gray-700 cursor-default"
                        }`}
                        disabled={!template}
                        title={template ? (isExpanded ? "Collapse preview" : "Expand preview") : "No template to preview"}
                      >
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-200 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {/* Index number */}
                      <div className="flex-shrink-0 w-5 text-center">
                        <span className="text-xs font-medium text-gray-400 dark:text-gray-600">
                          {i + 1}
                        </span>
                      </div>
                      {/* Icon */}
                      <div className="flex-shrink-0">
                        <div
                          className={`rounded-lg p-2 ${
                            template
                              ? "bg-emerald-500/10"
                              : "bg-gray-100 dark:bg-white/10"
                          }`}
                        >
                          {template ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <FileSpreadsheet className="h-4 w-4 text-gray-400 dark:text-[#939393]" />
                          )}
                        </div>
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {ft.name}
                        </p>
                        {template ? (
                          <p className="text-xs text-gray-500 dark:text-[#939393] mt-0.5 flex items-center gap-1.5">
                            <span className="truncate">{template.fileName}</span>
                            <span className="text-gray-300 dark:text-gray-600">&middot;</span>
                            {template.columns.length} cols
                            <span className="text-gray-300 dark:text-gray-600">&middot;</span>
                            {template.totalRows.toLocaleString()} rows
                          </p>
                        ) : (
                          <p className="text-xs text-gray-400 dark:text-[#939393] mt-0.5">
                            No template uploaded yet
                          </p>
                        )}
                      </div>
                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {template && (
                          <button
                            onClick={() => handleDeleteTemplate(ft.id)}
                            className="rounded-lg p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                            title="Remove template"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                        <input
                          type="file"
                          accept=".xlsx,.xls,.csv"
                          ref={(el) => { fileInputRefs.current[ft.id] = el; }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleTemplateUpload(ft.id, file);
                            e.target.value = "";
                          }}
                          className="hidden"
                        />
                        <button
                          onClick={() => fileInputRefs.current[ft.id]?.click()}
                          disabled={isUploading}
                          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-colors ${
                            isUploading
                              ? "bg-gray-100 dark:bg-white/10 text-gray-400 cursor-not-allowed"
                              : template
                              ? "border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
                              : "bg-[#5B66E2] text-white hover:bg-[#4A55D1] shadow-sm"
                          }`}
                        >
                          <Upload className="h-3.5 w-3.5" />
                          {isUploading
                            ? "Processing..."
                            : template
                            ? "Replace"
                            : "Upload"}
                        </button>
                      </div>
                    </div>

                    {/* Expandable preview */}
                    {isExpanded && template && previewRows.length > 0 && (
                      <div className="px-6 pb-4">
                        <div className="ml-10 rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden">
                          <div className="overflow-x-auto max-h-[280px] overflow-y-auto">
                            <table className="w-full text-xs">
                              <thead className="bg-gray-50 dark:bg-white/5 sticky top-0">
                                <tr>
                                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-[#939393] border-b border-gray-200 dark:border-white/10 w-10">
                                    #
                                  </th>
                                  {template.columns.map((col) => (
                                    <th
                                      key={col}
                                      className="px-3 py-2 text-left font-medium text-gray-500 dark:text-[#939393] border-b border-gray-200 dark:border-white/10 whitespace-nowrap"
                                    >
                                      {col}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {previewRows.map((row, rowIdx) => (
                                  <tr key={rowIdx} className="hover:bg-gray-50/50 dark:hover:bg-white/5">
                                    <td className="px-3 py-1.5 text-gray-400 dark:text-gray-600 font-mono">
                                      {rowIdx + 1}
                                    </td>
                                    {template.columns.map((col) => (
                                      <td
                                        key={col}
                                        className="px-3 py-1.5 text-gray-700 dark:text-gray-300 whitespace-nowrap max-w-[200px] truncate"
                                      >
                                        {row[col] != null ? String(row[col]) : ""}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {template.totalRows > 10 && (
                            <div className="px-3 py-2 bg-gray-50 dark:bg-white/5 border-t border-gray-200 dark:border-white/10 text-[11px] text-gray-400 dark:text-gray-600">
                              Showing 10 of {template.totalRows.toLocaleString()} rows
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
