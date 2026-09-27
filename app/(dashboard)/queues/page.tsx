"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { useActiveServerId } from "@/components/shared/ServerScopePicker";
import { controlGet } from "@/lib/hooks/useControl";
import type { JobSummary, QueueSummary, WorkerSummary } from "@/lib/control/types";
import { useQuery } from "@tanstack/react-query";
import {
  Input,
  Label,
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
  const serverId = useActiveServerId();
  const searchParams = useSearchParams();
  const [tenantInput, setTenantInput] = useState(searchParams.get("tenant") ?? "1");
  const [selectedQueue, setSelectedQueue] = useState<string | null>(null);
  const tid = Number(tenantInput) || 1;

  const { data: queues } = useQuery({
    queryKey: ["queues", serverId, tid],
    enabled: Boolean(serverId),
    queryFn: () =>
      controlGet<{ queues: QueueSummary[] }>(serverId!, `tenants/${tid}/queues?page=1&per_page=50`),
  });

  const { data: workers } = useQuery({
    queryKey: ["workers", serverId, tid],
    enabled: Boolean(serverId),
    queryFn: () =>
      controlGet<{ workers: WorkerSummary[] }>(serverId!, `tenants/${tid}/workers?page=1&per_page=50`),
  });

  const { data: jobs } = useQuery({
    queryKey: ["jobs", serverId, tid, selectedQueue],
    enabled: Boolean(serverId && selectedQueue),
    queryFn: () =>
      controlGet<{ jobs: JobSummary[] }>(
        serverId!,
        `tenants/${tid}/queues/${encodeURIComponent(selectedQueue!)}/jobs?limit=30`,
      ),
  });

  return (
    <div>
      <PageHeader title="Queues" description="Queue admin, workers, and recent jobs." />
      <div className="mb-4 flex items-center gap-2">
        <Label>Tenant ID</Label>
        <Input className="w-32" value={tenantInput} onChange={(e) => setTenantInput(e.target.value)} />
      </div>
      <Tabs defaultValue="queues">
        <TabsList>
          <TabsTrigger value="queues">Queues</TabsTrigger>
          <TabsTrigger value="workers">Workers</TabsTrigger>
          <TabsTrigger value="jobs" disabled={!selectedQueue}>
            Jobs {selectedQueue ? `· ${selectedQueue}` : ""}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="queues">
          <div className="border border-border">
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
          </div>
        </TabsContent>
        <TabsContent value="workers">
          <div className="border border-border">
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
          </div>
        </TabsContent>
        <TabsContent value="jobs">
          <div className="border border-border">
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
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
