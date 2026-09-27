"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useActiveServerId } from "@/components/shared/ServerScopePicker";
import { controlGet } from "@/lib/hooks/useControl";
import type { ChannelSummary, ConnectionSummary } from "@/lib/control/types";
import { useQuery } from "@tanstack/react-query";
import { Input, Label, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Tabs, TabsContent, TabsList, TabsTrigger } from "@qpub/qui/lite";

export default function ConnectionsPage() {
  const serverId = useActiveServerId();
  const [tenantInput, setTenantInput] = useState("1");
  const tid = Number(tenantInput) || 1;

  const { data: connections } = useQuery({
    queryKey: ["connections", serverId, tid],
    enabled: Boolean(serverId),
    refetchInterval: 3000,
    queryFn: () =>
      controlGet<{ connections: ConnectionSummary[] }>(
        serverId!,
        `tenants/${tid}/connections?page=1&per_page=100`,
      ),
  });

  const { data: channels } = useQuery({
    queryKey: ["channels", serverId, tid],
    enabled: Boolean(serverId),
    refetchInterval: 5000,
    queryFn: () =>
      controlGet<{ channels: ChannelSummary[] }>(
        serverId!,
        `tenants/${tid}/channels?page=1&per_page=100`,
      ),
  });

  return (
    <div>
      <PageHeader title="Connections" description="Live WebSocket connections and local channels." />
      <div className="mb-4 flex items-center gap-2">
        <Label>Tenant ID</Label>
        <Input className="w-32" value={tenantInput} onChange={(e) => setTenantInput(e.target.value)} />
      </div>
      <Tabs defaultValue="connections">
        <TabsList>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
        </TabsList>
        <TabsContent value="connections">
          <div className="border border-border">
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
          </div>
        </TabsContent>
        <TabsContent value="channels">
          <div className="border border-border">
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
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
