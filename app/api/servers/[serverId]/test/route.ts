import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { ControlError, getServerInfo, healthCheck } from "@/lib/control/client";

type Ctx = { params: Promise<{ serverId: string }> };

export async function POST(_req: Request, ctx: Ctx) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { serverId } = await ctx.params;
  const healthOk = await healthCheck(serverId);
  try {
    const info = await getServerInfo(serverId);
    return NextResponse.json({
      ok: true,
      health: healthOk ? "healthy" : "unhealthy",
      version: info.version,
    });
  } catch (e) {
    if (e instanceof ControlError) {
      let message = "Control API request failed";
      try {
        const parsed = JSON.parse(e.body) as { error?: string };
        if (parsed.error?.toLowerCase() === "unauthorized") {
          message = "Control API rejected the token; update it under Servers.";
        } else if (parsed.error) {
          message = parsed.error;
        }
      } catch {
        // keep default
      }
      return NextResponse.json(
        { ok: false, error: message },
        { status: e.status },
      );
    }
    return NextResponse.json(
      { ok: false, error: "Connection test failed" },
      { status: 502 },
    );
  }
}
