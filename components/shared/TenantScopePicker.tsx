"use client";

import { Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@qpub/qui/lite";
import { PLATFORM_TENANT_ID } from "@/lib/hooks/useTenantScope";
import type { Tenant } from "@/lib/control/types";

export function TenantScopePicker({
  serverId,
  tenantId,
  setTenantId,
  tenants,
  isLoading,
  includePlatform = false,
}: {
  serverId: string | null;
  tenantId: string | null;
  setTenantId: (id: string | null) => void;
  tenants: Tenant[];
  isLoading: boolean;
  includePlatform?: boolean;
}) {
  if (!serverId) {
    return <p className="mb-4 text-sm text-muted">Select a server in the status bar.</p>;
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <Label>Tenant</Label>
      <Select
        value={tenantId ?? undefined}
        onValueChange={setTenantId}
        disabled={isLoading || (!includePlatform && tenants.length === 0)}
      >
        <SelectTrigger className="min-w-[220px] font-mono text-sm">
          <SelectValue placeholder={isLoading ? "Loading tenants…" : "Select tenant"} />
        </SelectTrigger>
        <SelectContent>
          {includePlatform ? (
            <SelectItem value={PLATFORM_TENANT_ID}>Platform (internal jobs)</SelectItem>
          ) : null}
          {tenants.map((t) => (
            <SelectItem key={String(t.id)} value={String(t.id)}>
              {t.id}
              {t.status !== "active" ? ` · ${t.status}` : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
