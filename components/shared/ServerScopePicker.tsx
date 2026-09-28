"use client";

import { useUiStore } from "@/lib/stores/uiStore";
import { useServers } from "@/lib/hooks/useServers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@qpub/qui/lite";

export function ServerScopePicker({ required }: { required?: boolean }) {
  const serverScope = useUiStore((s) => s.serverScope);
  const setServerScope = useUiStore((s) => s.setServerScope);
  const { data } = useServers();
  const servers = data?.servers ?? [];

  if (required && serverScope === "all" && servers[0]) {
    // Prefer first server when a specific server is required for API calls.
  }

  return (
    <Select
      value={serverScope}
      onValueChange={(v) => setServerScope(v as "all" | string)}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Server scope" />
      </SelectTrigger>
      <SelectContent>
        {!required ? <SelectItem value="all">All servers</SelectItem> : null}
        {servers.map((s) => (
          <SelectItem key={s.id} value={s.id}>
            {s.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function useActiveServerId(): string | null {
  const serverScope = useUiStore((s) => s.serverScope);
  const { data } = useServers();
  if (serverScope !== "all") return serverScope;
  return data?.servers[0]?.id ?? null;
}
