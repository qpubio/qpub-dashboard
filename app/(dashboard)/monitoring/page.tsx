"use client";

import { useRef } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatStrip } from "@/components/shared/StatStrip";
import { useOverview } from "@/lib/hooks/useOverview";
import { formatNum } from "@/lib/utils";

export default function MonitoringPage() {
  const { data } = useOverview();
  const prev = useRef<Record<string, number>>({});

  const stats = data?.stats ?? {};
  const deltas = Object.fromEntries(
    Object.entries(stats).map(([k, v]) => {
      const d = v - (prev.current[k] ?? v);
      return [k, d];
    }),
  );
  prev.current = { ...stats };

  return (
    <div>
      <PageHeader
        title="Monitoring"
        description="Realtime counters aggregated across registered servers (2s refresh)."
      />
      <StatStrip
        stats={[
          {
            label: "conn",
            value: formatNum(stats.conn),
            hint: `Δ ${deltas.conn ?? 0}`,
          },
          {
            label: "sub",
            value: formatNum(stats.sub),
            hint: `Δ ${deltas.sub ?? 0}`,
          },
          {
            label: "msg:in",
            value: formatNum(stats["msg:in"]),
            hint: `Δ ${deltas["msg:in"] ?? 0}`,
          },
          {
            label: "msg:out",
            value: formatNum(stats["msg:out"]),
            hint: `Δ ${deltas["msg:out"] ?? 0}`,
          },
          {
            label: "msg:drop",
            value: formatNum(stats["msg:drop"]),
            hint: `Δ ${deltas["msg:drop"] ?? 0}`,
          },
          {
            label: "bw:in",
            value: formatNum(stats["bw:in"]),
            hint: `Δ ${deltas["bw:in"] ?? 0}`,
          },
        ]}
      />
    </div>
  );
}
