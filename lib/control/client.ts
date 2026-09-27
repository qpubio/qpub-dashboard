import { decryptSecret } from "@/lib/crypto/secrets";
import { env } from "@/config/env";
import { getServer, updateServerHealth } from "@/lib/db";
import type {
  APIKey,
  ChannelSummary,
  ConnectionSummary,
  JobSummary,
  Limits,
  MetricsRollup,
  Pagination,
  QueueSummary,
  ServerInfo,
  StatsMap,
  Tenant,
  WorkerSummary,
} from "./types";

export class ControlError extends Error {
  status: number;
  body: string;

  constructor(status: number, body: string) {
    super(body || `Control API error (${status})`);
    this.status = status;
    this.body = body;
  }
}

type ServerCreds = { baseUrl: string; token: string };

export function serverCreds(serverId: string): ServerCreds {
  const row = getServer(serverId);
  if (!row) throw new ControlError(404, "Server not registered");
  return {
    baseUrl: row.control_url,
    token: decryptSecret(row.control_token_enc, env.dashboardSecret),
  };
}

async function controlFetch<T>(
  creds: ServerCreds,
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const url = `${creds.baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (creds.token) {
    headers.Authorization = `Bearer ${creds.token}`;
  }
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) {
    throw new ControlError(res.status, text);
  }
  if (res.status === 204 || text === "") {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}

export async function healthCheck(serverId: string) {
  const creds = serverCreds(serverId);
  try {
    const res = await fetch(`${creds.baseUrl}/health`, { cache: "no-store" });
    const ok = res.ok;
    updateServerHealth(serverId, ok ? "healthy" : "unhealthy");
    return ok;
  } catch {
    updateServerHealth(serverId, "unreachable");
    return false;
  }
}

export function controlProxy(
  serverId: string,
  method: string,
  path: string,
  body?: unknown,
) {
  return controlFetch<unknown>(serverCreds(serverId), method, path, body);
}

export async function getServerInfo(serverId: string) {
  return controlFetch<ServerInfo>(serverCreds(serverId), "GET", "/control/v1/server");
}

export async function getMetrics(serverId: string) {
  return controlFetch<MetricsRollup>(serverCreds(serverId), "GET", "/control/v1/metrics");
}

export async function listTenants(serverId: string, page = 1, perPage = 20) {
  return controlFetch<{ tenants: Tenant[]; pagination: Pagination }>(
    serverCreds(serverId),
    "GET",
    `/control/v1/tenants?page=${page}&per_page=${perPage}`,
  );
}

export async function getTenant(serverId: string, tenantId: number) {
  return controlFetch<Tenant>(serverCreds(serverId), "GET", `/control/v1/tenants/${tenantId}`);
}

export async function createTenant(serverId: string, id: number) {
  return controlFetch<Tenant>(serverCreds(serverId), "POST", "/control/v1/tenants", { id });
}

export async function deleteTenant(serverId: string, tenantId: number) {
  return controlFetch<{ status: string; tenant_id: number }>(
    serverCreds(serverId),
    "DELETE",
    `/control/v1/tenants/${tenantId}`,
  );
}

export async function getTenantStats(serverId: string, tenantId: number) {
  return controlFetch<{ tenant_id: number; stats: StatsMap }>(
    serverCreds(serverId),
    "GET",
    `/control/v1/tenants/${tenantId}/stats`,
  );
}

export async function getLimits(serverId: string, tenantId: number) {
  return controlFetch<Limits>(
    serverCreds(serverId),
    "GET",
    `/control/v1/tenants/${tenantId}/limits`,
  );
}

export async function setLimits(
  serverId: string,
  tenantId: number,
  inbound: number,
  outbound: number,
) {
  return controlFetch<Limits>(serverCreds(serverId), "PUT", `/control/v1/tenants/${tenantId}/limits`, {
    inbound_per_second: inbound,
    outbound_per_second: outbound,
  });
}

export async function listKeys(serverId: string, tenantId: number) {
  const res = await controlFetch<{ keys: APIKey[] }>(
    serverCreds(serverId),
    "GET",
    `/control/v1/tenants/${tenantId}/keys`,
  );
  return res.keys;
}

export async function createKey(
  serverId: string,
  tenantId: number,
  body: { name: string; permission?: unknown; status?: string },
) {
  return controlFetch<APIKey>(
    serverCreds(serverId),
    "POST",
    `/control/v1/tenants/${tenantId}/keys`,
    body,
  );
}

export async function updateKey(
  serverId: string,
  tenantId: number,
  keyId: number,
  body: { name: string; permission?: unknown; status?: string },
) {
  return controlFetch<APIKey>(
    serverCreds(serverId),
    "PUT",
    `/control/v1/tenants/${tenantId}/keys/${keyId}`,
    body,
  );
}

export async function deleteKey(serverId: string, tenantId: number, keyId: number) {
  return controlFetch<void>(
    serverCreds(serverId),
    "DELETE",
    `/control/v1/tenants/${tenantId}/keys/${keyId}`,
  );
}

export async function listQueues(serverId: string, tenantId: number, page = 1) {
  return controlFetch<{ queues: QueueSummary[]; pagination: Pagination }>(
    serverCreds(serverId),
    "GET",
    `/control/v1/tenants/${tenantId}/queues?page=${page}&per_page=20`,
  );
}

export async function listWorkers(serverId: string, tenantId: number, page = 1) {
  return controlFetch<{ workers: WorkerSummary[]; pagination: Pagination }>(
    serverCreds(serverId),
    "GET",
    `/control/v1/tenants/${tenantId}/workers?page=${page}&per_page=20`,
  );
}

export async function listJobs(
  serverId: string,
  tenantId: number,
  queueName: string,
  status?: string,
) {
  const q = status ? `?status=${encodeURIComponent(status)}&limit=50` : "?limit=50";
  return controlFetch<{ jobs: JobSummary[] }>(
    serverCreds(serverId),
    "GET",
    `/control/v1/tenants/${tenantId}/queues/${encodeURIComponent(queueName)}/jobs${q}`,
  );
}

export async function listConnections(serverId: string, tenantId: number, page = 1) {
  return controlFetch<{ connections: ConnectionSummary[]; pagination: Pagination }>(
    serverCreds(serverId),
    "GET",
    `/control/v1/tenants/${tenantId}/connections?page=${page}&per_page=50`,
  );
}

export async function listChannels(serverId: string, tenantId: number, page = 1) {
  return controlFetch<{ channels: ChannelSummary[]; pagination: Pagination }>(
    serverCreds(serverId),
    "GET",
    `/control/v1/tenants/${tenantId}/channels?page=${page}&per_page=50`,
  );
}
