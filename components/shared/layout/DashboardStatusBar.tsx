"use client";

import { StatusBar, StatusBarSegment, StatusBarSpacer } from "@qpub/qui/lite";
import { useOverview } from "@/lib/hooks/useOverview";
import { useUiStore } from "@/lib/stores/uiStore";
import { useServers } from "@/lib/hooks/useServers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@qpub/qui/lite";

export function DashboardStatusBar() {
  const { data: overview } = useOverview();
  const { data: servers } = useServers();
  const serverScope = useUiStore((s) => s.serverScope);
  const setServerScope = useUiStore((s) => s.setServerScope);
  const setCommandOpen = useUiStore((s) => s.setCommandOpen);

  const healthy = overview?.healthyCount ?? 0;
  const total = overview?.servers.length ?? 0;
  const tone =
    healthy === total && total > 0
      ? "success"
      : total === 0
        ? "warning"
        : "warning";

  return (
    <StatusBar className="shrink-0 border-t border-border">
      <StatusBarSegment tone={tone as "success" | "warning"}>
        ● {healthy}/{total} servers
      </StatusBarSegment>
      <StatusBarSegment>
        tenants {overview?.tenantCount ?? "—"}
      </StatusBarSegment>
      <StatusBarSegment>
        msg:in {overview?.stats["msg:in"] ?? 0}
      </StatusBarSegment>
      <StatusBarSpacer />
      <div className="flex items-center gap-2 px-2">
        <Select
          value={serverScope}
          onValueChange={(v) => setServerScope(v as "all" | string)}
        >
          <SelectTrigger className="h-7 w-[160px] text-xs">
            <SelectValue placeholder="Scope" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All servers</SelectItem>
            {(servers?.servers ?? []).map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <button
          type="button"
          className="font-mono text-xs text-muted hover:text-foreground"
          onClick={() => setCommandOpen(true)}
        >
          ⌘K
        </button>
      </div>
    </StatusBar>
  );
}
