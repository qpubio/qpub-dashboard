import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { env } from "@/config/env";

export type SessionData = {
  user?: string;
  isLoggedIn: boolean;
};

export const sessionOptions: SessionOptions = {
  password: env.dashboardSecret,
  cookieName: "qpub_dashboard_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  },
};

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}
