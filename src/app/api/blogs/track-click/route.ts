import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// POST { blogId, url } — records an affiliate click in blog_analytics
// (today's row, upsert-style).
export async function POST(req: NextRequest) {
  try {
    const { blogId } = await req.json();
    if (typeof blogId !== "string" || !blogId) {
      return NextResponse.json({ error: "blogId required" }, { status: 400 });
    }

    const today = new Date().toISOString().slice(0, 10);

    // Try to increment today's row; if it doesn't exist, insert it.
    const { data: existing } = await supabaseAdmin
      .from("blog_analytics")
      .select("id, affiliate_clicks")
      .eq("blog_id", blogId)
      .eq("date", today)
      .maybeSingle();

    if (existing) {
      await supabaseAdmin
        .from("blog_analytics")
        .update({ affiliate_clicks: (existing.affiliate_clicks ?? 0) + 1 })
        .eq("id", existing.id);
    } else {
      await supabaseAdmin.from("blog_analytics").insert({
        blog_id: blogId,
        date: today,
        affiliate_clicks: 1,
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
