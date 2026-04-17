"use client";

import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import type { CleaningResult, CellIssueMap } from "@/types";

interface Props {
  result: CleaningResult;
  /** Whether to show original or cleaned data */
  showCleaned: boolean;
  /** Row index to highlight and navigate to */
  highlightedRow?: number | null;
  /** Called when the highlight should be cleared */
  onHighlightClear?: () => void;
}

const PAGE_SIZE = 25;

export function DataPreview({ result, showCleaned, highlightedRow, onHighlightClear }: Props) {
  const [page, setPage] = useState(0);
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const highlightRef = useRef<HTMLTableRowElement>(null);

  const data = showCleaned ? result.cleanedData : result.originalData;
  const columns = showCleaned ? result.normalizedColumns : result.originalColumns;

  // Build issue lookup map for cell highlighting
  const issueMap: CellIssueMap = useMemo(() => {
    const map: CellIssueMap = {};
    for (const issue of result.issues) {
      const key = `${issue.row}:${issue.column}`;
      // Keep the highest severity
      const existing = map[key];
      if (!existing || severityRank(issue.severity) > severityRank(existing.severity)) {
        map[key] = issue;
      }
    }
    return map;
  }, [result.issues]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortCol) return data;
    const sorted = [...data].sort((a, b) => {
      const va = a[sortCol] ?? "";
      const vb = b[sortCol] ?? "";
      if (typeof va === "number" && typeof vb === "number") {
        return sortAsc ? va - vb : vb - va;
      }
      const comparison = String(va).localeCompare(String(vb));
      return sortAsc ? comparison : -comparison;
    });
    return sorted;
  }, [data, sortCol, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / PAGE_SIZE));
  const pageData = sortedData.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Navigate to highlighted row's page when it changes
  useEffect(() => {
    if (highlightedRow == null || sortCol) return; // skip if sorted (indices may shift)
    const targetPage = Math.floor(highlightedRow / PAGE_SIZE);
    setPage(targetPage);
    // Clear highlight after a delay
    const timer = setTimeout(() => {
      onHighlightClear?.();
    }, 3000);
    return () => clearTimeout(timer);
  }, [highlightedRow, sortCol, onHighlightClear]);

  // Scroll the highlighted row into view after page change
  useEffect(() => {
    if (highlightedRow != null && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });

  const handleHeaderClick = useCallback(
    (col: string) => {
      if (sortCol === col) {
        setSortAsc(!sortAsc);
      } else {
        setSortCol(col);
        setSortAsc(true);
      }
      setPage(0);
    },
    [sortCol, sortAsc]
  );

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 p-8 text-center">
        <p className="text-gray-500 dark:text-[#939393]">No data to preview</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-sm overflow-hidden">
      {/* Table container */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-white/10 bg-gray-50/80 dark:bg-white/5">
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[#939393] w-12">
                #
              </th>
              {columns.map((col) => (
                <th
                  key={col}
                  onClick={() => handleHeaderClick(col)}
                  className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[#939393] cursor-pointer hover:text-[#5B66E2] dark:hover:text-[#5B66E2] whitespace-nowrap select-none"
                >
                  <span className="flex items-center gap-1">
                    {col}
                    {sortCol === col && (
                      <span className="text-[#5B66E2]">
                        {sortAsc ? "↑" : "↓"}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {pageData.map((row, rowIdx) => {
              const absoluteRowIdx = page * PAGE_SIZE + rowIdx;
              const isHighlighted = highlightedRow === absoluteRowIdx;
              return (
                <tr
                  key={absoluteRowIdx}
                  ref={isHighlighted ? highlightRef : undefined}
                  className={`transition-colors ${
                    isHighlighted
                      ? "bg-[#5B66E2]/10 dark:bg-[#5B66E2]/20 ring-1 ring-inset ring-[#5B66E2]/30"
                      : "hover:bg-gray-50/50 dark:hover:bg-white/5"
                  }`}
                >
                  <td className="px-3 py-2.5 text-xs text-gray-400 dark:text-[#939393]">
                    {absoluteRowIdx + 1}
                  </td>
                  {columns.map((col) => {
                    const issueKey = `${absoluteRowIdx}:${col}`;
                    const issue = issueMap[issueKey];
                    const val = row[col];
                    return (
                      <td
                        key={col}
                        className={`px-3 py-2.5 text-gray-800 dark:text-gray-200 whitespace-nowrap max-w-[200px] truncate ${
                          issue
                            ? issue.severity === "error"
                              ? "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400"
                              : issue.severity === "warning"
                              ? "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400"
                              : ""
                            : ""
                        }`}
                        title={
                          issue
                            ? `${issue.message}`
                            : val !== null
                            ? String(val)
                            : ""
                        }
                      >
                        {val !== null && val !== undefined ? String(val) : (
                          <span className="text-gray-300 dark:text-gray-600 italic">
                            empty
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-200 dark:border-white/10 px-4 py-3">
        <p className="text-xs text-gray-500 dark:text-[#939393]">
          Showing {page * PAGE_SIZE + 1}–
          {Math.min((page + 1) * PAGE_SIZE, sortedData.length)} of{" "}
          {sortedData.length} rows
        </p>
        <div className="flex items-center gap-1">
          <PaginationButton
            onClick={() => setPage(0)}
            disabled={page === 0}
          >
            <ChevronsLeft className="h-4 w-4" />
          </PaginationButton>
          <PaginationButton
            onClick={() => setPage(page - 1)}
            disabled={page === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </PaginationButton>
          <span className="px-3 py-1 text-xs text-gray-600 dark:text-[#939393]">
            {page + 1} / {totalPages}
          </span>
          <PaginationButton
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </PaginationButton>
          <PaginationButton
            onClick={() => setPage(totalPages - 1)}
            disabled={page >= totalPages - 1}
          >
            <ChevronsRight className="h-4 w-4" />
          </PaginationButton>
        </div>
      </div>
    </div>
  );
}

function PaginationButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg p-1.5 transition-colors ${
        disabled
          ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
          : "text-gray-500 dark:text-[#939393] hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function severityRank(s: string): number {
  return s === "error" ? 3 : s === "warning" ? 2 : 1;
}
