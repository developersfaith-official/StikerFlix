// Server-only: wraps API route handlers to require an admin session.
// Returns a 401 if no valid admin session cookie is present.

import { NextResponse } from "next/server";
import { getSession, SessionPayload } from "./auth-server";

export async function requireAdmin(): Promise<
  { ok: true; session: SessionPayload } | { ok: false; response: NextResponse }
> {
  const session = await getSession(true);
  if (!session || !session.isAdmin) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }
  return { ok: true, session };
}
