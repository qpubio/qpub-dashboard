"use client";

import { useMemo, useState } from "react";
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  Separator,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@qpub/qui/lite";
import { ArrowUp, Check, Keyboard, Play } from "lucide-react";
import { useChannel } from "@qpub/sdk/react";
import { cn } from "@/lib/utils";
import { useConsoleControlsStore } from "@/lib/console/consoleControlsStore";
import { createQueueRestClient } from "@/lib/console/queueRestClient";
import { apiKeyCredential } from "@/lib/console/sdkOptions";
import { useConsoleSocket } from "./ConsoleSocketProvider";

export function Controls() {
  const {
    apiKeys,
    selectedApiKeyId,
    setSelectedApiKeyId,
    selectedApiKey,
    host,
  } = useConsoleSocket();

  const [messageData, setMessageData] = useState("");
  const [enqueueStatus, setEnqueueStatus] = useState<string | null>(null);
  const [isEnqueueing, setIsEnqueueing] = useState(false);
  const [delay, setDelay] = useState("");
  const [alias, setAlias] = useState("");
  const [activeChannel, setActiveChannel] = useState("my-channel");

  const {
    mode,
    setMode,
    channelName,
    setChannelName,
    queueName,
    setQueueName,
    eventName,
    setEventName,
  } = useConsoleControlsStore();

  const { publish, ready, status } = useChannel(activeChannel);

  const secret = selectedApiKey ? apiKeyCredential(selectedApiKey) : null;

  const handleSendMessage = () => {
    if (ready) {
      publish(messageData, { event: eventName, alias });
      setMessageData("");
    }
  };

  const handleEnqueue = async () => {
    if (!secret || !host || !queueName || !messageData || isEnqueueing) return;
    setIsEnqueueing(true);
    setEnqueueStatus(null);
    try {
      let payload: unknown = messageData;
      try {
        payload = JSON.parse(messageData);
      } catch {
        // keep raw string
      }
      const client = createQueueRestClient(host, secret);
      const opts: { delay?: string } = {};
      if (delay.trim()) opts.delay = delay.trim();
      const result = await client.enqueue(
        queueName,
        payload,
        Object.keys(opts).length ? opts : undefined,
      );
      setEnqueueStatus(
        `Enqueued ${result.job_id.slice(0, 10)}… (${result.status})`,
      );
      setMessageData("");
    } catch (err) {
      setEnqueueStatus(err instanceof Error ? err.message : "Enqueue failed");
    } finally {
      setIsEnqueueing(false);
    }
  };

  const handleUpdateChannel = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setActiveChannel(channelName);
  };

  const canSend =
    mode === "channel"
      ? Boolean(channelName && messageData && ready)
      : Boolean(queueName && messageData && secret && host && !isEnqueueing);

  const keyOptions = useMemo(() => apiKeys, [apiKeys]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="sticky top-0 z-10 flex items-center gap-4 bg-background p-3">
        <div className="flex flex-1 items-center gap-1 text-sm text-muted">
          <Keyboard size={16} />
          Controls
        </div>
        <div className="inline-flex rounded-md border border-border p-0.5 text-xs">
          <button
            type="button"
            className={cn(
              "rounded-sm px-2.5 py-1 transition-colors",
              mode === "channel"
                ? "bg-primary/15 text-foreground"
                : "text-muted",
            )}
            onClick={() => setMode("channel")}
          >
            Channel
          </button>
          <button
            type="button"
            className={cn(
              "rounded-sm px-2.5 py-1 transition-colors",
              mode === "queue"
                ? "bg-primary/15 text-foreground"
                : "text-muted",
            )}
            onClick={() => setMode("queue")}
          >
            Queue
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="space-y-4 px-3 pt-3">
          <Select
            label="API Key"
            value={selectedApiKeyId ?? keyOptions[0]?.id ?? ""}
            onValueChange={setSelectedApiKeyId}
            disabled={keyOptions.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an API key" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>API Keys</SelectLabel>
                {keyOptions.map((key) => (
                  <SelectItem key={key.id} value={key.id}>
                    {key.name} — {key.id}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Separator />

          {mode === "channel" ? (
            <div className="space-y-4">
              <div className="relative">
                <form onSubmit={handleUpdateChannel}>
                  <Input
                    label="Channel name"
                    placeholder="eg. my-channel"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    required
                    className="pr-[90px]"
                  />
                  <Button
                    variant="light"
                    type="submit"
                    disabled={!channelName || channelName === activeChannel}
                    className="absolute bottom-0 right-0 rounded-l-none rounded-r-xs"
                  >
                    {status === "initialized" &&
                    channelName === activeChannel ? (
                      <span className="flex items-center gap-1">
                        Using <Check className="text-info" size={12} />
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        Use <Play size={12} />
                      </span>
                    )}
                  </Button>
                </form>
              </div>
              <Input
                label="Event name"
                placeholder="eg. my-event"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
              />
              <Input
                label="Alias"
                placeholder="eg. Bob"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                helperText="Optional alias name for the message"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <Input
                label="Queue name"
                placeholder="eg. emails"
                value={queueName}
                onChange={(e) => setQueueName(e.target.value)}
                required
              />
              <Input
                label="Delay"
                placeholder="eg. 30s"
                value={delay}
                onChange={(e) => setDelay(e.target.value)}
                helperText="Go duration (30s, 1m). Leave empty for now."
              />
              {enqueueStatus && (
                <div className="break-all font-mono text-xs text-muted">
                  {enqueueStatus}
                </div>
              )}
            </div>
          )}

          <div>
            <div className="mb-0.5">
              {mode === "queue" ? "Payload" : "Message"}
            </div>
            <div className="text-xs text-muted">
              {mode === "queue"
                ? "JSON preferred; plain strings are sent as-is"
                : "Write in any format (string, JSON, XML, etc.)"}
            </div>
          </div>
        </div>

        <div className="relative min-h-0 flex-1 p-3 pt-2">
          <Textarea
            value={messageData}
            onChange={(e) => setMessageData(e.target.value)}
            className="h-full min-h-[160px] resize-none font-mono text-xs"
            placeholder={
              mode === "queue"
                ? '{ "to": "user@example.com" }'
                : '{ "hello": "world" }'
            }
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                isIconOnly
                className="absolute bottom-6 right-6 rounded-full"
                aria-label={
                  mode === "queue" ? "Enqueue job" : "Send message"
                }
                disabled={!canSend}
                onClick={mode === "queue" ? handleEnqueue : handleSendMessage}
              >
                <ArrowUp className="size-5" strokeWidth={1.5} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {mode === "queue" ? "Enqueue job" : "Send message"}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
