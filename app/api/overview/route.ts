import { NextResponse } from "next/server";
import { aggregateOverview } from "@/lib/aggregate/overview";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await aggregateOverview();
  return NextResponse.json(data);
}
