import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { deleteServer, insertAudit, listServers, upsertServer } from "@/lib/db";
import { healthCheck } from "@/lib/control/client";

async function requireAuth() {
  const session = await getSession();
  if (!session.isLoggedIn) return null;
  return session;
}

export async function GET() {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const servers = listServers().map(
    ({ control_token_enc: _t, ...rest }) => rest,
  );
  return NextResponse.json({ servers });
}

export async function POST(req: NextRequest) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json()) as {
    id?: string;
    name: string;
    control_url: string;
    control_token?: string;
  };
  if (!body.name || !body.control_url) {
    return NextResponse.json(
      { error: "name and control_url required" },
      { status: 400 },
    );
  }
  if (!body.id && !body.control_token?.trim()) {
    return NextResponse.json(
      { error: "control_token required for new server" },
      { status: 400 },
    );
  }
  let row: ReturnType<typeof upsertServer>;
  try {
    row = upsertServer(body);
  } catch {
    return NextResponse.json(
      { error: "control_token required for new server" },
      { status: 400 },
    );
  }
  await healthCheck(row.id);
  insertAudit({
    severity: "info",
    category: "server",
    message: `Server registered: ${row.name}`,
    server_id: row.id,
    tenant_id: null,
    metadata: null,
  });
  const { control_token_enc: _t, ...safe } = row;
  return NextResponse.json({ server: safe });
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  deleteServer(id);
  insertAudit({
    severity: "warning",
    category: "server",
    message: `Server removed: ${id}`,
    server_id: id,
    tenant_id: null,
    metadata: null,
  });
  return NextResponse.json({ ok: true });
}
