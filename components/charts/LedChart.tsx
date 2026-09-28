"use client";

import { LedMatrixCanvas } from "@/components/charts/LedMatrixCanvas";
import type { ChartToken } from "@/components/charts/ledMatrix";
import { cn } from "@/lib/utils";

export type LedChartSeries = {
  key: string;
  name: string;
  token: ChartToken;
  data: [number, number][];
};

export function LedChart({
  title,
  unit,
  series,
  className,
  height = 180,
}: {
  title: string;
  unit?: string;
  series: LedChartSeries[];
  className?: string;
  height?: number;
}) {
  return (
    <div className={cn("bg-background", className)}>
      <div className="flex items-baseline justify-between gap-2 px-3 pt-2">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-mono text-[10px] uppercase tracking-wide text-muted">
            {title}
          </span>
          {series.map((s) => (
            <span
              key={s.key}
              className="font-mono text-[10px] uppercase tracking-wide"
              style={{ color: `oklch(var(${s.token}))` }}
            >
              {s.name}
            </span>
          ))}
        </div>
        <div className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-muted">
          {unit ? `${unit} · ` : ""}
          3m
        </div>
      </div>
      <LedMatrixCanvas series={series} height={Math.max(80, height - 28)} />
    </div>
  );
}

/** Hairline grid wrapper matching StatStrip. */
export function ChartGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("grid gap-px border border-border bg-border", className)}
    >
      {children}
    </div>
  );
}
