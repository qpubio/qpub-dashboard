"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useActiveServerId } from "@/components/shared/ServerScopePicker";
import {
  LogViewer,
  Prompt,
  Terminal,
  TerminalBody,
  TerminalTitleBar,
} from "@qpub/qui/lite";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@qpub/qui/lite";
import { useServers } from "@/lib/hooks/useServers";

type LogItem = { id: string; level: "info" | "error"; message: string };

export default function ConsolePage() {
  const defaultServer = useActiveServerId();
  const { data: servers } = useServers();
  const [serverId, setServerId] = useState(defaultServer ?? "");
  const [method, setMethod] = useState("GET");
  const [path, setPath] = useState("tenants");
  const [body, setBody] = useState("");
  const [logs, setLogs] = useState<LogItem[]>([]);

  async function run(command: string) {
    const trimmed = command.trim();
    if (trimmed) {
      const parts = trimmed.split(/\s+/);
      await execute(
        parts[0].toUpperCase(),
        parts.slice(1).join(" ") || path,
        body,
      );
      return;
    }
    await execute(method, path, body);
  }

  async function execute(m: string, p: string, b: string) {
    if (!serverId) return;
    const clean = p.replace(/^\/control\/v1\/?/, "").replace(/^\//, "");
    const url = `/api/control/${serverId}/${clean}`;
    try {
      const res = await fetch(url, {
        method: m,
        headers: { "Content-Type": "application/json" },
        body: m === "GET" || m === "DELETE" ? undefined : b || undefined,
      });
      const text = await res.text();
      setLogs((prev) => [
        {
          id: crypto.randomUUID(),
          level: res.ok ? "info" : "error",
          message: `$ ${m} /control/v1/${clean}\nHTTP ${res.status}\n${text}`,
        },
        ...prev,
      ]);
    } catch (e) {
      setLogs((prev) => [
        {
          id: crypto.randomUUID(),
          level: "error",
          message: String(e),
        },
        ...prev,
      ]);
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Debug Console"
        description="Execute Control API requests against a selected server."
      />
      <div className="flex flex-wrap gap-2">
        <Select value={serverId} onValueChange={setServerId}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Server" />
          </SelectTrigger>
          <SelectContent>
            {(servers?.servers ?? []).map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={method} onValueChange={setMethod}>
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["GET", "POST", "PUT", "DELETE"].map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input
          className="min-w-[240px] flex-1 border border-border bg-background px-2 py-1 font-mono text-sm"
          value={path}
          onChange={(e) => setPath(e.target.value)}
          placeholder="tenants/1/queues"
        />
      </div>
      <textarea
        className="h-24 w-full border border-border bg-background p-2 font-mono text-xs"
        placeholder="Request body JSON (POST/PUT)"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <Terminal className="min-h-[420px]">
        <TerminalTitleBar title="control-api" />
        <TerminalBody className="p-0">
          <LogViewer
            items={logs.map((l) => ({
              id: l.id,
              level: l.level,
              message: l.message,
            }))}
            className="h-[320px]"
          />
        </TerminalBody>
        <Prompt prefix=">" placeholder={`${method} ${path}`} onSubmit={run} />
      </Terminal>
    </div>
  );
}
