"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { SocketProvider } from "@qpub/sdk/react";
import { useQuery } from "@tanstack/react-query";
import { controlGet } from "@/lib/hooks/useControl";
import { useServers } from "@/lib/hooks/useServers";
import type { APIKey } from "@/lib/control/types";
import { hostFromControlUrl, socketOptions, apiKeyCredential } from "@/lib/console/sdkOptions";

interface ConsoleSocketContextValue {
  serverId: string;
  tenantId: string;
  host: string | null;
  apiKeys: APIKey[];
  selectedApiKeyId: string | null;
  setSelectedApiKeyId: (id: string) => void;
  selectedApiKey: APIKey | null;
  keysLoading: boolean;
}

const ConsoleSocketContext = createContext<ConsoleSocketContextValue | null>(
  null,
);

export function useConsoleSocket() {
  const ctx = useContext(ConsoleSocketContext);
  if (!ctx) {
    throw new Error("useConsoleSocket must be used within ConsoleSocketProvider");
  }
  return ctx;
}

export function ConsoleSocketProvider({
  serverId,
  tenantId,
  children,
}: {
  serverId: string;
  tenantId: string;
  children: React.ReactNode;
}) {
  const { data: serversData } = useServers();
  const server = serversData?.servers.find((s) => s.id === serverId);
  const host = server ? hostFromControlUrl(server.control_url) : null;

  const { data: apiKeys = [], isLoading: keysLoading } = useQuery({
    queryKey: ["console-keys", serverId, tenantId],
    enabled: Boolean(serverId && tenantId),
    queryFn: async () => {
      const res = await controlGet<{ keys: APIKey[] }>(
        serverId,
        `tenants/${tenantId}/keys`,
      );
      return res.keys;
    },
  });

  const [selectedApiKeyId, setSelectedApiKeyId] = useState<string | null>(null);

  useEffect(() => {
    if (!apiKeys.length) {
      setSelectedApiKeyId(null);
      return;
    }
    const stillValid =
      selectedApiKeyId && apiKeys.some((k) => k.id === selectedApiKeyId);
    if (!stillValid) {
      setSelectedApiKeyId(apiKeys[0].id);
    }
  }, [apiKeys, selectedApiKeyId]);

  const selectedApiKey = useMemo(
    () => apiKeys.find((k) => k.id === selectedApiKeyId) ?? apiKeys[0] ?? null,
    [apiKeys, selectedApiKeyId],
  );

  const secret = selectedApiKey ? apiKeyCredential(selectedApiKey) : null;
  const hasKey = Boolean(secret && host);

  const value: ConsoleSocketContextValue = {
    serverId,
    tenantId,
    host,
    apiKeys,
    selectedApiKeyId,
    setSelectedApiKeyId,
    selectedApiKey,
    keysLoading,
  };

  return (
    <ConsoleSocketContext.Provider value={value}>
      {hasKey && secret && host ? (
        <SocketProvider
          key={selectedApiKeyId ?? "no-key"}
          options={socketOptions(secret, host)}
        >
          {children}
        </SocketProvider>
      ) : (
        children
      )}
    </ConsoleSocketContext.Provider>
  );
}
