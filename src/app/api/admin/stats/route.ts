import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  // Run all counts in parallel (blogs may not exist yet — fall back to 0)
  const [stickers, users, reviews, faqs, blogs] = await Promise.all([
    supabaseAdmin.from("Stickers").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("users").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("reviews").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("faqs").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("blogs").select("id", { count: "exact", head: true }),
  ]);

  // Recent stickers (last 5)
  const { data: recentStickers } = await supabaseAdmin
    .from("Stickers")
    .select("id, Title, price, category, image, createdAt")
    .order("createdAt", { ascending: false })
    .limit(5);

  return NextResponse.json({
    success: true,
    stats: {
      stickers: stickers.count ?? 0,
      users: users.count ?? 0,
      reviews: reviews.count ?? 0,
      faqs: faqs.count ?? 0,
      blogs: blogs.count ?? 0,
    },
    recentStickers: recentStickers ?? [],
  });
}
