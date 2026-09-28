import {
  appendSnapshot,
  createHistoryState,
  emptySeries,
  type MetricHistoryState,
  type MetricSnapshot,
  type SeriesPoint,
} from "@/lib/metrics/history";

type Listener = () => void;

let state: MetricHistoryState = createHistoryState();
const listeners = new Set<Listener>();
/** When true, live polls do not overwrite seeded demo traces. */
let demoLocked = false;

function notify() {
  for (const listener of listeners) listener();
}

export function getMetricHistory(): MetricHistoryState {
  return state;
}

export function subscribeMetricHistory(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function recordMetricSnapshot(snapshot: MetricSnapshot): void {
  if (demoLocked) return;
  const next = appendSnapshot(state, snapshot);
  if (next === state) return;
  state = next;
  notify();
}

/** Fill the rolling window with synthetic rates/levels for screenshots / demos. */
export function seedDemoMetricHistory(): void {
  demoLocked = true;
  const now = Date.now();
  const n = 90;
  const step = 2000;
  const series = emptySeries();

  const push = (key: keyof typeof series, t: number, v: number) => {
    series[key].push([t, Math.max(0, v)] as SeriesPoint);
  };

  for (let i = 0; i < n; i++) {
    const t = now - (n - 1 - i) * step;
    const phase = i / 7;
    const wave = (Math.sin(phase) + 1) * 0.5;
    const wave2 = (Math.sin(phase * 0.7 + 1.2) + 1) * 0.5;
    const ramp = i / n;
    const burst = i > 55 && i < 68 ? 1.8 : 1;
    const spike = i === 40 || i === 72 ? 2.4 : 1;

    push("msg:in", t, (12 + wave * 48 + ramp * 20) * burst * spike);
    push("msg:out", t, (9 + wave2 * 40 + ramp * 16) * burst);
    push(
      "msg:drop",
      t,
      i % 23 === 0 ? 4 + wave * 8 : i % 11 === 0 ? 1.5 : 0.05,
    );
    push("bw:in", t, (180 + wave * 520 + ramp * 200) * burst);
    push("bw:out", t, (140 + wave2 * 440 + ramp * 160) * burst);
    push("conn", t, Math.round(4 + wave * 10 + (i > 50 ? 6 : 0)));
    push("sub", t, Math.round(8 + wave2 * 18 + (i > 45 ? 10 : 0)));
    push("chan", t, Math.round(3 + wave * 5 + ramp * 4));
  }

  state = {
    lastCollectedAt: new Date(now).toISOString(),
    lastStats: {
      conn: series.conn.at(-1)?.[1] ?? 0,
      sub: series.sub.at(-1)?.[1] ?? 0,
      chan: series.chan.at(-1)?.[1] ?? 0,
      "msg:in": 0,
      "msg:out": 0,
      "msg:drop": 0,
      "bw:in": 0,
      "bw:out": 0,
    },
    series,
  };
  notify();
}
