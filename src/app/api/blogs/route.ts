import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Public GET — published blogs only
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const q = searchParams.get("q")?.trim();
  const featured = searchParams.get("featured") === "1";

  let query = supabaseAdmin
    .from("blogs")
    .select(
      "id, title, slug, excerpt, featured_image_url, published_at, author_name, category, is_featured, view_count, reading_time_minutes, tags"
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (category) query = query.eq("category", category);
  if (featured) query = query.eq("is_featured", true);
  if (q) query = query.or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`);

  const { data, error } = await query;
  if (error) {
    // Table might not exist yet
    return NextResponse.json({ success: true, blogs: [] });
  }

  return NextResponse.json({ success: true, blogs: data ?? [] });
}
