import {
  appendSnapshot,
  createHistoryState,
  type MetricHistoryState,
  type MetricSnapshot,
} from "@/lib/metrics/history";

type Listener = () => void;

let state: MetricHistoryState = createHistoryState();
const listeners = new Set<Listener>();

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
  const next = appendSnapshot(state, snapshot);
  if (next === state) return;
  state = next;
  notify();
}
