import type { StatsMap } from "@/lib/control/types";

/** Rolling window: 3 minutes at ~2s poll ≈ 90 points. */
export const HISTORY_WINDOW_MS = 3 * 60 * 1000;

/** Gaps longer than this still produce a rate sample on the datetime axis. */
export const HISTORY_GAP_MS = 15_000;

export const LEVEL_KEYS = ["conn", "sub", "chan"] as const;
export const RATE_KEYS = [
  "msg:in",
  "msg:out",
  "msg:drop",
  "bw:in",
  "bw:out",
] as const;

export type LevelKey = (typeof LEVEL_KEYS)[number];
export type RateKey = (typeof RATE_KEYS)[number];
export type MetricKey = LevelKey | RateKey;

/** Highcharts datetime point: [timestampMs, value] */
export type SeriesPoint = [number, number];

export type MetricSeries = Record<MetricKey, SeriesPoint[]>;

export type MetricSnapshot = {
  collectedAt: string;
  stats: StatsMap;
};

export type MetricHistoryState = {
  lastCollectedAt: string | null;
  lastStats: StatsMap | null;
  series: MetricSeries;
};

export function emptySeries(): MetricSeries {
  return {
    conn: [],
    sub: [],
    chan: [],
    "msg:in": [],
    "msg:out": [],
    "msg:drop": [],
    "bw:in": [],
    "bw:out": [],
  };
}

export function createHistoryState(): MetricHistoryState {
  return {
    lastCollectedAt: null,
    lastStats: null,
    series: emptySeries(),
  };
}

function trimWindow(points: SeriesPoint[], nowMs: number): SeriesPoint[] {
  const cutoff = nowMs - HISTORY_WINDOW_MS;
  let i = 0;
  while (i < points.length && points[i]![0] < cutoff) i += 1;
  return i === 0 ? points : points.slice(i);
}

function appendPoint(
  series: MetricSeries,
  key: MetricKey,
  t: number,
  value: number,
): void {
  series[key] = trimWindow([...series[key], [t, value]], t);
}

/**
 * Append one overview snapshot. Cumulative counters become per-second rates.
 * Levels are raw gauges. First rate sample waits for a second poll.
 * Counter reset (value drops) plots 0 and rebases.
 */
export function appendSnapshot(
  state: MetricHistoryState,
  snapshot: MetricSnapshot,
): MetricHistoryState {
  const t = Date.parse(snapshot.collectedAt);
  if (Number.isNaN(t)) return state;

  // Dedupe identical aggregator timestamps.
  if (state.lastCollectedAt === snapshot.collectedAt) return state;

  const next: MetricHistoryState = {
    lastCollectedAt: snapshot.collectedAt,
    lastStats: { ...snapshot.stats },
    series: { ...state.series },
  };

  for (const key of LEVEL_KEYS) {
    appendPoint(next.series, key, t, snapshot.stats[key] ?? 0);
  }

  if (state.lastStats && state.lastCollectedAt) {
    const prevT = Date.parse(state.lastCollectedAt);
    const dtSec = (t - prevT) / 1000;
    if (dtSec > 0) {
      for (const key of RATE_KEYS) {
        const now = snapshot.stats[key] ?? 0;
        const prev = state.lastStats[key] ?? 0;
        const rate = now >= prev ? (now - prev) / dtSec : 0;
        appendPoint(next.series, key, t, rate);
      }
    }
  }

  return next;
}
