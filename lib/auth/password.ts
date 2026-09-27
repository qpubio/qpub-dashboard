import bcrypt from "bcryptjs";
import { env } from "@/config/env";

let cachedHash: string | null = null;

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const hash = await adminPasswordHash();
  return bcrypt.compare(password, hash);
}

export async function adminPasswordHash(): Promise<string> {
  if (cachedHash) return cachedHash;
  if (env.adminPasswordHash) {
    cachedHash = env.adminPasswordHash;
    return cachedHash;
  }
  cachedHash = await bcrypt.hash(env.adminPasswordPlain, 12);
  return cachedHash;
}
