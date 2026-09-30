"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Message, useChannel, useConnection } from "@qpub/sdk/react";
import { Button } from "@qpub/qui/lite";
import { BrushCleaning, LogsIcon, Pause, Play } from "lucide-react";
import { LogLine } from "./LogLine";
import type { EventType, ProjectLogEvent } from "@/lib/console/logTypes";

const MAX_MESSAGES = 1000;

export function Logs() {
  const { subscribe, pause, resume, paused, ready } = useChannel("_logs");
  const { connectionId } = useConnection();
  const [messages, setMessages] = useState<Message[]>([]);
  const pendingRef = useRef<Message[]>([]);
  const batchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);

  const flush = useCallback(() => {
    if (pendingRef.current.length === 0) return;
    const batch = pendingRef.current;
    pendingRef.current = [];
    setMessages((prev) => {
      const combined = [...prev, ...batch];
      return combined.length > MAX_MESSAGES
        ? combined.slice(combined.length - MAX_MESSAGES)
        : combined;
    });
    batchTimeoutRef.current = null;
  }, []);

  const onMessage = useCallback(
    (message: Message) => {
      pendingRef.current.push(message);
      if (batchTimeoutRef.current) clearTimeout(batchTimeoutRef.current);
      if (pendingRef.current.length >= 10) {
        flush();
      } else {
        batchTimeoutRef.current = setTimeout(flush, 50);
      }
    },
    [flush],
  );

  useEffect(() => {
    if (!ready) return;
    subscribe(onMessage);
    return () => {
      if (batchTimeoutRef.current) clearTimeout(batchTimeoutRef.current);
      if (pendingRef.current.length > 0) flush();
    };
  }, [ready, subscribe, onMessage, flush]);

  useEffect(() => {
    if (!stickToBottomRef.current || !listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages.length]);

  function onScroll() {
    const el = listRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottomRef.current = distance < 48;
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex items-center gap-4 px-3 py-2">
        <div className="flex flex-1 items-center gap-1 text-sm text-muted">
          <LogsIcon size={16} />
          Logs
        </div>
        <Button
          variant="light"
          size="sm"
          onClick={() => (paused ? resume() : pause({ bufferMessages: false }))}
        >
          {paused ? (
            <>
              <Play /> Resume
            </>
          ) : (
            <>
              <Pause /> Pause
            </>
          )}
        </Button>
        <Button
          variant="light"
          size="sm"
          onClick={() => setMessages([])}
          disabled={messages.length === 0}
        >
          <BrushCleaning />
          Clear
        </Button>
      </div>

      <div
        ref={listRef}
        onScroll={onScroll}
        className="min-h-0 flex-1 overflow-y-auto"
      >
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center p-8 text-sm text-muted">
            {ready ? "Waiting for events on _logs…" : "Connecting to _logs…"}
          </div>
        ) : (
          messages.map((message, i) => (
            <LogLine
              key={`${message.timestamp ?? i}-${i}`}
              currentConnectionId={connectionId}
              log={(message.data ?? {}) as ProjectLogEvent}
              event={(message.event as EventType) ?? "unknown"}
              timestamp={message.timestamp ?? ""}
            />
          ))
        )}
      </div>
    </div>
  );
}
