"use client";

import { FileUploadZone } from "@/components/FileUploadZone";
import { useCleaning } from "@/context/CleaningContext";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const { files, isProcessing } = useCleaning();
  const router = useRouter();

  return (
    <div className="px-4 sm:px-8 py-8 flex flex-col items-center">
      <div className="mb-8 animate-fade-in-up text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Upload
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-[#939393]">
          Upload an Excel file to automatically detect its type, clean the data, and prepare it for export
        </p>
      </div>

      <div className="w-full max-w-2xl animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
        <FileUploadZone />
      </div>

      {/* Link to view uploaded files */}
      {files.length > 0 && !isProcessing && (
        <div className="mt-6 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
          <button
            onClick={() => router.push("/data-viewing")}
            className="flex items-center gap-2 rounded-lg bg-[#5B66E2] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#4A55D1] transition-colors shadow-lg shadow-[#5B66E2]/30"
          >
            View {files.length} uploaded file{files.length > 1 ? "s" : ""} →
          </button>
        </div>
      )}

      {/* Supported file types info */}
      <div className="mt-8 w-full max-w-2xl animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          Supported File Types
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { name: "Account Status BEL", desc: "Account status tracking with balances and due dates" },
            { name: "ADA Penalty", desc: "Penalty records with violation dates and amounts" },
            { name: "BSP Attestation", desc: "BSP compliance attestation records" },
            { name: "PTP Report BEL", desc: "Promise-to-pay reports with agent tracking" },
            { name: "PTP Inventory BEL", desc: "PTP inventory with paid amounts and balances" },
            { name: "Cards Attendance", desc: "Employee attendance with time tracking" },
            { name: "Field Visit Report BEL", desc: "Field visit reports with findings and dispositions" },
          ].map((ft) => (
            <div
              key={ft.name}
              className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-sm p-4"
            >
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {ft.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-[#939393] mt-1">
                {ft.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
