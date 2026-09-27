"use client";

import { CommandPalette } from "@/components/shared/layout/CommandPalette";
import { DashboardSidebar } from "@/components/shared/layout/DashboardSidebar";
import { DashboardStatusBar } from "@/components/shared/layout/DashboardStatusBar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@qpub/qui/lite";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset className="flex min-h-screen flex-col">
        <header className="flex h-10 shrink-0 items-center gap-2 border-b border-border px-3 md:hidden">
          <SidebarTrigger className="-ml-1" />
          <span className="font-mono text-sm">qpub-dashboard</span>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-6">{children}</div>
        <DashboardStatusBar />
      </SidebarInset>
      <CommandPalette />
    </SidebarProvider>
  );
}
