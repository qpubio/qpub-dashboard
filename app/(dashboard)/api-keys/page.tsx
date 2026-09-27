"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { useActiveServerId } from "@/components/shared/ServerScopePicker";
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
  const serverId = useActiveServerId();
  const searchParams = useSearchParams();
  const tenantId = Number(searchParams.get("tenant") ?? "1");
  const qc = useQueryClient();
  const [tenantInput, setTenantInput] = useState(String(tenantId));
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [revealed, setRevealed] = useState<string | null>(null);

  const tid = Number(tenantInput) || tenantId;

  const { data, isLoading } = useQuery({
    queryKey: ["keys", serverId, tid],
    enabled: Boolean(serverId) && tid > 0,
    queryFn: async () => {
      const res = await controlGet<{ keys: APIKey[] }>(serverId!, `tenants/${tid}/keys`);
      return res.keys;
    },
  });

  async function createKey() {
    if (!serverId) return;
    const key = await controlMutate<APIKey>(serverId, "POST", `tenants/${tid}/keys`, {
      name,
      permission: {},
    });
    setRevealed(key.secret_key ?? null);
    setOpen(false);
    setName("");
    qc.invalidateQueries({ queryKey: ["keys", serverId, tid] });
  }

  async function revoke(id: number) {
    if (!serverId || !confirm("Revoke this key?")) return;
    await controlMutate(serverId, "DELETE", `tenants/${tid}/keys/${id}`);
    qc.invalidateQueries({ queryKey: ["keys", serverId, tid] });
  }

  return (
    <div>
      <PageHeader
        title="API Keys"
        description="Create, rotate, and revoke tenant API keys."
        actions={
          <Button onClick={() => setOpen(true)} isDisabled={!serverId}>
            Create key <Plus className="size-4" />
          </Button>
        }
      />
      <div className="mb-4 flex items-center gap-2">
        <Label>Tenant ID</Label>
        <Input className="w-32" value={tenantInput} onChange={(e) => setTenantInput(e.target.value)} />
      </div>
      {revealed ? (
        <div className="mb-4 border border-border bg-muted/30 p-3 font-mono text-xs">
          New secret (copy now): {revealed}
        </div>
      ) : null}
      {isLoading ? <p className="text-sm text-muted">Loading…</p> : null}
      <div className="border border-border">
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
      </div>

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
