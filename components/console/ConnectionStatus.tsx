"use client";

import { CloudAlert, CloudCheck, CloudCog, CloudOff } from "lucide-react";
import { useConnection } from "@qpub/sdk/react";

export function ConnectionStatus() {
  const { status } = useConnection();

  const color =
    status === "connected"
      ? "text-success"
      : status === "connecting"
        ? "text-warning"
        : status === "failed"
          ? "text-error"
          : "text-muted";

  const Icon =
    status === "connected"
      ? CloudCheck
      : status === "connecting"
        ? CloudCog
        : status === "failed"
          ? CloudAlert
          : CloudOff;

  return (
    <div className={`flex items-center gap-1 text-xs capitalize ${color}`}>
      <Icon size={14} />
      {status}
    </div>
  );
}

export function ConnectionStatusIdle({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1 text-xs text-muted">
      <CloudOff size={14} />
      {label}
    </div>
  );
}
