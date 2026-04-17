/**
 * IndexedDB service for persisting the current session's uploaded files.
 * Files are stored so they survive page refreshes and browser restarts.
 */

import type { CleaningResult } from "@/types";

const DB_NAME = "DataCleanSession";
const DB_VERSION = 1;
const STORE_NAME = "files";

export interface StoredFileEntry {
  /** Auto-increment key */
  id?: number;
  fileName: string;
  result: CleaningResult;
  /** Order index for maintaining tab order */
  order: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** Save all current files (replaces everything in the store) */
export async function saveSessionFiles(
  files: { fileName: string; result: CleaningResult }[]
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.clear();
    files.forEach((file, i) => {
      store.add({ fileName: file.fileName, result: file.result, order: i });
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Load all persisted files in order */
export async function loadSessionFiles(): Promise<
  { fileName: string; result: CleaningResult }[]
> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => {
      const entries = (req.result as StoredFileEntry[]).sort(
        (a, b) => a.order - b.order
      );
      resolve(entries.map((e) => ({ fileName: e.fileName, result: e.result })));
    };
    req.onerror = () => reject(req.error);
  });
}

/** Clear all persisted session files */
export async function clearSessionFiles(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
