"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataPanel } from "@/components/shared/DataPanel";
import {
  useDeleteServer,
  useRegisterServer,
  useServers,
  useTestServerConnection,
} from "@/lib/hooks/useServers";
import type { ServerRecord } from "@/lib/hooks/useServers";
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
import { Pencil, Plus, Trash2, Zap } from "lucide-react";

type FormState = {
  id?: string;
  name: string;
  control_url: string;
  control_token: string;
};

const emptyForm: FormState = { name: "", control_url: "", control_token: "" };

export default function ServersPage() {
  const { data, isLoading } = useServers();
  const register = useRegisterServer();
  const remove = useDeleteServer();
  const testConn = useTestServerConnection();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [testResult, setTestResult] = useState<
    Record<string, { ok: boolean; message: string }>
  >({});

  function openAdd() {
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(s: ServerRecord) {
    setForm({
      id: s.id,
      name: s.name,
      control_url: s.control_url,
      control_token: "",
    });
    setOpen(true);
  }

  async function submit() {
    const payload = {
      id: form.id,
      name: form.name,
      control_url: form.control_url,
      ...(form.control_token.trim()
        ? { control_token: form.control_token }
        : {}),
    };
    await register.mutateAsync(payload);
    setOpen(false);
    setForm(emptyForm);
  }

  async function testServer(id: string) {
    setTestResult((prev) => ({
      ...prev,
      [id]: { ok: true, message: "Testing…" },
    }));
    try {
      const res = await testConn.mutateAsync(id);
      if (res.ok) {
        setTestResult((prev) => ({
          ...prev,
          [id]: {
            ok: true,
            message: `OK${res.version ? ` · ${res.version}` : ""}`,
          },
        }));
      } else {
        setTestResult((prev) => ({
          ...prev,
          [id]: { ok: false, message: res.error ?? "Failed" },
        }));
      }
    } catch (e) {
      setTestResult((prev) => ({
        ...prev,
        [id]: { ok: false, message: e instanceof Error ? e.message : "Failed" },
      }));
    }
  }

  const editing = Boolean(form.id);

  return (
    <div>
      <PageHeader
        title="Servers"
        description="Registered qpub-server Control API endpoints."
        actions={
          <Button onClick={openAdd}>
            Add server <Plus className="size-4" />
          </Button>
        }
      />
      {isLoading ? <p className="text-sm text-muted">Loading…</p> : null}
      <DataPanel>
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
                <TableCell className="font-mono text-xs">
                  {s.control_url}
                </TableCell>
                <TableCell>
                  <Badge variant="flat">{s.last_health ?? "unknown"}</Badge>
                </TableCell>
                <TableCell className="text-xs text-muted">
                  {s.last_seen_at ?? "—"}
                </TableCell>
                <TableCell className="space-y-1 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => testServer(s.id)}
                      isDisabled={testConn.isPending}
                    >
                      Test <Zap className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      isIconOnly
                      onClick={() => openEdit(s)}
                      aria-label="Edit server"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      isIconOnly
                      onClick={() => remove.mutate(s.id)}
                      aria-label="Remove server"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  {testResult[s.id] ? (
                    <p
                      className={`text-xs ${testResult[s.id].ok ? "text-muted" : "text-destructive"}`}
                    >
                      {testResult[s.id].message}
                    </p>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataPanel>

      <Dialog isOpen={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit qpub-server" : "Add qpub-server"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Control URL</Label>
              <Input
                placeholder="http://localhost:8091"
                value={form.control_url}
                onChange={(e) =>
                  setForm({ ...form, control_url: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Control API token</Label>
              <Input
                type="password"
                placeholder={
                  editing ? "Leave blank to keep current token" : undefined
                }
                value={form.control_token}
                onChange={(e) =>
                  setForm({ ...form, control_token: e.target.value })
                }
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
