"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import type { CleaningResult } from "@/types";
import { parseExcelFile } from "@/services/fileParser";
import { detectFileType, cleanData } from "@/services/cleaningEngine";
import { getTemplate } from "@/services/templateStore";
import {
  saveSessionFiles,
  loadSessionFiles,
  clearSessionFiles,
} from "@/services/sessionStore";

interface FileEntry {
  fileName: string;
  result: CleaningResult;
}

interface CleaningState {
  /** All uploaded files */
  files: FileEntry[];
  /** Index of the active file tab */
  activeIndex: number;
  /** Set the active file tab */
  setActiveIndex: (index: number) => void;
  /** Name of the active file */
  fileName: string | null;
  /** Whether cleaning is in progress */
  isProcessing: boolean;
  /** Cleaning result for the active file */
  result: CleaningResult | null;
  /** Process a new file (adds to the list) */
  processFile: (file: File) => Promise<void>;
  /** Remove a specific file tab */
  removeFile: (index: number) => void;
  /** Reorder files by moving a file from one index to another */
  reorderFiles: (fromIndex: number, toIndex: number) => void;
  /** Clear all data */
  reset: () => void;
}

const CleaningContext = createContext<CleaningState | null>(null);

export function CleaningProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const hasLoadedRef = useRef(false);

  // Load persisted files on mount
  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    loadSessionFiles()
      .then((stored) => {
        if (stored.length > 0) {
          setFiles(stored);
          setActiveIndex(0);
        }
      })
      .catch(() => {
        // IndexedDB unavailable — ignore
      });
  }, []);

  // Auto-save files to IndexedDB whenever files change
  useEffect(() => {
    if (!hasLoadedRef.current) return;
    saveSessionFiles(files).catch(() => {
      // IndexedDB unavailable — ignore
    });
  }, [files]);

  const processFile = useCallback(async (file: File) => {
    setIsProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      const sheets = parseExcelFile(buffer);

      const sheet = sheets.find((s) => s.rows.length > 0) ?? sheets[0];
      if (!sheet || sheet.rows.length === 0) {
        throw new Error("No data found in the uploaded file");
      }

      const detectedType = detectFileType(sheet.headers);

      // Fetch stored template for this file type (if any)
      const template = detectedType ? await getTemplate(detectedType) : null;

      const cleaningResult = cleanData(sheet.rows, sheet.headers, detectedType, template);

      setFiles((prev) => {
        const newFiles = [...prev, { fileName: file.name, result: cleaningResult }];
        // Set active to the newly added file
        setActiveIndex(newFiles.length - 1);
        return newFiles;
      });
    } catch (err) {
      const errorResult: CleaningResult = {
        originalData: [],
        cleanedData: [],
        issues: [],
        transformations: [],
        summary: {
          totalRows: 0,
          cleanRows: 0,
          warningRows: 0,
          errorRows: 0,
          duplicatesFound: 0,
          duplicatesRemoved: 0,
          transformationsApplied: 0,
        },
        detectedFileType: null,
        detectedFileTypeName: err instanceof Error ? err.message : "Error processing file",
        originalColumns: [],
        normalizedColumns: [],
      };
      setFiles((prev) => {
        const newFiles = [...prev, { fileName: file.name, result: errorResult }];
        setActiveIndex(newFiles.length - 1);
        return newFiles;
      });
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => {
      const newFiles = prev.filter((_, i) => i !== index);
      setActiveIndex((prevActive) => {
        if (newFiles.length === 0) return 0;
        if (prevActive >= newFiles.length) return newFiles.length - 1;
        if (index < prevActive) return prevActive - 1;
        return prevActive;
      });
      return newFiles;
    });
  }, []);

  const reorderFiles = useCallback((fromIndex: number, toIndex: number) => {
    setFiles((prev) => {
      if (fromIndex === toIndex) return prev;
      const newFiles = [...prev];
      const [moved] = newFiles.splice(fromIndex, 1);
      newFiles.splice(toIndex, 0, moved);
      // Update activeIndex to follow the active file
      setActiveIndex((prevActive) => {
        if (prevActive === fromIndex) return toIndex;
        if (fromIndex < prevActive && toIndex >= prevActive) return prevActive - 1;
        if (fromIndex > prevActive && toIndex <= prevActive) return prevActive + 1;
        return prevActive;
      });
      return newFiles;
    });
  }, []);

  const reset = useCallback(() => {
    setFiles([]);
    setActiveIndex(0);
    setIsProcessing(false);
    clearSessionFiles().catch(() => {});
  }, []);

  const activeFile = files[activeIndex] ?? null;

  const value = useMemo(
    () => ({
      files,
      activeIndex,
      setActiveIndex,
      fileName: activeFile?.fileName ?? null,
      isProcessing,
      result: activeFile?.result ?? null,
      processFile,
      removeFile,
      reorderFiles,
      reset,
    }),
    [files, activeIndex, isProcessing, activeFile, processFile, removeFile, reorderFiles, reset]
  );

  return (
    <CleaningContext.Provider value={value}>{children}</CleaningContext.Provider>
  );
}

export function useCleaning(): CleaningState {
  const ctx = useContext(CleaningContext);
  if (!ctx) throw new Error("useCleaning must be used within CleaningProvider");
  return ctx;
}
