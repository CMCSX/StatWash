"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Settings,
  Table,
  Sparkles,
  FileText,
  PenLine,
} from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";

const cleaningSubItems = [
  { path: "/cleaning/account-status-bel", label: "Account Status BEL" },
  { path: "/cleaning/ada-penalty", label: "ADA Penalty" },
  { path: "/cleaning/bsp-attestation", label: "BSP Attestation" },
  { path: "/cleaning/ptp-report-bel", label: "PTP Report BEL" },
  { path: "/cleaning/ptp-inventory-bel", label: "PTP Inventory BEL" },
  { path: "/cleaning/cards-attendance", label: "Cards Attendance" },
  { path: "/cleaning/field-visit-report-bel", label: "Field Visit Report BEL" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { setIsOpen } = useSidebar();
  const [isHovered, setIsHovered] = useState(false);

  const collapsed = !isHovered;

  const isActive = (path: string) => pathname === path;
  const isCleaningActive = pathname.startsWith("/cleaning");

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed left-0 top-16 z-50 flex h-[calc(100vh-4rem)] flex-col border-r bg-white dark:bg-[#070D12] border-gray-200 dark:border-white/10 transition-[width] duration-200 ease-out translate-x-0 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {/* Data Viewing */}
        <Link
          href="/data-viewing"
          onClick={() => setIsOpen(false)}
          title={collapsed ? "Data Viewing" : undefined}
          className={`${collapsed ? "mb-4" : "mb-2"} flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200 ${
            collapsed ? "justify-center px-2" : ""
          } ${
            isActive("/data-viewing")
              ? "bg-[#5B66E2] text-white shadow-lg shadow-[#5B66E2]/30"
              : "text-gray-500 dark:text-[#939393] hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white hover:translate-x-1"
          }`}
        >
          <Table className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium">Data Viewing</span>}
        </Link>

        {/* Cleaning - collapsible */}
        <div className={collapsed ? "mb-4" : "mb-2"}>
          <div
            title={collapsed ? "Cleaning" : undefined}
            className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200 ${
              collapsed ? "justify-center px-2" : ""
            } ${
              isCleaningActive
                ? "bg-[#5B66E2] text-white shadow-lg shadow-[#5B66E2]/30"
                : "text-gray-500 dark:text-[#939393]"
            }`}
          >
            <Sparkles className="h-5 w-5 flex-shrink-0" />
            {!collapsed && (
              <span className="font-medium flex-1 text-left">Cleaning</span>
            )}
          </div>

          {/* Sub-items — always visible when expanded */}
          {!collapsed && (
            <div className="mt-1 ml-4 border-l-2 border-gray-200 dark:border-white/10 pl-3 space-y-0.5">
              {cleaningSubItems.map((sub) => (
                <Link
                  key={sub.path}
                  href={sub.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                    isActive(sub.path)
                      ? "bg-[#5B66E2]/10 text-[#5B66E2] font-medium"
                      : "text-gray-500 dark:text-[#939393] hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">{sub.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Editing */}
        <Link
          href="/editing"
          onClick={() => setIsOpen(false)}
          title={collapsed ? "Editing" : undefined}
          className={`${collapsed ? "mb-4" : "mb-2"} flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200 ${
            collapsed ? "justify-center px-2" : ""
          } ${
            isActive("/editing")
              ? "bg-[#5B66E2] text-white shadow-lg shadow-[#5B66E2]/30"
              : "text-gray-500 dark:text-[#939393] hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white hover:translate-x-1"
          }`}
        >
          <PenLine className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium">Editing</span>}
        </Link>

        {/* Settings */}
        <Link
          href="/settings"
          onClick={() => setIsOpen(false)}
          title={collapsed ? "Settings" : undefined}
          className={`${collapsed ? "mb-4" : "mb-2"} flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200 ${
            collapsed ? "justify-center px-2" : ""
          } ${
            isActive("/settings")
              ? "bg-[#5B66E2] text-white shadow-lg shadow-[#5B66E2]/30"
              : "text-gray-500 dark:text-[#939393] hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white hover:translate-x-1"
          }`}
        >
          <Settings className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium">Settings</span>}
        </Link>
      </nav>
    </aside>
  );
}
