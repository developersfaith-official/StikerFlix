"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Clock,
  Eye,
  ArrowRight,
  Sparkles,
  Loader2,
  FolderTree,
  Mail,
  Instagram,
  Twitter,
  Youtube,
  Facebook,
  TrendingUp,
  Megaphone,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BlogListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  published_at: string | null;
  author_name: string | null;
  category: string | null;
  is_featured: boolean;
  view_count: number;
  reading_time_minutes: number;
  tags: string[];
}

// Topic pills — hints at content themes, clickable as search shortcuts.
const SUGGESTED_TOPICS = [
  "stickers",
  "house decor",
  "fabric stickers",
  "branding",
  "tutorial",
  "trends",
  "review",
];

export default function BlogListPage() {
  const [blogs, setBlogs] = useState<BlogListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      const res = await fetch("/api/blogs");
      const body = await res.json();
      if (body.success) setBlogs(body.blogs);
      setLoading(false);
    };
    fetchBlogs();
  }, []);

  // Filter client-side for smooth sidebar filtering
  const filtered = useMemo(() => {
    return blogs.filter((b) => {
      if (category !== "all" && b.category !== category) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        if (
          !b.title.toLowerCase().includes(q) &&
          !(b.excerpt?.toLowerCase().includes(q) ?? false)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [blogs, query, category]);

  // Derive categories + popular from full set (not filtered)
  const categories = useMemo(() => {
    const m: Record<string, number> = {};
    blogs.forEach((b) => {
      if (b.category) m[b.category] = (m[b.category] ?? 0) + 1;
    });
    const entries = Object.entries(m).map(([name, count]) => ({ name, count }));
    entries.sort((a, b) => b.count - a.count);
    return entries;
  }, [blogs]);

  const popular = useMemo(
    () => [...blogs].sort((a, b) => b.view_count - a.view_count).slice(0, 5),
    [blogs]
  );

  const featured = blogs.find((b) => b.is_featured) ?? filtered[0];
  const rest = filtered.filter((b) => b.id !== featured?.id);

  return (
    <div className="min-h-screen bg-bg-cream">
      {/* Hero */}
      <div className="bg-white border-b border-gray-100 px-4 md:px-12 py-12 md:py-16">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-shop-yellow mb-3">
            The StickerFlix Blog
          </p>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-shop-black">
            Stories, Tips & Guides
          </h1>
          <div className="h-1 w-16 bg-shop-yellow rounded-full mx-auto mt-4" />
          <p className="text-gray-500 mt-6 max-w-xl mx-auto font-medium leading-relaxed">
            Sticker trends, application tips, styling guides, and honest product
            reviews — everything you need to make your stuff look sharper.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        {/* Search — full width above 3-col grid */}
        <div className="relative max-w-2xl mx-auto mb-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles…"
            className="w-full pl-11 pr-4 py-3 bg-white rounded-full border border-gray-100 text-sm outline-none focus:ring-2 focus:ring-shop-yellow/30"
          />
        </div>

        {/* ═══ 3-column grid ═══ */}
        <div className="grid grid-cols-12 gap-6 lg:gap-8">
          {/* ── Left sidebar — Topics/Categories ── */}
          <aside className="col-span-12 lg:col-span-3 order-2 lg:order-1">
            <div className="lg:sticky lg:top-24 space-y-5">
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <FolderTree className="w-4 h-4 text-shop-yellow" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-shop-black">
                    Browse Topics
                  </h3>
                </div>
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => setCategory("all")}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-colors text-left",
                        category === "all"
                          ? "bg-shop-yellow/10 text-shop-yellow"
                          : "text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      <span>All Stories</span>
                      <span className="text-[10px] text-gray-400">
                        {blogs.length}
                      </span>
                    </button>
                  </li>
                  {categories.map((c) => (
                    <li key={c.name}>
                      <button
                        onClick={() => setCategory(c.name)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-colors text-left capitalize",
                          category === c.name
                            ? "bg-shop-yellow/10 text-shop-yellow"
                            : "text-gray-600 hover:bg-gray-50"
                        )}
                      >
                        <span>{c.name}</span>
                        <span className="text-[10px] text-gray-400">
                          {c.count}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {popular.length > 0 && (
                <div className="bg-white rounded-2xl p-5 border border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-4 h-4 text-shop-yellow" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-shop-black">
                      Popular
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {popular.map((p, i) => (
                      <li key={p.id}>
                        <Link
                          href={`/blog/${p.slug}`}
                          className="group flex gap-3 items-start"
                        >
                          <span className="text-2xl font-black text-gray-200 group-hover:text-shop-yellow transition-colors leading-none">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-black text-shop-black group-hover:text-shop-yellow transition-colors line-clamp-2 leading-snug">
                              {p.title}
                            </p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                              {p.view_count} views
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggested topic tags — always visible for variety */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-4 h-4 text-shop-yellow" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-shop-black">
                    Tags
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_TOPICS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setQuery((q) => (q === t ? "" : t))}
                      className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-colors",
                        query === t
                          ? "bg-shop-yellow text-white"
                          : "text-gray-500 bg-gray-50 hover:bg-shop-yellow hover:text-white"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* ── Middle — Blog grid ── */}
          <main className="col-span-12 lg:col-span-6 order-1 lg:order-2 min-w-0">
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="w-6 h-6 animate-spin text-shop-yellow" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-gray-400 font-medium bg-white rounded-3xl border border-gray-100">
                {blogs.length === 0
                  ? "No blog posts yet. Check back soon!"
                  : "No posts match your filters."}
              </div>
            ) : (
              <>
                {/* Featured hero card — only on default view */}
                {featured && category === "all" && !query && (
                  <Link
                    href={`/blog/${featured.slug}`}
                    className="group block bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all mb-6"
                  >
                    <div className="aspect-[16/9] bg-gray-50 overflow-hidden relative">
                      {featured.featured_image_url && (
                        <img
                          src={featured.featured_image_url}
                          alt={featured.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <span className="absolute top-4 left-4 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-shop-black bg-shop-yellow px-3 py-1.5 rounded-full">
                        <Sparkles className="w-3 h-3" />
                        Featured
                      </span>
                    </div>
                    <div className="p-6">
                      {featured.category && (
                        <span className="inline-block text-[10px] font-black uppercase tracking-widest text-shop-yellow bg-shop-yellow/10 px-3 py-1 rounded-full mb-3">
                          {featured.category}
                        </span>
                      )}
                      <h2 className="text-2xl font-black uppercase tracking-tighter text-shop-black leading-tight group-hover:text-shop-yellow transition-colors">
                        {featured.title}
                      </h2>
                      {featured.excerpt && (
                        <p className="text-gray-500 mt-3 leading-relaxed text-sm">
                          {featured.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-4 text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                        {featured.author_name && (
                          <span>{featured.author_name}</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {featured.reading_time_minutes} min
                        </span>
                      </div>
                    </div>
                  </Link>
                )}

                {/* 2-col card grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {rest.map((b) => (
                    <BlogCard key={b.id} blog={b} />
                  ))}
                </div>
              </>
            )}
          </main>

          {/* ── Right sidebar — Newsletter + Social + Promo ── */}
          <aside className="col-span-12 lg:col-span-3 order-3">
            <div className="lg:sticky lg:top-24 space-y-5">
              <div className="bg-gradient-to-br from-shop-yellow to-amber-400 rounded-2xl p-6 text-shop-black">
                <Mail className="w-6 h-6 mb-3" />
                <h3 className="text-lg font-black uppercase tracking-tight leading-tight">
                  Join Our Newsletter
                </h3>
                <p className="text-xs mt-2 text-shop-black/80 leading-relaxed">
                  Weekly sticker inspiration + subscriber-only discounts.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert(
                      "Newsletter signup coming soon — integrate with Resend/ConvertKit."
                    );
                  }}
                  className="mt-4 space-y-2"
                >
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full px-4 py-2.5 bg-white rounded-xl text-xs text-shop-black placeholder-gray-400 outline-none focus:ring-2 focus:ring-shop-black/20"
                  />
                  <button
                    type="submit"
                    className="w-full bg-shop-black text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-colors"
                  >
                    Subscribe
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <h3 className="text-xs font-black uppercase tracking-widest text-shop-black mb-4">
                  Follow Us
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  <SocialIcon icon={Instagram} label="Instagram" color="hover:bg-pink-500" />
                  <SocialIcon icon={Twitter} label="Twitter" color="hover:bg-sky-500" />
                  <SocialIcon icon={Youtube} label="YouTube" color="hover:bg-red-500" />
                  <SocialIcon icon={Facebook} label="Facebook" color="hover:bg-blue-600" />
                </div>
              </div>

              <div className="bg-shop-black rounded-2xl p-6 text-white relative overflow-hidden">
                <Megaphone className="w-6 h-6 text-shop-yellow mb-3" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-shop-yellow mb-2">
                  Featured Drop
                </p>
                <h3 className="text-lg font-black uppercase tracking-tight leading-tight">
                  20% Off Holographic Stickers
                </h3>
                <p className="text-xs mt-2 text-white/70">
                  Limited edition this month. Code HOLO20 at checkout.
                </p>
                <Link
                  href="/search"
                  className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-shop-yellow hover:gap-3 transition-all relative z-10"
                >
                  Shop Now <ArrowRight className="w-3 h-3" />
                </Link>
                <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-shop-yellow/10" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function BlogCard({ blog }: { blog: BlogListItem }) {
  return (
    <Link
      href={`/blog/${blog.slug}`}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all flex flex-col"
    >
      <div className="aspect-video bg-gray-50 overflow-hidden">
        {blog.featured_image_url && (
          <img
            src={blog.featured_image_url}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        {blog.category && (
          <span className="inline-block self-start text-[9px] font-black uppercase tracking-widest text-shop-yellow bg-shop-yellow/10 px-2 py-0.5 rounded mb-3">
            {blog.category}
          </span>
        )}
        <h3 className="text-base font-black uppercase tracking-tight text-shop-black leading-snug group-hover:text-shop-yellow transition-colors line-clamp-2">
          {blog.title}
        </h3>
        {blog.excerpt && (
          <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">
            {blog.excerpt}
          </p>
        )}
        <div className="mt-auto pt-4 flex items-center gap-3 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          {blog.published_at && (
            <span>
              {new Date(blog.published_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {blog.reading_time_minutes} min
          </span>
          <span className="flex items-center gap-1 ml-auto">
            <Eye className="w-3 h-3" />
            {blog.view_count}
          </span>
        </div>
      </div>
    </Link>
  );
}

function SocialIcon({
  icon: Icon,
  label,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
}) {
  return (
    <a
      href="#"
      aria-label={label}
      className={cn(
        "aspect-square rounded-xl bg-gray-50 text-gray-500 flex items-center justify-center hover:text-white transition-colors",
        color
      )}
    >
      <Icon className="w-4 h-4" />
    </a>
  );
}
