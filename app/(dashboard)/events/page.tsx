"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from "@qpub/qui/lite";

type AuditEvent = {
  id: number;
  severity: string;
  category: string;
  message: string;
  server_id: string | null;
  created_at: string;
};

export default function EventsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: () => apiFetch<{ events: AuditEvent[] }>("/api/events"),
    refetchInterval: 5000,
  });

  return (
    <div>
      <PageHeader title="Events" description="Operational timeline from dashboard audit log." />
      {isLoading ? <p className="text-sm text-muted">Loading…</p> : null}
      <div className="border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data?.events ?? []).map((e) => (
              <TableRow key={e.id}>
                <TableCell className="text-xs text-muted">{e.created_at}</TableCell>
                <TableCell>
                  <Badge variant="flat">{e.severity}</Badge>
                </TableCell>
                <TableCell className="font-mono text-xs">{e.category}</TableCell>
                <TableCell className="font-mono text-xs">{e.message}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
