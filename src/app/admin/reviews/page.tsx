"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  MessageSquare,
  Loader2,
  Star,
  Trash2,
  BadgeCheck,
  Filter,
} from "lucide-react";
import { Review } from "@/data";
import { cn } from "@/lib/utils";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (ratingFilter !== "all") params.set("rating", ratingFilter);
    const res = await fetch(`/api/admin/reviews?${params}`);
    const body = await res.json();
    if (body.success) setReviews(body.data);
    setLoading(false);
  };

  useEffect(() => {
    const t = setTimeout(fetchReviews, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, ratingFilter]);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this review? This cannot be undone.")) return;
    setDeleting(id);
    const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    if (res.ok) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
    }
    setDeleting(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white">
          Reviews
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Moderate customer reviews — {loading ? "…" : `${reviews.length} total`}
        </p>
      </div>

      <div className="bg-[#161A21] border border-white/5 rounded-2xl p-4 flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, text, or author…"
            className="w-full pl-11 pr-4 py-2.5 bg-[#0F1115] rounded-xl border-2 border-white/5 text-sm text-white placeholder-gray-600 outline-none focus:border-shop-yellow/50 transition-colors"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="pl-11 pr-8 py-2.5 bg-[#0F1115] rounded-xl border-2 border-white/5 text-sm text-white outline-none focus:border-shop-yellow/50 appearance-none cursor-pointer"
          >
            <option value="all">All ratings</option>
            <option value="5">5 stars</option>
            <option value="4">4 stars</option>
            <option value="3">3 stars</option>
            <option value="2">2 stars</option>
            <option value="1">1 star</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-[#161A21] border border-white/5 rounded-2xl flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <MessageSquare className="w-7 h-7 text-gray-600" />
            </div>
            <p className="text-sm font-black uppercase tracking-widest text-gray-400">
              No reviews found
            </p>
          </div>
        ) : (
          reviews.map((r) => (
            <div
              key={r.id}
              className="bg-[#161A21] border border-white/5 rounded-2xl p-5"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-shop-yellow/10 text-shop-yellow font-black uppercase text-sm flex items-center justify-center">
                    {r.author_name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-black text-white">
                        {r.author_name}
                      </p>
                      {r.verified_purchase && (
                        <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-green-400 bg-green-500/10 px-2 py-0.5 rounded">
                          <BadgeCheck className="w-3 h-3" /> Verified
                        </span>
                      )}
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 bg-white/5 px-2 py-0.5 rounded">
                        Product #{r.product_id}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex gap-0.5">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <Star
                            key={i}
                            className={cn(
                              "w-3 h-3",
                              i < r.rating
                                ? "fill-shop-yellow text-shop-yellow"
                                : "fill-gray-700 text-gray-700"
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-gray-500">
                        {new Date(r.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(r.id)}
                  disabled={deleting === r.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-[10px] font-black uppercase tracking-widest transition-colors disabled:opacity-50"
                >
                  {deleting === r.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Trash2 className="w-3 h-3" />
                  )}
                  Delete
                </button>
              </div>

              {r.title && (
                <h3 className="text-sm font-black text-white mt-4">{r.title}</h3>
              )}
              <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                {r.text}
              </p>

              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5 text-[10px] text-gray-500">
                <span>👍 {r.helpful_count} helpful</span>
                <span>👎 {r.unhelpful_count} unhelpful</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
