"use client";

import { useState } from "react";
import { DataPanel } from "@/components/shared/DataPanel";
import { PageHeader } from "@/components/shared/PageHeader";
import { TenantScopePicker } from "@/components/shared/TenantScopePicker";
import { useTenantScope } from "@/lib/hooks/useTenantScope";
import { controlGet } from "@/lib/hooks/useControl";
import type { JobSummary, QueueSummary, WorkerSummary } from "@/lib/control/types";
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
  Badge,
} from "@qpub/qui/lite";

export default function QueuesPage() {
  const scope = useTenantScope({ includePlatform: true, defaultPlatform: true });
  const { serverId, tenantId, ready } = scope;
  const [selectedQueue, setSelectedQueue] = useState<string | null>(null);

  const { data: queues, isError: queuesError, error: queuesErr } = useQuery({
    queryKey: ["queues", serverId, tenantId],
    enabled: ready,
    queryFn: () =>
      controlGet<{ queues: QueueSummary[] }>(
        serverId!,
        `tenants/${tenantId}/queues?page=1&per_page=50`,
      ),
  });

  const { data: workers } = useQuery({
    queryKey: ["workers", serverId, tenantId],
    enabled: ready,
    queryFn: () =>
      controlGet<{ workers: WorkerSummary[] }>(
        serverId!,
        `tenants/${tenantId}/workers?page=1&per_page=50`,
      ),
  });

  const { data: jobs } = useQuery({
    queryKey: ["jobs", serverId, tenantId, selectedQueue],
    enabled: Boolean(serverId && tenantId && selectedQueue),
    queryFn: () =>
      controlGet<{ jobs: JobSummary[] }>(
        serverId!,
        `tenants/${tenantId}/queues/${encodeURIComponent(selectedQueue!)}/jobs?limit=30`,
      ),
  });

  return (
    <div>
      <PageHeader title="Queues" description="Queue admin, workers, and recent jobs." />
      <TenantScopePicker
        serverId={scope.serverId}
        tenantId={scope.tenantId}
        setTenantId={scope.setTenantId}
        tenants={scope.tenants}
        isLoading={scope.isLoading}
        includePlatform
      />
      {queuesError ? (
        <p className="mb-4 text-sm text-destructive">
          {queuesErr instanceof Error ? queuesErr.message : "Failed to load queues."}
        </p>
      ) : null}
      <Tabs defaultValue="queues">
        <TabsList>
          <TabsTrigger value="queues">Queues</TabsTrigger>
          <TabsTrigger value="workers">Workers</TabsTrigger>
          <TabsTrigger value="jobs" disabled={!selectedQueue}>
            Jobs {selectedQueue ? `· ${selectedQueue}` : ""}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="queues">
          <DataPanel>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pending</TableHead>
                  <TableHead>Running</TableHead>
                  <TableHead>Failed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(queues?.queues ?? []).map((q) => (
                  <TableRow
                    key={q.name}
                    className="cursor-pointer"
                    onClick={() => setSelectedQueue(q.name)}
                  >
                    <TableCell className="font-mono">{q.name}</TableCell>
                    <TableCell>
                      <Badge variant="flat">{q.status}</Badge>
                    </TableCell>
                    <TableCell>{q.counts.pending}</TableCell>
                    <TableCell>{q.counts.running}</TableCell>
                    <TableCell>{q.counts.failed}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DataPanel>
        </TabsContent>
        <TabsContent value="workers">
          <DataPanel>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Queues</TableHead>
                  <TableHead>Last seen</TableHead>
                  <TableHead>Stale</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(workers?.workers ?? []).map((w) => (
                  <TableRow key={w.id}>
                    <TableCell>{w.name}</TableCell>
                    <TableCell className="font-mono text-xs">{w.queues.join(", ")}</TableCell>
                    <TableCell className="text-xs">{w.last_seen_at}</TableCell>
                    <TableCell>{w.stale ? "yes" : "no"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DataPanel>
        </TabsContent>
        <TabsContent value="jobs">
          <DataPanel>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Attempt</TableHead>
                  <TableHead>Worker</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(jobs?.jobs ?? []).map((j) => (
                  <TableRow key={j.id}>
                    <TableCell className="font-mono text-xs">{j.id}</TableCell>
                    <TableCell>{j.status}</TableCell>
                    <TableCell>
                      {j.attempt}/{j.max_attempts}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{j.worker_id ?? "—"}</TableCell>
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
