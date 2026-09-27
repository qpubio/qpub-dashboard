"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import type { OverviewAggregate } from "@/lib/aggregate/overview";

export function useOverview() {
  return useQuery({
    queryKey: ["overview"],
    queryFn: () => apiFetch<OverviewAggregate>("/api/overview"),
    refetchInterval: 2000,
  });
}
