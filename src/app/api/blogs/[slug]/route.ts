import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Public GET — single published blog by slug + increment view count
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const { data, error } = await supabaseAdmin
    .from("blogs")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Fire-and-forget view increment (ignore errors)
  supabaseAdmin
    .from("blogs")
    .update({ view_count: (data.view_count ?? 0) + 1 })
    .eq("id", data.id)
    .then(() => {});

  // Related: same category, exclude current, limit 3
  const { data: related } = await supabaseAdmin
    .from("blogs")
    .select(
      "id, title, slug, excerpt, featured_image_url, published_at, reading_time_minutes"
    )
    .eq("status", "published")
    .eq("category", data.category ?? "")
    .neq("id", data.id)
    .order("published_at", { ascending: false })
    .limit(3);

  return NextResponse.json({
    success: true,
    blog: data,
    related: related ?? [],
  });
}
