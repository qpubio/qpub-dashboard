import { restBaseUrl } from "./sdkOptions";

export class QueueRestError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "QueueRestError";
    this.status = status;
    this.code = code;
  }
}

function authHeaders(apiKey: string): HeadersInit {
  return {
    Authorization: `Basic ${btoa(apiKey)}`,
    "Content-Type": "application/json",
  };
}

async function request<T>(
  host: string,
  apiKey: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${restBaseUrl(host)}${path}`, {
    ...init,
    headers: {
      ...authHeaders(apiKey),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let message = text || `Queue request failed (${res.status})`;
    let code: string | undefined;
    try {
      const parsed = JSON.parse(text) as { message?: string; code?: string };
      if (parsed.message) message = parsed.message;
      if (parsed.code) code = parsed.code;
    } catch {
      // body may be plain text
    }
    throw new QueueRestError(res.status, message, code);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export function createQueueRestClient(host: string, apiKey: string) {
  return {
    enqueue: async (
      queueName: string,
      payload: unknown,
      opts?: { delay?: string; scheduleAt?: string },
    ) => {
      const body: Record<string, unknown> = { payload };
      const delay = opts?.delay?.trim();
      if (delay) {
        body.delay = delay;
      }
      const scheduleAt = opts?.scheduleAt?.trim();
      if (scheduleAt) {
        body.schedule_at = scheduleAt;
      }
      return request<{ job_id: string; status: string }>(
        host,
        apiKey,
        `/queue/${encodeURIComponent(queueName)}/jobs`,
        {
          method: "POST",
          body: JSON.stringify(body),
        },
      );
    },
  };
}
