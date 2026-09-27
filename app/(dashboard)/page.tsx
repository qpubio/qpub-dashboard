"use client";

import { DataPanel } from "@/components/shared/DataPanel";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatStrip } from "@/components/shared/StatStrip";
import { useOverview } from "@/lib/hooks/useOverview";
import { formatNum } from "@/lib/utils";
import { Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@qpub/qui/lite";

export default function OverviewPage() {
  const { data, isLoading, isError } = useOverview();
  const stats = data?.stats ?? {};

  return (
    <div>
      <PageHeader
        title="Overview"
        description="Health, traffic, and attention items across your QPub servers."
      />
      {isLoading ? <p className="text-sm text-muted">Loading…</p> : null}
      {isError ? <p className="text-sm text-destructive">Failed to load overview.</p> : null}
      {data ? (
        <>
          <StatStrip
            className="mb-6"
            stats={[
              { label: "Servers OK", value: `${data.healthyCount}/${data.servers.length}` },
              { label: "Tenants", value: formatNum(data.tenantCount) },
              { label: "Connections", value: formatNum(stats.conn) },
              { label: "Msg in", value: formatNum(stats["msg:in"]) },
              { label: "Msg out", value: formatNum(stats["msg:out"]) },
              { label: "Dropped", value: formatNum(stats["msg:drop"]) },
            ]}
          />
          <DataPanel>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Server</TableHead>
                  <TableHead>Health</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Uptime</TableHead>
                  <TableHead>Tenants</TableHead>
                  <TableHead>Connections</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.servers.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-sm">{s.name}</TableCell>
                    <TableCell>
                      <Badge variant="flat" color={s.error ? "warning" : s.health === "healthy" ? "success" : "warning"}>
                        {s.error ? "degraded" : s.health}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{s.server?.version ?? "—"}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {s.server ? `${Math.floor(s.server.uptime_sec / 60)}m` : "—"}
                    </TableCell>
                    <TableCell>{s.metrics?.tenant_count ?? "—"}</TableCell>
                    <TableCell>{s.metrics?.stats?.conn ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DataPanel>
        </>
      ) : null}
    </div>
  );
}
