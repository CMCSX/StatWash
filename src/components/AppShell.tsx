"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { SidebarProvider } from "@/context/SidebarContext";
import { CleaningProvider } from "@/context/CleaningContext";
import { Sidebar } from "@/components/Sidebar";
import { MainContent } from "@/components/MainContent";
import { Toaster } from "sonner";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = !mounted || resolvedTheme === "dark";

  return (
    <CleaningProvider>
      <SidebarProvider>
        {/* Fixed blurred background */}
        <div
          className="fixed inset-0 z-0 overflow-hidden"
          style={{ backgroundColor: isDark ? "#070D12" : "#f4f7f9" }}
        >
          <div
            className="absolute inset-0 opacity-60"
            style={{
              background: isDark
                ? "radial-gradient(ellipse at 20% 50%, rgba(91,102,226,0.15), transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(139,150,242,0.1), transparent 50%)"
                : "radial-gradient(ellipse at 20% 50%, rgba(91,102,226,0.08), transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(139,150,242,0.06), transparent 50%)",
              filter: "blur(8px)",
              transform: "scale(1.05)",
            }}
          />
        </div>

        <div className="relative z-10 min-h-screen">
          <Sidebar />
          <MainContent>{children}</MainContent>
        </div>
        <Toaster position="bottom-right" />
      </SidebarProvider>
    </CleaningProvider>
  );
}
