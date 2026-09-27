"use client";

import { apiFetch } from "@/lib/api/client";

export function controlUrl(serverId: string, path: string) {
  const clean = path.replace(/^\/control\/v1/, "").replace(/^\//, "");
  return `/api/control/${serverId}/${clean}`;
}

export async function controlGet<T>(serverId: string, path: string) {
  return apiFetch<T>(controlUrl(serverId, path));
}

export async function controlMutate<T>(
  serverId: string,
  method: string,
  path: string,
  body?: unknown,
) {
  return apiFetch<T>(controlUrl(serverId, path), {
    method,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}
