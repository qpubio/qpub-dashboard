"use client";

import { useRef } from "react";
import { ChartGrid, LedChart } from "@/components/charts/LedChart";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatStrip } from "@/components/shared/StatStrip";
import { useMetricHistory } from "@/lib/hooks/useMetricHistory";
import { useOverview } from "@/lib/hooks/useOverview";
import { formatNum } from "@/lib/utils";

export default function MonitoringPage() {
  const { data } = useOverview();
  const history = useMetricHistory();
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
        className="mb-6"
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
      <ChartGrid className="grid-cols-1 lg:grid-cols-2">
        <LedChart
          className="lg:col-span-2"
          title="Message rate"
          unit="/s"
          height={200}
          series={[
            {
              key: "msg:in",
              name: "msg:in",
              token: "--chart-2",
              data: history.series["msg:in"],
            },
            {
              key: "msg:out",
              name: "msg:out",
              token: "--chart-4",
              data: history.series["msg:out"],
            },
          ]}
        />
        <LedChart
          title="Drops"
          unit="/s"
          series={[
            {
              key: "msg:drop",
              name: "msg:drop",
              token: "--chart-6",
              data: history.series["msg:drop"],
            },
          ]}
        />
        <LedChart
          title="Bandwidth"
          unit="bytes/s"
          series={[
            {
              key: "bw:in",
              name: "bw:in",
              token: "--chart-2",
              data: history.series["bw:in"],
            },
            {
              key: "bw:out",
              name: "bw:out",
              token: "--chart-4",
              data: history.series["bw:out"],
            },
          ]}
        />
        <LedChart
          className="lg:col-span-2"
          title="Presence"
          height={200}
          series={[
            {
              key: "conn",
              name: "conn",
              token: "--chart-1",
              data: history.series.conn,
            },
            {
              key: "sub",
              name: "sub",
              token: "--chart-4",
              data: history.series.sub,
            },
            {
              key: "chan",
              name: "chan",
              token: "--chart-5",
              data: history.series.chan,
            },
          ]}
        />
      </ChartGrid>
    </div>
  );
}
