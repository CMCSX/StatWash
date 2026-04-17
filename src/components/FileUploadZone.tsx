"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, FileSpreadsheet, X } from "lucide-react";
import { useCleaning } from "@/context/CleaningContext";

export function FileUploadZone() {
  const { processFile, isProcessing } = useCleaning();
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv",
      ];
      const validExtensions = [".xlsx", ".xls", ".csv"];
      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

      if (!validTypes.includes(file.type) && !validExtensions.includes(ext)) {
        return;
      }
      processFile(file);
    },
    [processFile]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      // Reset so re-uploading the same file works
      e.target.value = "";
    },
    [handleFile]
  );

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 ${
        isDragOver
          ? "border-[#5B66E2] bg-[#5B66E2]/10 scale-[1.02]"
          : "border-gray-300 dark:border-white/20 hover:border-[#5B66E2]/50 hover:bg-[#5B66E2]/5"
      } ${isProcessing ? "pointer-events-none opacity-60" : ""}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={onFileSelect}
        className="hidden"
      />

      {isProcessing ? (
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-3 border-[#5B66E2] border-t-transparent" />
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            Processing file...
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#5B66E2]/10">
            {isDragOver ? (
              <FileSpreadsheet className="h-8 w-8 text-[#5B66E2]" />
            ) : (
              <Upload className="h-8 w-8 text-[#5B66E2]" />
            )}
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {isDragOver ? "Drop your file here" : "Upload Excel File"}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-[#939393]">
              Drag & drop or click to browse. Supports .xlsx, .xls, .csv
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
