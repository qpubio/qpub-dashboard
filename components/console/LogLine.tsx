"use client";

import { memo, useState } from "react";
import {
  Badge,
  Button,
  Collapsible,
  CollapsibleContent,
  CopyButton,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@qpub/qui/lite";
import { ChevronDown, CornerDownRight } from "lucide-react";
import type { EventType, ProjectLogEvent } from "@/lib/console/logTypes";

function getEventColor(
  event: EventType,
): "success" | "info" | "warning" | "error" {
  if (
    event.includes("error") ||
    event.includes("dlq") ||
    event.includes("nacked")
  ) {
    return "error";
  }
  if (
    event.includes("closed") ||
    event.includes("disconnected") ||
    event.includes("cancelled")
  ) {
    return "warning";
  }
  if (
    event.includes("created") ||
    event.includes("opened") ||
    event.includes("enqueued") ||
    event.includes("claimed") ||
    event.includes("registered")
  ) {
    return "info";
  }
  return "success";
}

function formatTs(timestamp: string) {
  if (!timestamp) return "";
  try {
    return new Date(timestamp).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return timestamp;
  }
}

export const LogLine = memo(function LogLine({
  log,
  event,
  timestamp,
  currentConnectionId,
}: {
  log: ProjectLogEvent;
  event: EventType;
  timestamp: string;
  currentConnectionId: string | null;
}) {
  const [open, setOpen] = useState(false);
  const logToCopy = { event, timestamp, ...log };
  const badgeLabel = event.startsWith("queue.")
    ? event.replace(/^queue\./, "")
    : (event.split(".")[1] ?? event);

  return (
    <div className="relative border-b border-border p-3 font-mono text-sm hover:bg-accent/80">
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs text-muted">{formatTs(timestamp)}</div>
          <Badge variant="flat" size="sm" color={getEventColor(event)}>
            {badgeLabel}
          </Badge>
        </div>

        <div>{log.message}</div>
        {log.error && (
          <div className="text-error">
            <CornerDownRight size={14} className="inline-block" />
            &quot;{log.error.message}&quot;
          </div>
        )}

        {log.queue ? (
          <>
            <div className="text-xs text-muted">
              Queue:{" "}
              <span className="text-foreground/90">{log.queue.queue_name}</span>
            </div>
            {log.queue.job_id && (
              <div className="pb-2 text-xs text-muted">
                Job:{" "}
                <span className="text-foreground/90">{log.queue.job_id}</span>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="text-xs text-muted">
              Connection ID:{" "}
              <span className="text-foreground/90">
                {log.connection?.connection_id}
              </span>
              {currentConnectionId === log.connection?.connection_id && (
                <span> (current)</span>
              )}
            </div>
            <div className="pb-2 text-xs text-muted">
              API Key:{" "}
              <span className="text-foreground/90">
                {log.connection?.api_key}
              </span>
            </div>
          </>
        )}

        <CollapsibleContent className="space-y-0.5 pt-2 text-xs text-muted">
          {log.queue?.worker_id && (
            <div>
              Worker ID:{" "}
              <span className="text-foreground/90">{log.queue.worker_id}</span>
            </div>
          )}
          {log.queue?.worker_name && (
            <div>
              Worker:{" "}
              <span className="text-foreground/90">{log.queue.worker_name}</span>
            </div>
          )}
          {log.queue?.status && (
            <div>
              Status:{" "}
              <span className="text-foreground/90">{log.queue.status}</span>
            </div>
          )}
          {log.connection?.client_id && (
            <div>
              Client ID:{" "}
              <span className="text-foreground/90">
                {log.connection.client_id}
              </span>
            </div>
          )}
          {log.connection?.channel && (
            <div>
              Channel:{" "}
              <span className="text-foreground/90">
                {log.connection.channel}
              </span>
            </div>
          )}
          {log.source?.remote_addr && (
            <div>
              Remote:{" "}
              <span className="text-foreground/90">
                {log.source.remote_addr}
              </span>
            </div>
          )}
          {log.instance?.site && (
            <div>
              Site:{" "}
              <span className="text-foreground/90">{log.instance.site}</span>
            </div>
          )}
        </CollapsibleContent>

        <div className="absolute bottom-2 right-2.5 flex gap-1">
          <CopyButton text={JSON.stringify(logToCopy)} size="sm" appearance="light" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="light"
                isIconOnly
                aria-label="Toggle details"
                onClick={() => setOpen((v) => !v)}
              >
                <ChevronDown
                  strokeWidth={1.5}
                  className={`size-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle details</TooltipContent>
          </Tooltip>
        </div>
      </Collapsible>
    </div>
  );
});
