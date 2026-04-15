// Public GET endpoint — returns the category tree for UI dropdowns.
// Anyone can read categories (they're public info); writes require admin.

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  subcategories: CategoryNode[];
}

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  sort_order: number;
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("id, name, slug, parent_id, sort_order")
    .order("sort_order", { ascending: true });

  if (error) {
    // Table might not exist yet (migration not run) — return empty list.
    return NextResponse.json({ success: true, categories: [] });
  }

  const rows: CategoryRow[] = data ?? [];

  // Build id → node map
  const byId: Record<string, CategoryNode> = {};
  rows.forEach((r) => {
    byId[r.id] = {
      id: r.id,
      name: r.name,
      slug: r.slug,
      sort_order: r.sort_order,
      subcategories: [],
    };
  });

  // Link children to their parents
  const roots: CategoryNode[] = [];
  rows.forEach((r) => {
    const node = byId[r.id];
    if (r.parent_id && byId[r.parent_id]) {
      byId[r.parent_id].subcategories.push(node);
    } else {
      roots.push(node);
    }
  });

  return NextResponse.json({ success: true, categories: roots });
}
