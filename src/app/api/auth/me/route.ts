import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const isAdmin = searchParams.get("admin") === "1";

  const session = await getSession(isAdmin);
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const table = isAdmin ? "admin_users" : "users";
  const columns = isAdmin ? "id, email, name, role" : "id, email, name, phone";

  const { data: user } = await supabaseAdmin
    .from(table)
    .select(columns)
    .eq("id", session.sub)
    .maybeSingle();

  if (!user) return NextResponse.json({ user: null }, { status: 401 });

  return NextResponse.json({
    user: {
      id: (user as { id: string }).id,
      email: (user as { email: string }).email,
      name: (user as { name: string }).name,
      phone: isAdmin ? null : (user as { phone?: string | null }).phone ?? null,
      isAdmin,
    },
  });
}
