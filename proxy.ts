import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sessionOptions } from "@/lib/auth/session";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isLogin = pathname === "/login";
  const isApi = pathname.startsWith("/api/");
  if (isApi) {
    return NextResponse.next();
  }

  const authed = Boolean(request.cookies.get(sessionOptions.cookieName));

  if (authed && isLogin) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (!authed && !isLogin) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)$).*)",
  ],
};
