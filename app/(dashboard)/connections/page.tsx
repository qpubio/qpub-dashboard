"use client";

import { DataPanel } from "@/components/shared/DataPanel";
import { PageHeader } from "@/components/shared/PageHeader";
import { TenantScopePicker } from "@/components/shared/TenantScopePicker";
import { useTenantScope } from "@/lib/hooks/useTenantScope";
import { controlGet } from "@/lib/hooks/useControl";
import type { ChannelSummary, ConnectionSummary } from "@/lib/control/types";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@qpub/qui/lite";

export default function ConnectionsPage() {
  const scope = useTenantScope();
  const { serverId, tenantId, ready } = scope;

  const {
    data: connections,
    isError: connError,
    error: connErr,
  } = useQuery({
    queryKey: ["connections", serverId, tenantId],
    enabled: ready,
    refetchInterval: 3000,
    queryFn: () =>
      controlGet<{ connections: ConnectionSummary[] }>(
        serverId!,
        `tenants/${tenantId}/connections?page=1&per_page=100`,
      ),
  });

  const {
    data: channels,
    isError: chError,
    error: chErr,
  } = useQuery({
    queryKey: ["channels", serverId, tenantId],
    enabled: ready,
    refetchInterval: 5000,
    queryFn: () =>
      controlGet<{ channels: ChannelSummary[] }>(
        serverId!,
        `tenants/${tenantId}/channels?page=1&per_page=100`,
      ),
  });

  return (
    <div>
      <PageHeader title="Connections" description="Live WebSocket connections and local channels." />
      <TenantScopePicker
        serverId={scope.serverId}
        tenantId={scope.tenantId}
        setTenantId={scope.setTenantId}
        tenants={scope.tenants}
        isLoading={scope.isLoading}
      />
      {connError ? (
        <p className="mb-4 text-sm text-destructive">
          {connErr instanceof Error ? connErr.message : "Failed to load connections."}
        </p>
      ) : null}
      {chError ? (
        <p className="mb-4 text-sm text-destructive">
          {chErr instanceof Error ? chErr.message : "Failed to load channels."}
        </p>
      ) : null}
      <Tabs defaultValue="connections">
        <TabsList>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
        </TabsList>
        <TabsContent value="connections">
          <DataPanel>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Remote</TableHead>
                  <TableHead>User agent</TableHead>
                  <TableHead>Msgs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(connections?.connections ?? []).map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs">{c.id}</TableCell>
                    <TableCell>{c.state}</TableCell>
                    <TableCell className="font-mono text-xs">{c.remote_addr}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs">{c.user_agent}</TableCell>
                    <TableCell className="font-mono text-xs">
                      ↑{c.messages_sent} ↓{c.messages_recv}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DataPanel>
        </TabsContent>
        <TabsContent value="channels">
          <DataPanel>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Subs</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Last activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(channels?.channels ?? []).map((ch) => (
                  <TableRow key={ch.id}>
                    <TableCell className="font-mono">{ch.name}</TableCell>
                    <TableCell>{ch.local_subscriptions}</TableCell>
                    <TableCell>{ch.is_active ? "yes" : "no"}</TableCell>
                    <TableCell className="text-xs text-muted">{ch.last_activity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DataPanel>
        </TabsContent>
      </Tabs>
    </div>
  );
}
