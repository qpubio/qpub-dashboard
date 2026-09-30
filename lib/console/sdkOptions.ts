import { env } from "@/config/env";
import type { APIKey } from "@/lib/control/types";

/** Parse hostname from a server control_url for SDK WS/REST endpoints. */
export function hostFromControlUrl(controlUrl: string): string | null {
  try {
    return new URL(controlUrl).hostname || null;
  } catch {
    return null;
  }
}

/** Control API returns secret alone; SDK expects `publicId:secret`. */
export function apiKeyCredential(
  key: Pick<APIKey, "id" | "secret_key">,
): string | null {
  if (!key.secret_key) return null;
  if (key.secret_key.includes(":")) return key.secret_key;
  return `${key.id}:${key.secret_key}`;
}

export function restBaseUrl(host: string): string {
  const protocol = env.sdkIsSecure ? "https" : "http";
  const port = env.sdkRestPort;
  const origin = port
    ? `${protocol}://${host}:${port}`
    : `${protocol}://${host}`;
  return `${origin}/v1`;
}

export function socketOptions(apiKey: string, host: string) {
  return {
    apiKey,
    autoConnect: Boolean(apiKey),
    wsHost: host,
    wsPort: env.sdkWsPort,
    isSecure: env.sdkIsSecure,
    debug: env.sdkDebug,
  };
}
