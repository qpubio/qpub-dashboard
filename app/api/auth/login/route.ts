import { NextRequest, NextResponse } from "next/server";
import { verifyAdminPassword } from "@/lib/auth/password";
import { checkRateLimit, clearFailures, recordFailure } from "@/lib/auth/rate-limit";
import { getSession } from "@/lib/auth/session";
import { env } from "@/config/env";
import { insertAudit } from "@/lib/db";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const limit = checkRateLimit(ip);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec ?? 900) } },
    );
  }

  const body = (await req.json()) as { username?: string; password?: string };
  if (body.username !== env.adminUser || !(await verifyAdminPassword(body.password ?? ""))) {
    recordFailure(ip);
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  clearFailures(ip);
  const session = await getSession();
  session.user = body.username;
  session.isLoggedIn = true;
  await session.save();

  insertAudit({
    severity: "info",
    category: "auth",
    message: "Admin signed in",
    server_id: null,
    tenant_id: null,
    metadata: null,
  });

  return NextResponse.json({ user: body.username });
}
