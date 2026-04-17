"use client";

import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRightLeft,
  Copy,
  Trash2,
  Sparkles,
} from "lucide-react";
import type { CleaningResult } from "@/types";

interface Props {
  result: CleaningResult;
}

export function CleaningSummary({ result }: Props) {
  const { summary, transformations, detectedFileTypeName } = result;

  const statCards = [
    {
      label: "Total Rows",
      value: summary.totalRows,
      icon: Sparkles,
      color: "text-[#5B66E2]",
      bg: "bg-[#5B66E2]/10",
    },
    {
      label: "Clean Rows",
      value: summary.cleanRows,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Warnings",
      value: summary.warningRows,
      icon: AlertTriangle,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "Errors",
      value: summary.errorRows,
      icon: XCircle,
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
    {
      label: "Duplicates Removed",
      value: summary.duplicatesRemoved,
      icon: Copy,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      label: "Transformations",
      value: summary.transformationsApplied,
      icon: ArrowRightLeft,
      color: "text-[#8B96F2]",
      bg: "bg-[#8B96F2]/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* File type badge */}
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-[#5B66E2]/10 px-4 py-1.5 text-sm font-medium text-[#5B66E2]">
          {detectedFileTypeName}
        </span>
        {result.detectedFileType && (
          <span className="text-xs text-gray-500 dark:text-[#939393]">
            Auto-detected
          </span>
        )}
      </div>

      {/* Stat cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`rounded-lg p-1.5 ${card.bg}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {card.value.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-[#939393] mt-1">
                {card.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Transformations log */}
      {transformations.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4 text-[#5B66E2]" />
            Transformations Applied
          </h3>
          <div className="space-y-2">
            {transformations.map((t, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-white/5 px-4 py-2.5"
              >
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t.description}
                </span>
                <span className="ml-3 flex-shrink-0 rounded-full bg-[#5B66E2]/10 px-2.5 py-0.5 text-xs font-medium text-[#5B66E2]">
                  {t.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
