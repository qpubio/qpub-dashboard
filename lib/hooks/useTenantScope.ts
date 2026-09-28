"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useActiveServerId } from "@/components/shared/ServerScopePicker";
import { controlGet } from "@/lib/hooks/useControl";
import type { Pagination, Tenant } from "@/lib/control/types";
import { useUiStore } from "@/lib/stores/uiStore";

/** Platform maintenance / SaaS job queues (qpub-server project id 0). */
export const PLATFORM_TENANT_ID = "0";

type TenantScopeOptions = {
  includePlatform?: boolean;
  /** Default to platform tenant when nothing is selected yet. */
  defaultPlatform?: boolean;
};

export function useTenantScope(options: TenantScopeOptions = {}) {
  const { includePlatform = false, defaultPlatform = false } = options;
  const serverId = useActiveServerId();
  const searchParams = useSearchParams();
  const stored = useUiStore((s) => s.tenantScope);
  const setTenantScope = useUiStore((s) => s.setTenantScope);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["tenants", serverId],
    enabled: Boolean(serverId),
    queryFn: () =>
      controlGet<{ tenants: Tenant[]; pagination: Pagination }>(
        serverId!,
        "tenants",
      ),
  });

  const tenants = data?.tenants ?? [];

  useEffect(() => {
    setTenantScope(null);
  }, [serverId, setTenantScope]);

  useEffect(() => {
    if (stored) return;
    const fromUrl = searchParams.get("tenant");
    if (fromUrl) {
      setTenantScope(fromUrl);
      return;
    }
    if (defaultPlatform && includePlatform) {
      setTenantScope(PLATFORM_TENANT_ID);
      return;
    }
    if (tenants[0]) {
      setTenantScope(tenants[0].id);
    }
  }, [
    stored,
    searchParams,
    tenants,
    defaultPlatform,
    includePlatform,
    setTenantScope,
  ]);

  const tenantId = useMemo(() => {
    if (stored) return stored;
    const fromUrl = searchParams.get("tenant");
    if (fromUrl) return fromUrl;
    if (defaultPlatform && includePlatform) return PLATFORM_TENANT_ID;
    if (tenants[0]) return tenants[0].id;
    return null;
  }, [stored, searchParams, defaultPlatform, includePlatform, tenants]);

  return {
    serverId,
    tenantId,
    setTenantId: setTenantScope,
    tenants,
    isLoading,
    isError,
    error,
    ready: Boolean(serverId && tenantId),
  };
}
