"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Button,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@qpub/qui/lite";
import { navItems } from "./nav";
import { LogOut } from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { ThemeToggle } from "./ThemeToggle";

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await apiFetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-border px-3 py-3">
        <div className="font-mono text-sm font-semibold tracking-tight text-foreground">
          qpub-dashboard
        </div>
        <div className="text-xs text-muted">control plane</div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link href={item.href}>
                        <item.icon className="size-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border p-2 space-y-1">
        <ThemeToggle />
        <Button variant="ghost" className="w-full justify-start" onClick={logout}>
          <LogOut className="size-4" />
          Log out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
