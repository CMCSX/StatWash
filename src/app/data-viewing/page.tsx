"use client";

import { useState, useCallback, useRef } from "react";
import {
  Download,
  FileDown,
  FileSpreadsheet,
  ChevronDown,
  ChevronRight,
  Upload,
  X,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRightLeft,
  Layers,
  ShieldCheck,
  Trash2,
  Repeat2,
  Sparkles,
  Undo2,
} from "lucide-react";
import Link from "next/link";
import { useCleaning } from "@/context/CleaningContext";
import { DataPreview } from "@/components/DataPreview";
import { IssuesPanel } from "@/components/IssuesPanel";
import { exportToExcel, exportToCSV } from "@/services/fileExporter";

export default function DataViewingPage() {
  const { files, activeIndex, setActiveIndex, removeFile, reorderFiles, result, fileName, reset } = useCleaning();
  const [showCleaned] = useState(true);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [highlightedRow, setHighlightedRow] = useState<number | null>(null);
  const dragIndexRef = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const tabsScrollRef = useRef<HTMLDivElement>(null);

  const scrollTabsToEnd = useCallback(() => {
    if (tabsScrollRef.current) {
      tabsScrollRef.current.scrollTo({ left: tabsScrollRef.current.scrollWidth, behavior: "smooth" });
    }
  }, []);

  const handleIssueClick = useCallback((rowIndex: number) => {
    setHighlightedRow(rowIndex);
    // Scroll to the data preview section
    setTimeout(() => {
      document.getElementById("data-preview-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }, []);

  const handleExportExcel = useCallback(() => {
    if (!result || !fileName) return;
    const data = showCleaned ? result.cleanedData : result.originalData;
    const cols = showCleaned ? result.normalizedColumns : result.originalColumns;
    exportToExcel(data, cols, fileName);
    setShowExportMenu(false);
  }, [result, fileName, showCleaned]);

  const handleExportCSV = useCallback(() => {
    if (!result || !fileName) return;
    const data = showCleaned ? result.cleanedData : result.originalData;
    const cols = showCleaned ? result.normalizedColumns : result.originalColumns;
    exportToCSV(data, cols, fileName);
    setShowExportMenu(false);
  }, [result, fileName, showCleaned]);

  const statCards = result
    ? [
        { label: "Total Rows", value: result.summary.totalRows, icon: Layers, color: "text-[#5B66E2]", bg: "bg-gradient-to-br from-[#5B66E2]/15 to-[#8B96F2]/10", accent: "border-l-[#5B66E2]" },
        { label: "Clean Rows", value: result.summary.cleanRows, icon: ShieldCheck, color: "text-emerald-500", bg: "bg-gradient-to-br from-emerald-500/15 to-emerald-400/10", accent: "border-l-emerald-500" },
        { label: "Warnings", value: result.summary.warningRows, icon: AlertTriangle, color: "text-amber-500", bg: "bg-gradient-to-br from-amber-500/15 to-amber-400/10", accent: "border-l-amber-500" },
        { label: "Errors", value: result.summary.errorRows, icon: XCircle, color: "text-red-500", bg: "bg-gradient-to-br from-red-500/15 to-red-400/10", accent: "border-l-red-500" },
        { label: "Duplicates Removed", value: result.summary.duplicatesRemoved, icon: Trash2, color: "text-orange-500", bg: "bg-gradient-to-br from-orange-500/15 to-orange-400/10", accent: "border-l-orange-500" },
        { label: "Transformations", value: result.summary.transformationsApplied, icon: Repeat2, color: "text-[#8B96F2]", bg: "bg-gradient-to-br from-[#8B96F2]/15 to-[#5B66E2]/10", accent: "border-l-[#8B96F2]" },
      ]
    : [];

  return (
    <div className="px-4 sm:px-8 py-8">
      {/* Row 1: Title left, file tabs center, export right */}
      <div className="flex items-start justify-between mb-6 animate-fade-in-up">
        <div className="flex items-start gap-4 flex-shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Data Viewing
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-[#939393]">
              {result
                ? `${fileName} \u2014 ${result.summary.totalRows} rows processed`
                : "Upload a file from the Upload page to view results here"}
            </p>
          </div>

          {/* File tabs next to title — max 4 visible, horizontally scrollable, draggable */}
          {files.length > 0 && (
            <div className="flex items-center gap-1 self-end">
              <div
                ref={tabsScrollRef}
                className="flex items-center gap-2 overflow-x-auto overflow-y-hidden scrollbar-none"
                style={{ maxWidth: "784px" }}
              >
              {files.map((entry, i) => (
                <button
                  key={`${entry.fileName}-${i}`}
                  draggable
                  onDragStart={(e) => {
                    dragIndexRef.current = i;
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    setDragOverIndex(i);
                  }}
                  onDragLeave={() => setDragOverIndex(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (dragIndexRef.current !== null && dragIndexRef.current !== i) {
                      reorderFiles(dragIndexRef.current, i);
                    }
                    dragIndexRef.current = null;
                    setDragOverIndex(null);
                  }}
                  onDragEnd={() => {
                    dragIndexRef.current = null;
                    setDragOverIndex(null);
                  }}
                  onClick={() => setActiveIndex(i)}
                  className={`group flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 w-[190px] cursor-grab active:cursor-grabbing ${
                    dragOverIndex === i ? "ring-2 ring-[#5B66E2]/50" : ""
                  } ${
                    i === activeIndex
                      ? "bg-[#5B66E2] text-white"
                      : "border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10"
                  }`}
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate max-w-[160px]">{entry.fileName}</span>
                  <span
                    role="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(i);
                    }}
                    className={`ml-1 rounded-full p-0.5 transition-colors ${
                      i === activeIndex
                        ? "hover:bg-white/20"
                        : "hover:bg-gray-200 dark:hover:bg-white/20"
                    }`}
                  >
                    <X className="h-3 w-3" />
                  </span>
                </button>
              ))}
              </div>
              {files.length > 4 && (
                <button
                  onClick={scrollTabsToEnd}
                  className="flex-shrink-0 rounded-full p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                  title="Scroll to end"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Export button right */}
        {result && (
          <div className="relative z-50 flex-shrink-0">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 rounded-lg bg-[#5B66E2] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#4A55D1] transition-colors shadow-lg shadow-[#5B66E2]/30"
            >
              <Download className="h-4 w-4" />
              Export
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {showExportMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowExportMenu(false)}
                />
                <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#141624] shadow-2xl">
                  <button
                    onClick={handleExportExcel}
                    className="flex w-full items-center gap-3 rounded-t-xl px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                  >
                    <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                    Export as Excel
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="flex w-full items-center gap-3 rounded-b-xl px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors border-t border-gray-100 dark:border-white/5"
                  >
                    <FileDown className="h-4 w-4 text-blue-500" />
                    Export as CSV
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* No data state */}
      {files.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 animate-fade-in-up">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#5B66E2]/10 mb-6">
            <FileSpreadsheet className="h-10 w-10 text-[#5B66E2]" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No data loaded
          </h2>
          <p className="text-sm text-gray-500 dark:text-[#939393] mb-6 text-center max-w-md">
            Upload and clean an Excel file first, then come back here to view, inspect, and export the results.
          </p>
          <Link
            href="/upload"
            className="flex items-center gap-2 rounded-lg bg-[#5B66E2] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#4A55D1] transition-colors shadow-lg shadow-[#5B66E2]/30"
          >
            <Upload className="h-4 w-4" />
            Go to Upload
          </Link>
        </div>
      )}

      {/* Row 2: Three columns - Stats | Transformations & Notifications | Issues */}
      {result && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex gap-6 h-[420px]">
            {/* Left: Stats 2x3 grid */}
            <div className="flex-1 min-w-0 grid grid-cols-2 gap-3">
              {statCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.label}
                    className={`rounded-xl border border-gray-200 dark:border-white/10 border-l-[3px] ${card.accent} bg-white/60 dark:bg-white/5 backdrop-blur-sm p-4 flex flex-col justify-center transition-shadow hover:shadow-md`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`rounded-xl p-2 ${card.bg}`}>
                        <Icon className={`h-5 w-5 ${card.color}`} />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {card.value.toLocaleString()}
                    </p>
                    <p className="text-xs font-medium text-gray-500 dark:text-[#939393] mt-1 uppercase tracking-wide">
                      {card.label}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Center: Transformations & Notifications */}
            <div className="flex-1 min-w-0 h-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-sm overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex w-full items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Transformations
                  </h3>
                </div>
              </div>
              {/* Entries */}
              <div className="border-t border-gray-200 dark:border-white/10 flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-white/5">
                {result.transformations.length > 0 ? (
                  result.transformations.map((t, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 px-5 py-3 text-sm"
                    >
                      <div className="mt-0.5 rounded-md p-1 bg-[#5B66E2]/10">
                        <ArrowRightLeft className="h-3.5 w-3.5 text-[#5B66E2]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 dark:text-gray-200">
                          {t.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-[#939393] mt-0.5">
                          {t.count} {t.count === 1 ? "change" : "changes"}
                        </p>
                      </div>
                      <button
                        className="mt-0.5 rounded-md p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex-shrink-0"
                        title="Undo transformation"
                      >
                        <Undo2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="px-5 py-8 text-center">
                    <p className="text-sm text-gray-400 dark:text-[#939393]">
                      No transformations applied
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Issues panel */}
            <div className="flex-1 min-w-0 h-full overflow-hidden flex flex-col">
              <IssuesPanel issues={result.issues} onIssueClick={handleIssueClick} />
            </div>
          </div>

          {/* Row 3: Full-width Data Preview table */}
          <div id="data-preview-section">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-[#5B66E2]" />
              Data Preview
              <span className="text-xs font-normal text-gray-500 dark:text-[#939393]">
                ({showCleaned ? "Cleaned" : "Original"} \u2014 {showCleaned ? result.cleanedData.length : result.originalData.length} rows)
              </span>
            </h2>
            <DataPreview result={result} showCleaned={showCleaned} highlightedRow={highlightedRow} onHighlightClear={() => setHighlightedRow(null)} />
          </div>
        </div>
      )}
    </div>
  );
}
