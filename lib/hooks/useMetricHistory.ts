"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useOverview } from "@/lib/hooks/useOverview";
import {
  getMetricHistory,
  recordMetricSnapshot,
  seedDemoMetricHistory,
  subscribeMetricHistory,
} from "@/lib/metrics/store";
import type { MetricHistoryState } from "@/lib/metrics/history";

/** Mount once in DashboardShell — appends overview polls into the session ring buffer. */
export function useMetricHistoryRecorder(): void {
  const { data } = useOverview();

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      (window as Window & { __seedLedDemo?: () => void }).__seedLedDemo =
        seedDemoMetricHistory;
    }
  }, []);

  useEffect(() => {
    if (!data) return;
    recordMetricSnapshot({
      collectedAt: data.collectedAt,
      stats: data.stats,
    });
  }, [data]);
}

export function useMetricHistory(): MetricHistoryState {
  return useSyncExternalStore(
    subscribeMetricHistory,
    getMetricHistory,
    getMetricHistory,
  );
}
