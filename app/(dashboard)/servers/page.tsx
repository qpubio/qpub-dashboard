"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useDeleteServer, useRegisterServer, useServers } from "@/lib/hooks/useServers";
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
import { Plus, Trash2 } from "lucide-react";

export default function ServersPage() {
  const { data, isLoading } = useServers();
  const register = useRegisterServer();
  const remove = useDeleteServer();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", control_url: "", control_token: "" });

  async function submit() {
    await register.mutateAsync(form);
    setOpen(false);
    setForm({ name: "", control_url: "", control_token: "" });
  }

  return (
    <div>
      <PageHeader
        title="Servers"
        description="Registered qpub-server Control API endpoints."
        actions={
          <Button onClick={() => setOpen(true)}>
            Add server <Plus className="size-4" />
          </Button>
        }
      />
      {isLoading ? <p className="text-sm text-muted">Loading…</p> : null}
      <div className="border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Control URL</TableHead>
              <TableHead>Health</TableHead>
              <TableHead>Last seen</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data?.servers ?? []).map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-mono">{s.name}</TableCell>
                <TableCell className="font-mono text-xs">{s.control_url}</TableCell>
                <TableCell>
                  <Badge variant="flat">{s.last_health ?? "unknown"}</Badge>
                </TableCell>
                <TableCell className="text-xs text-muted">{s.last_seen_at ?? "—"}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    isIconOnly
                    onClick={() => remove.mutate(s.id)}
                    aria-label="Remove server"
                  >
                    <Trash2 className="size-4" />
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
            <DialogTitle>Add qpub-server</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Control URL</Label>
              <Input
                placeholder="http://localhost:8091"
                value={form.control_url}
                onChange={(e) => setForm({ ...form, control_url: e.target.value })}
              />
            </div>
            <div>
              <Label>Control API token</Label>
              <Input
                type="password"
                value={form.control_token}
                onChange={(e) => setForm({ ...form, control_token: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="light" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} isDisabled={register.isPending}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
