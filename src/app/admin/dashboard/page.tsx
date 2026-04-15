"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  Users,
  MessageSquare,
  HelpCircle,
  TrendingUp,
  ArrowRight,
  Loader2,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Stats {
  stickers: number;
  users: number;
  reviews: number;
  faqs: number;
  blogs: number;
}

interface RecentSticker {
  id: number;
  Title: string;
  price: number;
  category: string;
  image: string;
  createdAt: string;
}

const STAT_CARDS: {
  key: keyof Stats;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  href?: string;
}[] = [
  {
    key: "stickers",
    label: "Total Stickers",
    icon: Package,
    accent: "bg-shop-yellow/10 text-shop-yellow",
    href: "/admin/stickers",
  },
  {
    key: "users",
    label: "Customers",
    icon: Users,
    accent: "bg-blue-500/10 text-blue-400",
  },
  {
    key: "reviews",
    label: "Reviews",
    icon: MessageSquare,
    accent: "bg-purple-500/10 text-purple-400",
  },
  {
    key: "faqs",
    label: "FAQs",
    icon: HelpCircle,
    accent: "bg-green-500/10 text-green-400",
  },
  {
    key: "blogs",
    label: "Blog Posts",
    icon: FileText,
    accent: "bg-orange-500/10 text-orange-400",
    href: "/admin/blogs",
  },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentStickers, setRecentStickers] = useState<RecentSticker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((res) => {
        if (!mounted || !res.success) return;
        setStats(res.stats);
        setRecentStickers(res.recentStickers);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white">
          Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Overview of your StickerFlix store
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          const value = stats?.[card.key];
          const content = (
            <div className="bg-[#161A21] border border-white/5 rounded-2xl p-5 md:p-6 hover:border-white/10 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    card.accent
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                {card.href && (
                  <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-shop-yellow transition-colors" />
                )}
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">
                {card.label}
              </p>
              <p className="text-3xl font-black text-white">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                ) : (
                  (value ?? 0).toLocaleString()
                )}
              </p>
            </div>
          );
          return card.href ? (
            <Link key={card.key} href={card.href} className="group">
              {content}
            </Link>
          ) : (
            <div key={card.key}>{content}</div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="bg-[#161A21] border border-white/5 rounded-2xl p-6 md:p-8">
        <h2 className="text-lg font-black uppercase tracking-tighter text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <Link
            href="/admin/stickers/new"
            className="flex items-center gap-3 p-4 bg-shop-yellow text-shop-black rounded-xl font-black uppercase tracking-widest text-xs hover:bg-white transition-colors"
          >
            <Package className="w-4 h-4" />
            Add New Sticker
            <ArrowRight className="w-4 h-4 ml-auto" />
          </Link>
          <Link
            href="/admin/stickers"
            className="flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-xl font-black uppercase tracking-widest text-xs text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Package className="w-4 h-4" />
            Manage All Stickers
            <ArrowRight className="w-4 h-4 ml-auto" />
          </Link>
        </div>
      </div>

      {/* Recent stickers */}
      <div className="bg-[#161A21] border border-white/5 rounded-2xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-shop-yellow" />
            <h2 className="text-lg font-black uppercase tracking-tighter text-white">
              Recent Stickers
            </h2>
          </div>
          <Link
            href="/admin/stickers"
            className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-shop-yellow transition-colors"
          >
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
          </div>
        ) : recentStickers.length === 0 ? (
          <p className="text-center py-12 text-sm text-gray-500">
            No stickers yet. Add your first one to get started.
          </p>
        ) : (
          <div className="divide-y divide-white/5">
            {recentStickers.map((s) => (
              <Link
                key={s.id}
                href={`/admin/stickers/${s.id}/edit`}
                className="flex items-center gap-4 py-3 hover:bg-white/[0.02] -mx-2 px-2 rounded-lg transition-colors group"
              >
                <div className="w-12 h-12 rounded-lg bg-white/5 overflow-hidden p-1 shrink-0">
                  <img
                    src={s.image}
                    alt={s.Title}
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate group-hover:text-shop-yellow transition-colors">
                    {s.Title}
                  </p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-0.5">
                    {s.category}
                  </p>
                </div>
                <p className="text-sm font-black text-white shrink-0">
                  ${s.price}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
