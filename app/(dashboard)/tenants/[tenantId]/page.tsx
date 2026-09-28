"use client";

import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { useActiveServerId } from "@/components/shared/ServerScopePicker";
import { StatStrip } from "@/components/shared/StatStrip";
import { controlGet, controlMutate } from "@/lib/hooks/useControl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Input, Label } from "@qpub/qui/lite";
import { formatNum } from "@/lib/utils";

export default function TenantDetailPage() {
  const params = useParams();
  const tenantId = String(params.tenantId ?? "");
  const serverId = useActiveServerId();
  const router = useRouter();
  const qc = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: ["tenant-stats", serverId, tenantId],
    enabled: Boolean(serverId && tenantId),
    queryFn: () => controlGet<{ stats: Record<string, number> }>(serverId!, `tenants/${tenantId}/stats`),
    refetchInterval: 2000,
  });

  const { data: limits } = useQuery({
    queryKey: ["tenant-limits", serverId, tenantId],
    enabled: Boolean(serverId && tenantId),
    queryFn: () =>
      controlGet<{ inbound_per_second: number; outbound_per_second: number }>(
        serverId!,
        `tenants/${tenantId}/limits`,
      ),
  });

  async function saveLimits(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!serverId) return;
    const form = new FormData(e.currentTarget);
    await controlMutate(serverId, "PUT", `tenants/${tenantId}/limits`, {
      inbound_per_second: Number(form.get("inbound")),
      outbound_per_second: Number(form.get("outbound")),
    });
    qc.invalidateQueries({ queryKey: ["tenant-limits", serverId, tenantId] });
  }

  async function deleteTenant() {
    if (!serverId || !confirm("Delete this tenant and all associated data?")) return;
    await controlMutate(serverId, "DELETE", `tenants/${tenantId}`);
    router.push("/tenants");
  }

  const s = stats?.stats ?? {};

  return (
    <div>
      <PageHeader
        title={`Tenant ${tenantId}`}
        description="Realtime stats and rate limits."
        actions={
          <div className="flex gap-2">
            <Button variant="light" onClick={() => router.push(`/api-keys?tenant=${tenantId}`)}>
              API keys
            </Button>
            <Button variant="light" onClick={() => router.push(`/queues?tenant=${tenantId}`)}>
              Queues
            </Button>
            <Button variant="ghost" onClick={deleteTenant}>
              Delete
            </Button>
          </div>
        }
      />
      <StatStrip
        className="mb-6"
        stats={[
          { label: "conn", value: formatNum(s.conn) },
          { label: "chan", value: formatNum(s.chan) },
          { label: "sub", value: formatNum(s.sub) },
          { label: "msg:in", value: formatNum(s["msg:in"]) },
          { label: "msg:out", value: formatNum(s["msg:out"]) },
          { label: "msg:drop", value: formatNum(s["msg:drop"]) },
        ]}
      />
      <form onSubmit={saveLimits} className="max-w-md space-y-3 border border-border p-4">
        <h2 className="font-mono text-sm font-semibold">Rate limits</h2>
        <div>
          <Label>Inbound / sec (-1 unlimited)</Label>
          <Input name="inbound" defaultValue={limits?.inbound_per_second ?? -1} />
        </div>
        <div>
          <Label>Outbound / sec (-1 unlimited)</Label>
          <Input name="outbound" defaultValue={limits?.outbound_per_second ?? -1} />
        </div>
        <Button type="submit">Save limits</Button>
      </form>
    </div>
  );
}
