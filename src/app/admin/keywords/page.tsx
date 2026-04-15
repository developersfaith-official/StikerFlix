"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  BarChart3,
  Loader2,
  Trash2,
  Plus,
  Pencil,
  X,
  Save,
  TrendingUp,
  Target,
  Lightbulb,
  Flame,
  ArrowUp,
} from "lucide-react";
import { SEOKeywords } from "@/data";
import { cn } from "@/lib/utils";

const EMPTY: Partial<SEOKeywords> = {
  keyword: "",
  search_volume: 0,
  difficulty: 50,
  category: "general",
};

const difficultyColor = (d: number) =>
  d <= 30
    ? "text-green-400 bg-green-500/10"
    : d <= 60
    ? "text-yellow-400 bg-yellow-500/10"
    : "text-red-400 bg-red-500/10";

const difficultyLabel = (d: number) =>
  d <= 30 ? "Easy" : d <= 60 ? "Medium" : "Hard";

export default function AdminKeywordsPage() {
  const [keywords, setKeywords] = useState<SEOKeywords[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Partial<SEOKeywords> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchKeywords = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    const res = await fetch(`/api/admin/keywords?${params}`);
    const body = await res.json();
    if (body.success) setKeywords(body.data);
    setLoading(false);
  };

  useEffect(() => {
    const t = setTimeout(fetchKeywords, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    setError(null);
    const isNew = !editing.id;
    const url = isNew ? "/api/admin/keywords" : `/api/admin/keywords/${editing.id}`;
    const method = isNew ? "POST" : "PUT";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    const body = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(body.error ?? "Failed to save");
      return;
    }
    setEditing(null);
    fetchKeywords();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this keyword?")) return;
    setDeleting(id);
    const res = await fetch(`/api/admin/keywords/${id}`, { method: "DELETE" });
    if (res.ok) setKeywords((prev) => prev.filter((k) => k.id !== id));
    setDeleting(null);
  };

  // ── Analytics (derived from keywords list) ──────────────────────
  const analytics = useMemo(() => {
    if (keywords.length === 0) {
      return {
        total: 0,
        totalVolume: 0,
        avgDifficulty: 0,
        topByVolume: [] as SEOKeywords[],
        easyWins: [] as SEOKeywords[],
        byCategory: [] as { category: string; count: number; volume: number }[],
      };
    }

    const totalVolume = keywords.reduce((s, k) => s + k.search_volume, 0);
    const avgDifficulty = Math.round(
      keywords.reduce((s, k) => s + k.difficulty, 0) / keywords.length
    );

    // Top 5 by search volume
    const topByVolume = [...keywords]
      .sort((a, b) => b.search_volume - a.search_volume)
      .slice(0, 5);

    // "Easy wins" — low difficulty + decent volume
    const easyWins = [...keywords]
      .filter((k) => k.difficulty <= 35 && k.search_volume > 0)
      .sort((a, b) => b.search_volume - a.search_volume)
      .slice(0, 5);

    // Category breakdown
    const catMap: Record<string, { count: number; volume: number }> = {};
    keywords.forEach((k) => {
      if (!catMap[k.category]) catMap[k.category] = { count: 0, volume: 0 };
      catMap[k.category].count++;
      catMap[k.category].volume += k.search_volume;
    });
    const byCategory = Object.entries(catMap)
      .map(([category, v]) => ({ category, ...v }))
      .sort((a, b) => b.volume - a.volume);

    return { total: keywords.length, totalVolume, avgDifficulty, topByVolume, easyWins, byCategory };
  }, [keywords]);

  const maxVolume = analytics.topByVolume[0]?.search_volume ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white">
            SEO Keywords
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {loading ? "…" : `${keywords.length} keyword${keywords.length === 1 ? "" : "s"} · Track, analyze, and optimize`}
          </p>
        </div>
        <button
          onClick={() => {
            setEditing({ ...EMPTY });
            setError(null);
          }}
          className="flex items-center gap-2 bg-shop-yellow text-shop-black px-5 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-white transition-colors shadow-lg shadow-shop-yellow/20"
        >
          <Plus className="w-4 h-4" />
          New Keyword
        </button>
      </div>

      {/* ── Analytics stat cards ─────────────────────────────────── */}
      {keywords.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Keywords"
            value={analytics.total.toString()}
            icon={BarChart3}
            accent="bg-shop-yellow/10 text-shop-yellow"
          />
          <StatCard
            label="Total Search Volume"
            value={analytics.totalVolume.toLocaleString()}
            icon={TrendingUp}
            accent="bg-blue-500/10 text-blue-400"
          />
          <StatCard
            label="Avg Difficulty"
            value={`${analytics.avgDifficulty}/100`}
            icon={Target}
            accent={
              analytics.avgDifficulty <= 30
                ? "bg-green-500/10 text-green-400"
                : analytics.avgDifficulty <= 60
                ? "bg-yellow-500/10 text-yellow-400"
                : "bg-red-500/10 text-red-400"
            }
          />
          <StatCard
            label="Easy Wins"
            value={analytics.easyWins.length.toString()}
            sub="Low-diff opportunities"
            icon={Lightbulb}
            accent="bg-purple-500/10 text-purple-400"
          />
        </div>
      )}

      {/* ── Leaderboards ─────────────────────────────────────────── */}
      {keywords.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Top by volume */}
          <div className="bg-[#161A21] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-5 h-5 text-shop-yellow" />
              <h3 className="text-sm font-black uppercase tracking-tighter text-white">
                Highest Ranking
              </h3>
            </div>
            {analytics.topByVolume.length === 0 ? (
              <p className="text-xs text-gray-500 py-4">No data yet.</p>
            ) : (
              <div className="space-y-2">
                {analytics.topByVolume.map((k, i) => (
                  <div key={k.id} className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-gray-500 w-5 text-right shrink-0">
                      #{i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        {k.keyword}
                      </p>
                      <div className="h-1.5 mt-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-shop-yellow rounded-full transition-all"
                          style={{
                            width: `${(k.search_volume / maxVolume) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-black text-gray-400 shrink-0">
                      {k.search_volume.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Easy wins / suggestions */}
          <div className="bg-[#161A21] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-shop-yellow" />
              <h3 className="text-sm font-black uppercase tracking-tighter text-white">
                Suggested Targets
              </h3>
              <span className="ml-auto text-[9px] font-black uppercase tracking-widest text-gray-500 bg-white/5 px-2 py-0.5 rounded">
                Low difficulty
              </span>
            </div>
            {analytics.easyWins.length === 0 ? (
              <p className="text-xs text-gray-500 py-4">
                No low-difficulty keywords yet. Add keywords with difficulty ≤ 35 to find opportunities.
              </p>
            ) : (
              <div className="space-y-2">
                {analytics.easyWins.map((k) => (
                  <div
                    key={k.id}
                    className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/[0.02] transition-colors"
                  >
                    <ArrowUp className="w-3.5 h-3.5 text-green-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        {k.keyword}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {k.search_volume.toLocaleString()} searches · diff {k.difficulty}
                      </p>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-green-400 bg-green-500/10 px-2 py-0.5 rounded shrink-0">
                      Easy
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Category breakdown */}
      {analytics.byCategory.length > 1 && (
        <div className="bg-[#161A21] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-shop-yellow" />
            <h3 className="text-sm font-black uppercase tracking-tighter text-white">
              By Category
            </h3>
          </div>
          <div className="flex gap-2 flex-wrap">
            {analytics.byCategory.map((c) => (
              <div
                key={c.category}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.02] rounded-lg border border-white/5"
              >
                <span className="text-xs font-bold text-gray-300">{c.category}</span>
                <span className="text-[10px] text-gray-500">
                  {c.count} · {c.volume.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-[#161A21] border border-white/5 rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search keywords…"
            className="w-full pl-11 pr-4 py-2.5 bg-[#0F1115] rounded-xl border-2 border-white/5 text-sm text-white placeholder-gray-600 outline-none focus:border-shop-yellow/50 transition-colors"
          />
        </div>
      </div>

      <div className="bg-[#161A21] border border-white/5 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-gray-500">
          <div className="col-span-5">Keyword</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-2">Volume</div>
          <div className="col-span-2">Difficulty</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
          </div>
        ) : keywords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <BarChart3 className="w-7 h-7 text-gray-600" />
            </div>
            <p className="text-sm font-black uppercase tracking-widest text-gray-400">
              No keywords yet
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {keywords.map((k) => (
              <div
                key={k.id}
                className="grid grid-cols-12 gap-3 px-5 py-4 items-center hover:bg-white/[0.02] transition-colors"
              >
                <div className="col-span-12 md:col-span-5 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{k.keyword}</p>
                </div>
                <div className="col-span-4 md:col-span-2 text-xs text-gray-400 truncate">
                  {k.category}
                </div>
                <div className="col-span-4 md:col-span-2 text-sm font-black text-white">
                  {k.search_volume.toLocaleString()}
                </div>
                <div className="col-span-4 md:col-span-2">
                  <span
                    className={cn(
                      "text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded",
                      difficultyColor(k.difficulty)
                    )}
                  >
                    {difficultyLabel(k.difficulty)} ({k.difficulty})
                  </span>
                </div>
                <div className="col-span-12 md:col-span-1 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setEditing(k);
                      setError(null);
                    }}
                    className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-shop-yellow hover:text-shop-black transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(k.id)}
                    disabled={deleting === k.id}
                    className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors disabled:opacity-50"
                  >
                    {deleting === k.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Edit modal ─────────────────────────────────── */}
      {editing && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setEditing(null)}
        >
          <div
            className="bg-[#161A21] border border-white/10 rounded-2xl p-6 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-black uppercase tracking-tighter text-white">
                {editing.id ? "Edit Keyword" : "New Keyword"}
              </h2>
              <button
                onClick={() => setEditing(null)}
                className="text-gray-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <AdminField label="Keyword">
                <input
                  type="text"
                  value={editing.keyword ?? ""}
                  onChange={(e) => setEditing({ ...editing, keyword: e.target.value })}
                  className={inputCls}
                />
              </AdminField>
              <AdminField label="Category">
                <input
                  type="text"
                  value={editing.category ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, category: e.target.value })
                  }
                  className={inputCls}
                />
              </AdminField>
              <div className="grid grid-cols-2 gap-4">
                <AdminField label="Search Volume">
                  <input
                    type="number"
                    min={0}
                    value={editing.search_volume ?? 0}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        search_volume: parseInt(e.target.value) || 0,
                      })
                    }
                    className={inputCls}
                  />
                </AdminField>
                <AdminField label="Difficulty (0–100)">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editing.difficulty ?? 50}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        difficulty: parseInt(e.target.value) || 0,
                      })
                    }
                    className={inputCls}
                  />
                </AdminField>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditing(null)}
                className="flex-1 py-3 rounded-xl bg-white/5 text-gray-300 font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-shop-yellow text-shop-black font-black uppercase tracking-widest text-xs hover:bg-white transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls =
  "w-full px-4 py-3 bg-[#0F1115] rounded-xl border-2 border-white/5 text-sm text-white placeholder-gray-600 outline-none focus:border-shop-yellow transition-colors";

function AdminField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}) {
  return (
    <div className="bg-[#161A21] border border-white/5 rounded-2xl p-5">
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center mb-3",
          accent
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
        {label}
      </p>
      <p className="text-2xl font-black text-white mt-1">{value}</p>
      {sub && <p className="text-[10px] text-gray-500 font-medium mt-1">{sub}</p>}
    </div>
  );
}
