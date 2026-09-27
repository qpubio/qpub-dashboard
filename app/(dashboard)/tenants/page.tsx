"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DataPanel } from "@/components/shared/DataPanel";
import { PageHeader } from "@/components/shared/PageHeader";
import { useActiveServerId } from "@/components/shared/ServerScopePicker";
import { controlGet, controlMutate } from "@/lib/hooks/useControl";
import type { Pagination, Tenant } from "@/lib/control/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
} from "@qpub/qui/lite";
import { Plus } from "lucide-react";

export default function TenantsPage() {
  const serverId = useActiveServerId();
  const searchParams = useSearchParams();
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [newId, setNewId] = useState("");

  useEffect(() => {
    if (searchParams.get("create") === "1") setCreateOpen(true);
  }, [searchParams]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["tenants", serverId],
    enabled: Boolean(serverId),
    queryFn: () =>
      controlGet<{ tenants: Tenant[]; pagination: Pagination }>(serverId!, "tenants"),
  });

  async function createTenant() {
    if (!serverId || !newId) return;
    await controlMutate(serverId, "POST", "tenants", { id: Number(newId) });
    setCreateOpen(false);
    setNewId("");
    qc.invalidateQueries({ queryKey: ["tenants", serverId] });
  }

  return (
    <div>
      <PageHeader
        title="Tenants"
        description="Provisioning and lifecycle for messaging tenants on the selected server."
        actions={
          <Button onClick={() => setCreateOpen(true)} isDisabled={!serverId}>
            Create tenant <Plus className="size-4" />
          </Button>
        }
      />
      {!serverId ? (
        <p className="text-sm text-muted">Select a server in the status bar.</p>
      ) : null}
      {isLoading ? <p className="text-sm text-muted">Loading…</p> : null}
      {isError ? (
        <p className="mb-4 text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load tenants."}
        </p>
      ) : null}
      <DataPanel>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data?.tenants ?? []).map((t) => (
              <TableRow key={t.id}>
                <TableCell>
                  <Link href={`/tenants/${t.id}`} className="font-mono underline-offset-2 hover:underline">
                    {t.id}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="flat">{t.status}</Badge>
                </TableCell>
                <TableCell className="text-xs text-muted">{t.created_at}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataPanel>

      <Dialog isOpen={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create tenant</DialogTitle>
          </DialogHeader>
          <div>
            <Label>Tenant ID</Label>
            <Input value={newId} onChange={(e) => setNewId(e.target.value)} placeholder="1" />
          </div>
          <DialogFooter>
            <Button variant="light" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createTenant}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
