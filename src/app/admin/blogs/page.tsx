"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Loader2,
  Eye,
  Filter,
  FileText,
  Star,
  Pencil,
  Calendar,
  AlertTriangle,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BlogRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  status: "draft" | "published" | "scheduled";
  published_at: string | null;
  scheduled_at: string | null;
  author_name: string | null;
  category: string | null;
  is_featured: boolean;
  view_count: number;
  seo_score: number;
  tags: string[];
  created_at: string;
}

export default function AdminBlogsPage() {
  const [ready, setReady] = useState<boolean | null>(null);
  const [blogs, setBlogs] = useState<BlogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [copied, setCopied] = useState(false);

  const fetchBlogs = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (status !== "all") params.set("status", status);
    const res = await fetch(`/api/admin/blogs?${params}`);
    const body = await res.json();
    if (!body.ready) {
      setReady(false);
      setLoading(false);
      return;
    }
    setReady(true);
    if (body.success) setBlogs(body.blogs);
    setLoading(false);
  };

  useEffect(() => {
    const t = setTimeout(fetchBlogs, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, status]);

  // ─── Migration-needed screen ──
  if (ready === false) {
    const path = "supabase/migrations/0004_blogs.sql";
    return (
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white">
            Blogs
          </h1>
          <p className="text-sm text-gray-500 mt-2">Database migration required</p>
        </div>
        <div className="bg-[#161A21] border border-shop-yellow/20 rounded-2xl p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-shop-yellow/10 text-shop-yellow flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-black uppercase tracking-tighter text-white">
                Migration needed
              </h2>
              <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                The <code className="text-shop-yellow">blogs</code>,{" "}
                <code className="text-shop-yellow">affiliate_links</code>, and{" "}
                <code className="text-shop-yellow">blog_analytics</code> tables don&apos;t
                exist yet. Run the migration to enable this section.
              </p>
              <ol className="space-y-3 mt-6 text-sm text-gray-400">
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-shop-yellow/10 text-shop-yellow flex items-center justify-center text-xs font-black shrink-0">
                    1
                  </span>
                  <div>
                    Open the migration file:
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(path);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1500);
                      }}
                      className="flex items-center gap-2 mt-2 px-3 py-2 bg-[#0F1115] rounded-lg border border-white/5 text-xs font-mono text-shop-yellow hover:border-shop-yellow/30 transition-colors"
                    >
                      {path}
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-green-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-shop-yellow/10 text-shop-yellow flex items-center justify-center text-xs font-black shrink-0">
                    2
                  </span>
                  <div>
                    Paste into{" "}
                    <a
                      href="https://supabase.com/dashboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-shop-yellow hover:underline"
                    >
                      Supabase Dashboard
                    </a>{" "}
                    → <strong>SQL Editor</strong> → <strong>Run</strong>. Seeds 2 sample posts.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-shop-yellow/10 text-shop-yellow flex items-center justify-center text-xs font-black shrink-0">
                    3
                  </span>
                  <div>Refresh this page — the blog dashboard unlocks.</div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white">
            Blogs
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {loading ? "…" : `${blogs.length} post${blogs.length === 1 ? "" : "s"}`} ·
            SEO content + affiliate monetization
          </p>
        </div>
        <Link
          href="/admin/blogs/new"
          className="flex items-center gap-2 bg-shop-yellow text-shop-black px-5 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-white transition-colors shadow-lg shadow-shop-yellow/20"
        >
          <Plus className="w-4 h-4" />
          New Blog
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-[#161A21] border border-white/5 rounded-2xl p-4 flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or excerpt…"
            className="w-full pl-11 pr-4 py-2.5 bg-[#0F1115] rounded-xl border-2 border-white/5 text-sm text-white placeholder-gray-600 outline-none focus:border-shop-yellow/50 transition-colors"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="pl-11 pr-8 py-2.5 bg-[#0F1115] rounded-xl border-2 border-white/5 text-sm text-white outline-none focus:border-shop-yellow/50 appearance-none cursor-pointer"
          >
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#161A21] border border-white/5 rounded-2xl overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-gray-500">
          <div className="col-span-5">Title</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Views / SEO</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
          </div>
        ) : blogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <FileText className="w-7 h-7 text-gray-600" />
            </div>
            <p className="text-sm font-black uppercase tracking-widest text-gray-400">
              No blogs yet
            </p>
            <Link
              href="/admin/blogs/new"
              className="mt-6 flex items-center gap-2 bg-shop-yellow text-shop-black px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-white transition-colors"
            >
              <Plus className="w-4 h-4" /> Write Your First Blog
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {blogs.map((b) => (
              <Link
                key={b.id}
                href={`/admin/blogs/${b.id}/edit`}
                className="grid grid-cols-12 gap-3 px-5 py-4 items-center hover:bg-white/[0.02] transition-colors group"
              >
                <div className="col-span-12 md:col-span-5 flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-lg bg-white/5 overflow-hidden shrink-0">
                    {b.featured_image_url ? (
                      <img
                        src={b.featured_image_url}
                        alt=""
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-5 h-5 text-gray-600" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-white truncate group-hover:text-shop-yellow transition-colors">
                        {b.title}
                      </p>
                      {b.is_featured && (
                        <Star className="w-3 h-3 text-shop-yellow fill-shop-yellow shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-0.5">
                      /{b.slug} · {b.author_name ?? "—"}
                    </p>
                  </div>
                </div>

                <div className="col-span-4 md:col-span-2">
                  <StatusPill status={b.status} />
                </div>

                <div className="col-span-4 md:col-span-2">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Eye className="w-3.5 h-3.5" />
                    <span className="font-bold text-white">
                      {b.view_count.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-1">
                    <SeoScoreBar score={b.seo_score} />
                  </div>
                </div>

                <div className="col-span-4 md:col-span-2 flex items-center gap-1.5 text-[11px] text-gray-500">
                  <Calendar className="w-3 h-3" />
                  {new Date(
                    b.published_at ?? b.scheduled_at ?? b.created_at
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>

                <div className="col-span-12 md:col-span-1 flex justify-end">
                  <div className="p-2 rounded-lg text-gray-500 group-hover:bg-shop-yellow group-hover:text-shop-black transition-all">
                    <Pencil className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: "draft" | "published" | "scheduled" }) {
  const cfg: Record<typeof status, { cls: string; label: string }> = {
    published: {
      cls: "bg-green-500/10 text-green-400",
      label: "Published",
    },
    draft: {
      cls: "bg-gray-500/10 text-gray-400",
      label: "Draft",
    },
    scheduled: {
      cls: "bg-blue-500/10 text-blue-400",
      label: "Scheduled",
    },
  };
  return (
    <span
      className={cn(
        "text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded",
        cfg[status].cls
      )}
    >
      {cfg[status].label}
    </span>
  );
}

function SeoScoreBar({ score }: { score: number }) {
  const color =
    score >= 80
      ? "bg-green-500"
      : score >= 50
      ? "bg-yellow-500"
      : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full", color)}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-[10px] font-black text-gray-500 shrink-0">
        {score}
      </span>
    </div>
  );
}
