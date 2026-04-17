"use client";

import { Sparkles } from "lucide-react";
import { useCleaning } from "@/context/CleaningContext";

export function TopBar() {
  const { fileName, result } = useCleaning();

  return (
    <header className="sticky top-0 z-[60] flex h-16 items-center justify-between border-b bg-white dark:bg-[#070D12] border-gray-200 dark:border-white/10 px-4 sm:px-6">
      {/* Left: logo + file name */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-[#5B66E2] to-[#8B96F2]">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            StatWash
          </span>
        </div>
        {fileName && (
          <span className="hidden sm:inline text-sm text-gray-500 dark:text-[#939393] truncate max-w-[500px]">
            {fileName}
          </span>
        )}
      </div>

      {/* Right: File type badge */}
      {result && result.detectedFileTypeName && (
        <span className="rounded-full border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 px-4 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300">
          {result.detectedFileTypeName}
        </span>
      )}
    </header>
  );
}
