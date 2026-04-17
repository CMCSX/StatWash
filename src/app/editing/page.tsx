"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
  type ColDef,
  type CellValueChangedEvent,
  type GridReadyEvent,
  type GridApi,
} from "ag-grid-community";
import {
  Upload,
  Download,
  Plus,
  Trash2,
  Undo2,
  Redo2,
  FileSpreadsheet,
} from "lucide-react";
import { parseExcelFile } from "@/services/fileParser";
import { exportToExcel, exportToCSV } from "@/services/fileExporter";
import { detectFileType } from "@/services/cleaningEngine";
import FILE_TYPE_CONFIGS from "@/config/fileTypes";
import { useEditing } from "@/context/EditingContext";

ModuleRegistry.registerModules([AllCommunityModule]);

const gridTheme = themeQuartz;

type Row = Record<string, unknown>;

export default function EditingPage() {
  const {
    rowData,
    columns,
    fileName,
    setData,
    updateRowData,
    updateColumns,
    undo,
    redo,
    canUndo,
    canRedo,
    pushHistory,
  } = useEditing();

  const [showExportMenu, setShowExportMenu] = useState(false);
  const gridApiRef = useRef<GridApi | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(
    async (file: File) => {
      const buffer = await file.arrayBuffer();
      const sheets = parseExcelFile(buffer);
      const sheet = sheets.find((s) => s.rows.length > 0) ?? sheets[0];
      if (!sheet || sheet.rows.length === 0) return;

      const cols = sheet.headers;

      // Detect date columns via file type config or column name heuristics
      const detectedType = detectFileType(cols);
      const configDateCols = detectedType
        ? new Set(FILE_TYPE_CONFIGS[detectedType].dateColumns.map((c) => c.toLowerCase()))
        : new Set<string>();
      const dateKeywords = ["date", "due", "follow up", "visit", "attestation", "violation", "payment"];
      const isDateCol = (col: string) => {
        const lower = col.toLowerCase();
        return configDateCols.has(lower) || dateKeywords.some((kw) => lower.includes(kw));
      };

      // Fill blank date entries with placeholder
      const data = sheet.rows.map((row) => {
        const newRow = { ...row };
        for (const col of cols) {
          if (isDateCol(col)) {
            const val = newRow[col];
            if (val === null || val === undefined || val === "") {
              newRow[col] = "dd/mm/yyyy";
            }
          }
        }
        return newRow;
      });

      setData(data, cols, file.name);
    },
    [setData]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFileUpload(file);
    },
    [handleFileUpload]
  );

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileUpload(file);
      e.target.value = "";
    },
    [handleFileUpload]
  );

  const onGridReady = useCallback((params: GridReadyEvent) => {
    gridApiRef.current = params.api;
  }, []);

  const onCellValueChanged = useCallback(
    (event: CellValueChangedEvent) => {
      const updatedData: Row[] = [];
      gridApiRef.current?.forEachNode((node) => {
        if (node.data) updatedData.push(node.data);
      });
      updateRowData(updatedData);
      pushHistory(updatedData, columns);
    },
    [columns, updateRowData, pushHistory]
  );

  const addRow = useCallback(() => {
    const newRow: Row = {};
    columns.forEach((col) => (newRow[col] = ""));
    const updated = [...rowData, newRow];
    updateRowData(updated);
    pushHistory(updated, columns);
    setTimeout(() => {
      gridApiRef.current?.ensureIndexVisible(updated.length - 1, "bottom");
    }, 50);
  }, [rowData, columns, updateRowData, pushHistory]);

  const deleteSelectedRows = useCallback(() => {
    const selectedNodes = gridApiRef.current?.getSelectedNodes() ?? [];
    if (selectedNodes.length === 0) return;
    const selectedIndices = new Set(selectedNodes.map((n) => n.rowIndex));
    const updated = rowData.filter((_, i) => !selectedIndices.has(i));
    updateRowData(updated);
    pushHistory(updated, columns);
  }, [rowData, columns, updateRowData, pushHistory]);

  const addColumn = useCallback(() => {
    const name = prompt("Column name:");
    if (!name || columns.includes(name)) return;
    const newCols = [...columns, name];
    const newData = rowData.map((r) => ({ ...r, [name]: "" }));
    updateColumns(newCols);
    updateRowData(newData);
    pushHistory(newData, newCols);
  }, [rowData, columns, updateRowData, updateColumns, pushHistory]);

  const handleExport = useCallback(
    (format: "xlsx" | "csv") => {
      if (!rowData.length || !fileName) return;
      if (format === "xlsx") {
        exportToExcel(rowData, columns, fileName);
      } else {
        exportToCSV(rowData, columns, fileName);
      }
      setShowExportMenu(false);
    },
    [rowData, columns, fileName]
  );

  const columnDefs: ColDef[] = useMemo(
    () =>
      columns.map((col) => ({
        field: col,
        headerName: col,
        editable: true,
        sortable: true,
        filter: true,
        resizable: true,
        minWidth: 120,
      })),
    [columns]
  );

  const defaultColDef: ColDef = useMemo(
    () => ({
      flex: 1,
      minWidth: 100,
      editable: true,
      sortable: true,
      filter: true,
      resizable: true,
    }),
    []
  );

  return (
    <div className="px-4 sm:px-8 py-8 h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Editing
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-[#939393]">
            {fileName
              ? `${fileName} — ${rowData.length} rows, ${columns.length} columns`
              : "Upload an Excel file to start editing"}
          </p>
        </div>

        {rowData.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Undo"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Redo"
            >
              <Redo2 className="h-4 w-4" />
            </button>
            <div className="w-px h-6 bg-gray-200 dark:bg-white/10" />
            <button
              onClick={addRow}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              <Plus className="h-4 w-4" /> Row
            </button>
            <button
              onClick={addColumn}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              <Plus className="h-4 w-4" /> Column
            </button>
            <button
              onClick={deleteSelectedRows}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="h-4 w-4" /> Delete Selected
            </button>
            <div className="w-px h-6 bg-gray-200 dark:bg-white/10" />
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 rounded-lg bg-[#5B66E2] px-4 py-2 text-sm font-medium text-white hover:bg-[#4A55D1] transition-colors shadow-lg shadow-[#5B66E2]/30"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0D1117] shadow-xl z-50 overflow-hidden">
                  <button
                    onClick={() => handleExport("xlsx")}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                    Export as .xlsx
                  </button>
                  <button
                    onClick={() => handleExport("csv")}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <FileSpreadsheet className="h-4 w-4 text-blue-500" />
                    Export as .csv
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {rowData.length === 0 ? (
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 flex flex-col items-center justify-center cursor-pointer rounded-2xl border-2 border-dashed border-gray-300 dark:border-white/20 hover:border-[#5B66E2] dark:hover:border-[#5B66E2] transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={onFileChange}
            className="hidden"
          />
          <Upload className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Upload Excel File
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-[#939393]">
            Drag & drop or click to browse. Supports .xlsx, .xls, .csv
          </p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            onGridReady={onGridReady}
            onCellValueChanged={onCellValueChanged}
            rowSelection="multiple"
            animateRows={false}
            pagination={true}
            paginationPageSize={50}
            paginationPageSizeSelector={[25, 50, 100, 500]}
            theme={gridTheme}
          />
        </div>
      )}
    </div>
  );
}
