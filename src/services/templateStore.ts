/**
 * IndexedDB service for persisting template files per file type.
 * Templates are cleaned reference files uploaded by the user in Settings.
 * Each file type can have exactly one template.
 */

import type { FileType } from "@/types";

const DB_NAME = "StatWashTemplates";
const DB_VERSION = 1;
const STORE_NAME = "templates";

export interface StoredTemplate {
  fileType: FileType;
  fileName: string;
  /** Parsed column names from the template */
  columns: string[];
  /** Sample rows from the template (first 500 rows for reference) */
  sampleData: Record<string, unknown>[];
  /** Full row count */
  totalRows: number;
  /** When the template was uploaded */
  uploadedAt: number;
}

function openDB(): Promise<IDBDatabase> {
  // Clean up old database from rename
  try {
    indexedDB.deleteDatabase("DataCleanTemplates");
  } catch {
    // ignore
  }
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "fileType" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** Save or overwrite a template for a file type */
export async function saveTemplate(template: StoredTemplate): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(template);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Retrieve a template for a file type (or null if none exists) */
export async function getTemplate(
  fileType: FileType
): Promise<StoredTemplate | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(fileType);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

/** Retrieve all stored templates */
export async function getAllTemplates(): Promise<StoredTemplate[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Delete a template for a file type */
export async function deleteTemplate(fileType: FileType): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(fileType);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
