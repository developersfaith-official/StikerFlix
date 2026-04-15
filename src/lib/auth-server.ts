// Server-side auth utilities: password hashing, JWT sign/verify, session cookie helpers.
// Import only from server code (API routes, middleware, server components).

import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import crypto from "crypto";
import { supabaseAdmin } from "./supabase-admin";

const JWT_SECRET = process.env.AUTH_JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("AUTH_JWT_SECRET is not set. Add it to .env.local.");
}
const SECRET_BYTES = new TextEncoder().encode(JWT_SECRET);

export const SESSION_COOKIE = "sf_session";
export const ADMIN_SESSION_COOKIE = "sf_admin_session";

export interface SessionPayload {
  sub: string; // user_id or admin_user_id
  isAdmin: boolean;
  email: string;
}

// ── Password ───────────────────────────────────────────────────────────
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ── JWT ────────────────────────────────────────────────────────────────
export async function signJwt(
  payload: SessionPayload,
  expiresInSeconds: number
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresInSeconds)
    .sign(SECRET_BYTES);
}

export async function verifyJwt(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_BYTES);
    return {
      sub: payload.sub as string,
      isAdmin: payload.isAdmin as boolean,
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}

// ── Session (DB row + cookie) ─────────────────────────────────────────
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

interface CreateSessionOptions {
  userId?: string;
  adminUserId?: string;
  email: string;
  rememberMe: boolean;
  userAgent?: string;
  ipAddress?: string;
}

export async function createSession(opts: CreateSessionOptions): Promise<{
  token: string;
  expiresAt: Date;
  cookieName: string;
  maxAgeSeconds: number | undefined;
}> {
  const isAdmin = !!opts.adminUserId;
  const ownerId = opts.userId ?? opts.adminUserId!;

  // 30 days with rememberMe, 7 days without (admins always 1 day)
  const maxAgeSeconds = isAdmin
    ? 60 * 60 * 24 * 1
    : opts.rememberMe
    ? 60 * 60 * 24 * 30
    : 60 * 60 * 24 * 7;

  const expiresAt = new Date(Date.now() + maxAgeSeconds * 1000);

  const token = await signJwt(
    { sub: ownerId, isAdmin, email: opts.email },
    maxAgeSeconds
  );

  // Record session row (for revocation capability)
  await supabaseAdmin.from("sessions").insert({
    user_id: opts.userId ?? null,
    admin_user_id: opts.adminUserId ?? null,
    token_hash: hashToken(token),
    expires_at: expiresAt.toISOString(),
    remember_me: opts.rememberMe,
    user_agent: opts.userAgent ?? null,
    ip_address: opts.ipAddress ?? null,
  });

  return {
    token,
    expiresAt,
    cookieName: isAdmin ? ADMIN_SESSION_COOKIE : SESSION_COOKIE,
    // If not rememberMe, set as a session cookie (no maxAge) for customer login.
    maxAgeSeconds: !isAdmin && !opts.rememberMe ? undefined : maxAgeSeconds,
  };
}

// Read + verify the session from the incoming request's cookies
export async function getSession(admin = false): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(admin ? ADMIN_SESSION_COOKIE : SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifyJwt(token);
  if (!payload) return null;
  if (admin && !payload.isAdmin) return null;
  if (!admin && payload.isAdmin) return null;
  return payload;
}

// Delete session row by token hash
export async function deleteSessionByToken(token: string): Promise<void> {
  await supabaseAdmin
    .from("sessions")
    .delete()
    .eq("token_hash", hashToken(token));
}
