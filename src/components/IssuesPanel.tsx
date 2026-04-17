"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  XCircle,
  Info,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { CleaningIssue, IssueSeverity } from "@/types";

interface Props {
  issues: CleaningIssue[];
  onIssueClick?: (rowIndex: number) => void;
}

const severityConfig: Record<
  IssueSeverity,
  { icon: typeof XCircle; color: string; bg: string; label: string }
> = {
  error: {
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-500/10",
    label: "Error",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    label: "Warning",
  },
  info: {
    icon: Info,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    label: "Info",
  },
};

export function IssuesPanel({ issues, onIssueClick }: Props) {
  const [filter, setFilter] = useState<IssueSeverity | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const filteredIssues = useMemo(
    () =>
      filter === "all" ? issues : issues.filter((i) => i.severity === filter),
    [issues, filter]
  );

  const totalPages = Math.max(1, Math.ceil(filteredIssues.length / pageSize));
  const paginatedIssues = filteredIssues.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const counts = useMemo(() => {
    const c = { error: 0, warning: 0, info: 0 };
    for (const issue of issues) {
      c[issue.severity]++;
    }
    return c;
  }, [issues]);

  if (issues.length === 0) return null;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-sm overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="flex w-full items-center justify-between px-5 py-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Issues ({issues.length})
          </h3>
          <div className="flex gap-2">
            {counts.error > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-xs text-red-500">
                <XCircle className="h-3 w-3" /> {counts.error}
              </span>
            )}
            {counts.warning > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-500">
                <AlertTriangle className="h-3 w-3" /> {counts.warning}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-white/10 flex flex-col flex-1 min-h-0">
          {/* Filter bar */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-white/5">
            <Filter className="h-3.5 w-3.5 text-gray-400" />
            {(["all", "error", "warning", "info"] as const).map((f) => (
              <button
                key={f}
                onClick={() => {
                  setFilter(f);
                  setCurrentPage(1);
                }}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  filter === f
                    ? "bg-[#5B66E2] text-white"
                    : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-[#939393] hover:bg-gray-200 dark:hover:bg-white/20"
                }`}
              >
                {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Issue list */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-white/5">
            {paginatedIssues.map((issue, i) => {
              const cfg = severityConfig[issue.severity];
              const Icon = cfg.icon;
              return (
                <div
                  key={i}
                  onClick={() => onIssueClick?.(issue.row)}
                  className={`flex items-start gap-3 px-5 py-3 text-sm ${onIssueClick ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors" : ""}`}
                >
                  <div className={`mt-0.5 rounded-md p-1 ${cfg.bg}`}>
                    <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 dark:text-gray-200">
                      {issue.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-[#939393] mt-0.5">
                      Row {issue.row + 1} &middot;{" "}
                      <span className="font-medium">{issue.column}</span>
                      {issue.originalValue !== null && (
                        <>
                          {" "}
                          &middot; Value:{" "}
                          <code className="rounded bg-gray-100 dark:bg-white/10 px-1">
                            {String(issue.originalValue)}
                          </code>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-2.5 border-t border-gray-200 dark:border-white/10 flex items-center justify-between flex-shrink-0">
              <span className="text-[11px] text-gray-400 dark:text-gray-600">
                {((currentPage - 1) * pageSize + 1).toLocaleString()}–{Math.min(currentPage * pageSize, filteredIssues.length).toLocaleString()} of {filteredIssues.length.toLocaleString()}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-md p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <input
                    type="text"
                    value={currentPage}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val >= 1 && val <= totalPages) {
                        setCurrentPage(val);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const val = parseInt((e.target as HTMLInputElement).value, 10);
                        if (!isNaN(val) && val >= 1 && val <= totalPages) {
                          setCurrentPage(val);
                        }
                      }
                    }}
                    className="w-10 text-center text-xs font-medium rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#5B66E2] focus:border-[#5B66E2]"
                  />
                  <span>/ {totalPages.toLocaleString()}</span>
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-md p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
    </div>
  );
}
