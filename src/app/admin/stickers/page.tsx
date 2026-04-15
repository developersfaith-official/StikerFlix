"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Package,
  Loader2,
  Flame,
  Sparkles,
  Pencil,
  Filter,
} from "lucide-react";
import { Sticker } from "@/data";
import { cn } from "@/lib/utils";
import { useCategories } from "@/hooks/useCategories";

export default function AdminStickersPage() {
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const { allNames: categoryList } = useCategories();

  const fetchStickers = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (category !== "all") params.set("category", category);
    const res = await fetch(`/api/admin/stickers?${params}`);
    const body = await res.json();
    if (body.success) setStickers(body.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStickers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced re-fetch on filter change
  useEffect(() => {
    const t = setTimeout(fetchStickers, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, category]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white">
            Stickers
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Manage your entire sticker catalog
          </p>
        </div>
        <Link
          href="/admin/stickers/new"
          className="flex items-center gap-2 bg-shop-yellow text-shop-black px-5 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-white transition-colors shadow-lg shadow-shop-yellow/20"
        >
          <Plus className="w-4 h-4" />
          New Sticker
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
            placeholder="Search by title…"
            className="w-full pl-11 pr-4 py-2.5 bg-[#0F1115] rounded-xl border-2 border-white/5 text-sm text-white placeholder-gray-600 outline-none focus:border-shop-yellow/50 transition-colors"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="pl-11 pr-8 py-2.5 bg-[#0F1115] rounded-xl border-2 border-white/5 text-sm text-white outline-none focus:border-shop-yellow/50 transition-colors appearance-none cursor-pointer"
          >
            <option value="all">All categories</option>
            {categoryList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">
          {loading ? "…" : `${stickers.length} result${stickers.length === 1 ? "" : "s"}`}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#161A21] border border-white/5 rounded-2xl overflow-hidden">
        {/* Header row */}
        <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-gray-500">
          <div className="col-span-5">Sticker</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-2">Price</div>
          <div className="col-span-2">Flags</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
          </div>
        ) : stickers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Package className="w-7 h-7 text-gray-600" />
            </div>
            <p className="text-sm font-black uppercase tracking-widest text-gray-400">
              No stickers found
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {query || category !== "all"
                ? "Try adjusting your filters"
                : "Start by creating your first sticker"}
            </p>
            {!query && category === "all" && (
              <Link
                href="/admin/stickers/new"
                className="mt-6 flex items-center gap-2 bg-shop-yellow text-shop-black px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-white transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add First Sticker
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {stickers.map((s) => (
              <Link
                key={s.id}
                href={`/admin/stickers/${s.id}/edit`}
                className="grid grid-cols-12 gap-3 px-5 py-4 items-center hover:bg-white/[0.02] transition-colors group"
              >
                {/* Image + title */}
                <div className="col-span-12 md:col-span-5 flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-lg bg-white/5 overflow-hidden p-1 shrink-0">
                    <img
                      src={s.image}
                      alt={s.Title}
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate group-hover:text-shop-yellow transition-colors">
                      {s.Title}
                    </p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-0.5">
                      ID {s.id}
                    </p>
                  </div>
                </div>

                <div className="col-span-4 md:col-span-2 text-xs text-gray-400 font-medium truncate">
                  {s.category}
                </div>

                <div className="col-span-4 md:col-span-2 text-sm font-black text-white">
                  ${s.price}
                </div>

                <div className="col-span-4 md:col-span-2 flex gap-1.5 flex-wrap">
                  {s.isNew && (
                    <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                      <Sparkles className="w-3 h-3" />
                      New
                    </span>
                  )}
                  {s.isTreanding && (
                    <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">
                      <Flame className="w-3 h-3" />
                      Trending
                    </span>
                  )}
                </div>

                <div className="col-span-12 md:col-span-1 flex justify-end">
                  <div
                    className={cn(
                      "p-2 rounded-lg text-gray-500 group-hover:bg-shop-yellow group-hover:text-shop-black transition-all"
                    )}
                  >
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
