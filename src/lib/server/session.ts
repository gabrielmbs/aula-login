import "server-only";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createSessionToken,
  SESSION_DURATION,
  verifySessionToken,
} from "@/lib/session-token";
import type { SessionUser } from "@/types/auth.types";
import { ApiError } from "./api";

const COOKIE_NAME = "cadastroweb_session";
const developmentGlobal = globalThis as typeof globalThis & {
  cadastroWebSessionSecret?: string;
};

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;

  if (secret && secret.length >= 32) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new ApiError(
      "Configure uma SESSION_SECRET com pelo menos 32 caracteres no servidor.",
      503,
    );
  }

  developmentGlobal.cadastroWebSessionSecret ??=
    randomBytes(48).toString("hex");
  return developmentGlobal.cadastroWebSessionSecret;
}

export async function getSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  return token ? verifySessionToken(token, getSecret()) : null;
}

export async function createSession(user: SessionUser): Promise<void> {
  (await cookies()).set(COOKIE_NAME, createSessionToken(user, getSecret()), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION,
  });
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}

export async function requireSession(): Promise<SessionUser> {
  const user = await getSession();
  if (!user)
    throw new ApiError(
      "Sua sessão expirou. Entre novamente para continuar.",
      401,
    );
  return user;
}

export async function requirePageSession(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) redirect("/login");
  return user;
}
