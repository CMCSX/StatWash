"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";

type Row = Record<string, unknown>;

interface HistoryEntry {
  rowData: Row[];
  columns: string[];
}

interface EditingState {
  rowData: Row[];
  columns: string[];
  fileName: string | null;
  setData: (rows: Row[], cols: string[], name: string) => void;
  updateRowData: (rows: Row[]) => void;
  updateColumns: (cols: string[]) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  pushHistory: (rows: Row[], cols: string[]) => void;
  reset: () => void;
}

const EditingContext = createContext<EditingState | null>(null);

export function EditingProvider({ children }: { children: ReactNode }) {
  const [rowData, setRowData] = useState<Row[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const historyRef = useRef<HistoryEntry[]>([]);
  const isUndoRedoRef = useRef(false);

  const pushHistory = useCallback((data: Row[], cols: string[]) => {
    if (isUndoRedoRef.current) return;
    const idx = historyRef.current.length > 0 ? historyRef.current.length : 0;
    // Trim future entries based on current actual index
    historyRef.current = historyRef.current.slice(0, idx);
    historyRef.current.push({
      rowData: data.map((r) => ({ ...r })),
      columns: [...cols],
    });
    setHistoryIndex(historyRef.current.length - 1);
  }, []);

  const setData = useCallback(
    (rows: Row[], cols: string[], name: string) => {
      setRowData(rows);
      setColumns(cols);
      setFileName(name);
      historyRef.current = [];
      setHistoryIndex(-1);
      pushHistory(rows, cols);
    },
    [pushHistory]
  );

  const updateRowData = useCallback((rows: Row[]) => {
    setRowData(rows);
  }, []);

  const updateColumns = useCallback((cols: string[]) => {
    setColumns(cols);
  }, []);

  const undo = useCallback(() => {
    setHistoryIndex((prev) => {
      if (prev <= 0) return prev;
      const newIdx = prev - 1;
      isUndoRedoRef.current = true;
      const entry = historyRef.current[newIdx];
      setRowData(entry.rowData.map((r) => ({ ...r })));
      setColumns([...entry.columns]);
      isUndoRedoRef.current = false;
      return newIdx;
    });
  }, []);

  const redo = useCallback(() => {
    setHistoryIndex((prev) => {
      if (prev >= historyRef.current.length - 1) return prev;
      const newIdx = prev + 1;
      isUndoRedoRef.current = true;
      const entry = historyRef.current[newIdx];
      setRowData(entry.rowData.map((r) => ({ ...r })));
      setColumns([...entry.columns]);
      isUndoRedoRef.current = false;
      return newIdx;
    });
  }, []);

  const reset = useCallback(() => {
    setRowData([]);
    setColumns([]);
    setFileName(null);
    historyRef.current = [];
    setHistoryIndex(-1);
  }, []);

  return (
    <EditingContext.Provider
      value={{
        rowData,
        columns,
        fileName,
        setData,
        updateRowData,
        updateColumns,
        undo,
        redo,
        canUndo: historyIndex > 0,
        canRedo: historyIndex < historyRef.current.length - 1,
        pushHistory,
        reset,
      }}
    >
      {children}
    </EditingContext.Provider>
  );
}

export function useEditing() {
  const ctx = useContext(EditingContext);
  if (!ctx) throw new Error("useEditing must be used within EditingProvider");
  return ctx;
}
