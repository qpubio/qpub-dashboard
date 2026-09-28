type Entry = { failures: number; resetAt: number };

const store = new Map<string, Entry>();

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;

export function checkRateLimit(key: string): {
  allowed: boolean;
  retryAfterSec?: number;
} {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || entry.resetAt <= now) {
    store.set(key, { failures: 0, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }
  if (entry.failures >= MAX_FAILURES) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((entry.resetAt - now) / 1000),
    };
  }
  return { allowed: true };
}

export function recordFailure(key: string) {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || entry.resetAt <= now) {
    store.set(key, { failures: 1, resetAt: now + WINDOW_MS });
    return;
  }
  entry.failures += 1;
}

export function clearFailures(key: string) {
  store.delete(key);
}
