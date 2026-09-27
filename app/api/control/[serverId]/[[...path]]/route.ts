import { NextRequest, NextResponse } from "next/server";
import { controlProxy, ControlError } from "@/lib/control/client";
import { getSession } from "@/lib/auth/session";
import { insertAudit } from "@/lib/db";

type Ctx = { params: Promise<{ serverId: string; path?: string[] }> };

async function forward(req: NextRequest, ctx: Ctx, method: string) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { serverId, path = [] } = await ctx.params;
  const suffix = path.length ? `/${path.join("/")}` : "";
  const search = req.nextUrl.search;
  const controlPath = `/control/v1${suffix}${search}`;

  let body: unknown;
  if (method !== "GET" && method !== "HEAD") {
    const text = await req.text();
    body = text ? JSON.parse(text) : undefined;
  }

  try {
    const data = await controlProxy(serverId, method, controlPath, body);
    if (method !== "GET") {
      insertAudit({
        severity: "info",
        category: "control",
        message: `${method} ${controlPath}`,
        server_id: serverId,
        tenant_id: null,
        metadata: null,
      });
    }
    if (data === undefined) {
      return new NextResponse(null, { status: 204 });
    }
    return NextResponse.json(data);
  } catch (e) {
    if (e instanceof ControlError) {
      return new NextResponse(e.body, {
        status: e.status,
        headers: { "Content-Type": "application/json" },
      });
    }
    return NextResponse.json({ error: "Control proxy failed" }, { status: 502 });
  }
}

export async function GET(req: NextRequest, ctx: Ctx) {
  return forward(req, ctx, "GET");
}
export async function POST(req: NextRequest, ctx: Ctx) {
  return forward(req, ctx, "POST");
}
export async function PUT(req: NextRequest, ctx: Ctx) {
  return forward(req, ctx, "PUT");
}
export async function DELETE(req: NextRequest, ctx: Ctx) {
  return forward(req, ctx, "DELETE");
}
