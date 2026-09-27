export function friendlyApiError(status: number, raw: string, path: string): string {
  let errorField = raw;
  let messageField: string | undefined;
  try {
    const parsed = JSON.parse(raw) as { error?: string; message?: string };
    if (parsed.error) errorField = parsed.error;
    messageField = parsed.message;
  } catch {
    // keep raw
  }

  if (messageField) return messageField;

  if (status === 401) {
    if (errorField === "Unauthorized") {
      return "Dashboard session expired; sign in again.";
    }
    if (errorField.toLowerCase() === "unauthorized" && path.includes("/api/control/")) {
      return "Control API rejected the token; update it under Servers.";
    }
  }

  if (status === 404 && path.includes("/api/control/") && /tenant not found/i.test(errorField)) {
    return "Tenant not found; pick another tenant in the dropdown.";
  }

  return errorField || `Request failed (${status})`;
}
