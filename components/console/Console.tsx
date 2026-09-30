"use client";

import Link from "next/link";
import { useConsoleSocket } from "./ConsoleSocketProvider";
import { Controls } from "./Controls";
import { Logs } from "./Logs";
import { ConnectionStatus, ConnectionStatusIdle } from "./ConnectionStatus";
import { env } from "@/config/env";
import { apiKeyCredential } from "@/lib/console/sdkOptions";

function ConsoleConnected() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <ConnectionStatus />
      </div>
      <div className="grid min-h-[calc(100vh-280px)] grid-cols-1 overflow-hidden rounded-lg border border-border bg-background lg:grid-cols-2">
        <div className="min-h-[360px] overflow-y-auto border-b border-border lg:border-b-0 lg:border-r">
          <Controls />
        </div>
        <div className="min-h-[360px]">
          <Logs />
        </div>
      </div>
    </div>
  );
}

function ConsoleDisconnected({ reason }: { reason: string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <ConnectionStatusIdle label="disconnected" />
      </div>
      <div className="rounded-lg border border-border p-8 text-center">
        <p className="text-sm text-muted">{reason}</p>
        <p className="mt-2 text-xs text-muted">
          SDK WebSocket port defaults to {env.sdkWsPort}. Check firewall and{" "}
          <code className="font-mono">NEXT_PUBLIC_QPUB_SDK_*</code> env vars.
        </p>
      </div>
    </div>
  );
}

export function Console() {
  const { host, selectedApiKey, apiKeys, keysLoading, tenantId } =
    useConsoleSocket();

  if (keysLoading) {
    return <p className="text-sm text-muted">Loading API keys…</p>;
  }

  if (!host) {
    return (
      <ConsoleDisconnected reason="Could not derive SDK host from the server control URL." />
    );
  }

  if (apiKeys.length === 0) {
    return (
      <div className="rounded-lg border border-border p-8 text-center">
        <p className="text-sm text-muted">No API keys for this tenant.</p>
        <Link
          href={`/api-keys?tenant=${tenantId}`}
          className="mt-2 inline-block text-sm text-primary underline"
        >
          Create an API key
        </Link>
      </div>
    );
  }

  if (!selectedApiKey || !apiKeyCredential(selectedApiKey)) {
    return (
      <ConsoleDisconnected reason="Selected API key has no secret. Create or rotate a key, then try again." />
    );
  }

  return <ConsoleConnected />;
}
