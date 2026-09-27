import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { listAudit } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ events: listAudit(200) });
}
