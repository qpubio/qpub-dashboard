import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "crypto";

function keyFromSecret(secret: string): Buffer {
  return createHash("sha256").update(secret).digest();
}

export function encryptSecret(
  plaintext: string,
  dashboardSecret: string,
): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(
    "aes-256-gcm",
    keyFromSecret(dashboardSecret),
    iv,
  );
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decryptSecret(
  payload: string,
  dashboardSecret: string,
): string {
  const buf = Buffer.from(payload, "base64");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const data = buf.subarray(28);
  const decipher = createDecipheriv(
    "aes-256-gcm",
    keyFromSecret(dashboardSecret),
    iv,
  );
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString(
    "utf8",
  );
}
