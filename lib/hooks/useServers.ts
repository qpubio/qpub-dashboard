"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";

export type ServerRecord = {
  id: string;
  name: string;
  control_url: string;
  last_health: string | null;
  last_seen_at: string | null;
  created_at: string;
};

export function useServers() {
  return useQuery({
    queryKey: ["servers"],
    queryFn: () => apiFetch<{ servers: ServerRecord[] }>("/api/servers"),
  });
}

export function useRegisterServer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name: string;
      control_url: string;
      control_token?: string;
      id?: string;
    }) =>
      apiFetch("/api/servers", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["servers"] }),
  });
}

export function useDeleteServer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/servers?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["servers"] }),
  });
}

export function useTestServerConnection() {
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{
        ok: boolean;
        error?: string;
        version?: string;
        health?: string;
      }>(`/api/servers/${encodeURIComponent(id)}/test`, { method: "POST" }),
  });
}
