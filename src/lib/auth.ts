// Client-side auth helpers — fetches the /api/auth/* routes.
// Safe to import from client components.

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  isAdmin: boolean;
}

interface AuthResult<T = PublicUser> {
  ok: boolean;
  data?: T;
  error?: string;
}

// ── Customer signup ───────────────────────────────────────────────────
export async function signup(
  email: string,
  password: string,
  name: string,
  phone?: string
): Promise<AuthResult> {
  try {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, phone }),
    });
    const body = await res.json();
    if (!res.ok) return { ok: false, error: body.error ?? "Signup failed" };
    return { ok: true, data: body.user };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}

// ── Login (customer or admin) ─────────────────────────────────────────
export async function login(
  email: string,
  password: string,
  opts: { isAdmin?: boolean; rememberMe?: boolean } = {}
): Promise<AuthResult> {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        isAdmin: !!opts.isAdmin,
        rememberMe: !!opts.rememberMe,
      }),
    });
    const body = await res.json();
    if (!res.ok) return { ok: false, error: body.error ?? "Login failed" };
    return { ok: true, data: body.user };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}

// ── Logout ────────────────────────────────────────────────────────────
export async function logout(isAdmin = false): Promise<void> {
  await fetch("/api/auth/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isAdmin }),
  });
}

// ── Current user ──────────────────────────────────────────────────────
export async function getUser(
  isAdmin = false
): Promise<PublicUser | null> {
  try {
    const res = await fetch(`/api/auth/me${isAdmin ? "?admin=1" : ""}`, {
      credentials: "include",
    });
    if (!res.ok) return null;
    const body = await res.json();
    return body.user ?? null;
  } catch {
    return null;
  }
}

export async function isAuthenticated(isAdmin = false): Promise<boolean> {
  return (await getUser(isAdmin)) !== null;
}
