"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { useActiveServerId } from "@/components/shared/ServerScopePicker";
import { TenantScopePicker } from "@/components/shared/TenantScopePicker";
import { useTenantScope } from "@/lib/hooks/useTenantScope";
import { ConsoleSocketProvider } from "@/components/console/ConsoleSocketProvider";
import { Console } from "@/components/console/Console";

export default function ConsolePage() {
  const serverId = useActiveServerId();
  const scope = useTenantScope();

  return (
    <div className="space-y-4">
      <PageHeader
        title="Console"
        description="Publish to channels, enqueue jobs, and watch live _logs for the selected tenant."
      />

      <TenantScopePicker
        serverId={scope.serverId}
        tenantId={scope.tenantId}
        setTenantId={scope.setTenantId}
        tenants={scope.tenants}
        isLoading={scope.isLoading}
      />

      {!serverId ? (
        <div className="rounded-lg border border-border p-8 text-center">
          <p className="text-sm text-muted">No server selected.</p>
          <Link
            href="/servers"
            className="mt-2 inline-block text-sm text-primary underline"
          >
            Register a server
          </Link>
        </div>
      ) : !scope.tenantId ? (
        <div className="rounded-lg border border-border p-8 text-center">
          <p className="text-sm text-muted">
            {scope.isLoading
              ? "Loading tenants…"
              : "No tenant available. Create one first."}
          </p>
          {!scope.isLoading && (
            <Link
              href="/tenants"
              className="mt-2 inline-block text-sm text-primary underline"
            >
              Manage tenants
            </Link>
          )}
        </div>
      ) : (
        <ConsoleSocketProvider serverId={serverId} tenantId={scope.tenantId}>
          <Console />
        </ConsoleSocketProvider>
      )}
    </div>
  );
}
