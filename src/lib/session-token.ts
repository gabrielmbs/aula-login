import { createHmac, timingSafeEqual } from "node:crypto";
import type { SessionUser } from "../types/auth.types";

export const SESSION_DURATION = 60 * 60 * 8;

export function createSessionToken(
  user: SessionUser,
  secret: string,
  expiresAt = Date.now() + SESSION_DURATION * 1000,
): string {
  const payload = Buffer.from(JSON.stringify({ user, expiresAt })).toString(
    "base64url",
  );
  const signature = createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

export function verifySessionToken(
  token: string,
  secret: string,
  now = Date.now(),
): SessionUser | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2 || parts.some((part) => !/^[\w-]+$/.test(part)))
      return null;

    const [payload, signature] = parts;
    const expected = createHmac("sha256", secret).update(payload).digest();
    const received = Buffer.from(signature, "base64url");

    if (
      expected.length !== received.length ||
      !timingSafeEqual(expected, received)
    )
      return null;

    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));

    if (
      !data ||
      typeof data.expiresAt !== "number" ||
      data.expiresAt <= now ||
      !data.user ||
      typeof data.user.name !== "string" ||
      typeof data.user.email !== "string" ||
      typeof data.user.role !== "string"
    )
      return null;

    return {
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
    };
  } catch {
    return null;
  }
}
