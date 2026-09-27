import { getMetrics, getServerInfo, healthCheck } from "@/lib/control/client";
import type { MetricsRollup, ServerInfo, StatsMap } from "@/lib/control/types";
import { listServers } from "@/lib/db";

export type ServerOverview = {
  id: string;
  name: string;
  health: string;
  server?: ServerInfo;
  metrics?: MetricsRollup;
  error?: string;
};

export type OverviewAggregate = {
  servers: ServerOverview[];
  stats: StatsMap;
  tenantCount: number;
  healthyCount: number;
  collectedAt: string;
};

function mergeStats(into: StatsMap, add: StatsMap) {
  for (const [k, v] of Object.entries(add)) {
    into[k] = (into[k] ?? 0) + v;
  }
}

export async function aggregateOverview(): Promise<OverviewAggregate> {
  const servers = listServers();
  const rollup: StatsMap = {};
  let tenantCount = 0;
  let healthyCount = 0;
  const out: ServerOverview[] = [];

  await Promise.all(
    servers.map(async (s) => {
      const healthy = await healthCheck(s.id);
      if (healthy) healthyCount += 1;
      const item: ServerOverview = {
        id: s.id,
        name: s.name,
        health: healthy ? "healthy" : "unreachable",
      };
      try {
        item.server = await getServerInfo(s.id);
        item.metrics = await getMetrics(s.id);
        tenantCount += item.metrics.tenant_count;
        mergeStats(rollup, item.metrics.stats);
      } catch (e) {
        item.error = e instanceof Error ? e.message : "Failed to load server";
      }
      out.push(item);
    }),
  );

  return {
    servers: out,
    stats: rollup,
    tenantCount,
    healthyCount,
    collectedAt: new Date().toISOString(),
  };
}
