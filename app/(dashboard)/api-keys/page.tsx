"use client";

import { useState } from "react";
import { DataPanel } from "@/components/shared/DataPanel";
import { PageHeader } from "@/components/shared/PageHeader";
import { TenantScopePicker } from "@/components/shared/TenantScopePicker";
import { useTenantScope } from "@/lib/hooks/useTenantScope";
import { controlGet, controlMutate } from "@/lib/hooks/useControl";
import type { APIKey } from "@/lib/control/types";
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
} from "@qpub/qui/lite";
import { Plus } from "lucide-react";

export default function ApiKeysPage() {
  const scope = useTenantScope();
  const { serverId, tenantId, ready } = scope;
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [revealed, setRevealed] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["keys", serverId, tenantId],
    enabled: ready,
    queryFn: async () => {
      const res = await controlGet<{ keys: APIKey[] }>(serverId!, `tenants/${tenantId}/keys`);
      return res.keys;
    },
  });

  async function createKey() {
    if (!serverId || !tenantId) return;
    const key = await controlMutate<APIKey>(serverId, "POST", `tenants/${tenantId}/keys`, {
      name,
      permission: {},
    });
    setRevealed(key.secret_key ?? null);
    setOpen(false);
    setName("");
    qc.invalidateQueries({ queryKey: ["keys", serverId, tenantId] });
  }

  async function revoke(id: number) {
    if (!serverId || !tenantId || !confirm("Revoke this key?")) return;
    await controlMutate(serverId, "DELETE", `tenants/${tenantId}/keys/${id}`);
    qc.invalidateQueries({ queryKey: ["keys", serverId, tenantId] });
  }

  return (
    <div>
      <PageHeader
        title="API Keys"
        description="Create, rotate, and revoke tenant API keys."
        actions={
          <Button onClick={() => setOpen(true)} isDisabled={!ready}>
            Create key <Plus className="size-4" />
          </Button>
        }
      />
      <TenantScopePicker
        serverId={scope.serverId}
        tenantId={scope.tenantId}
        setTenantId={scope.setTenantId}
        tenants={scope.tenants}
        isLoading={scope.isLoading}
      />
      {revealed ? (
        <div className="mb-4 border border-border bg-muted/30 p-3 font-mono text-xs text-foreground">
          New secret (copy now): {revealed}
        </div>
      ) : null}
      {isLoading ? <p className="text-sm text-muted">Loading…</p> : null}
      {isError ? (
        <p className="mb-4 text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load API keys."}
        </p>
      ) : null}
      <DataPanel>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Public ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data ?? []).map((k) => (
              <TableRow key={k.id}>
                <TableCell>{k.name}</TableCell>
                <TableCell className="font-mono text-xs">{k.public_id}</TableCell>
                <TableCell>{k.status}</TableCell>
                <TableCell>
                  <Button variant="ghost" onClick={() => revoke(k.id)}>
                    Revoke
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataPanel>

      <Dialog isOpen={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create API key</DialogTitle>
          </DialogHeader>
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="light" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createKey}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
