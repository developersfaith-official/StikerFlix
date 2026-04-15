"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  HelpCircle,
  Loader2,
  Trash2,
  Plus,
  Pencil,
  X,
  Save,
} from "lucide-react";
import { FAQ } from "@/data";
import { cn } from "@/lib/utils";

const EMPTY: Partial<FAQ> = {
  product_id: 1,
  question: "",
  answer: "",
  category: "general",
};

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Partial<FAQ> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchFaqs = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    const res = await fetch(`/api/admin/faqs?${params}`);
    const body = await res.json();
    if (body.success) setFaqs(body.data);
    setLoading(false);
  };

  useEffect(() => {
    const t = setTimeout(fetchFaqs, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    setError(null);

    const isNew = !editing.id;
    const url = isNew
      ? "/api/admin/faqs"
      : `/api/admin/faqs/${editing.id}`;
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
    fetchFaqs();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this FAQ?")) return;
    setDeleting(id);
    const res = await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
    if (res.ok) setFaqs((prev) => prev.filter((f) => f.id !== id));
    setDeleting(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white">
            FAQs
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {loading ? "…" : `${faqs.length} FAQ${faqs.length === 1 ? "" : "s"}`}
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
          New FAQ
        </button>
      </div>

      <div className="bg-[#161A21] border border-white/5 rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search question or answer…"
            className="w-full pl-11 pr-4 py-2.5 bg-[#0F1115] rounded-xl border-2 border-white/5 text-sm text-white placeholder-gray-600 outline-none focus:border-shop-yellow/50 transition-colors"
          />
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
          </div>
        ) : faqs.length === 0 ? (
          <div className="bg-[#161A21] border border-white/5 rounded-2xl flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <HelpCircle className="w-7 h-7 text-gray-600" />
            </div>
            <p className="text-sm font-black uppercase tracking-widest text-gray-400">
              No FAQs yet
            </p>
          </div>
        ) : (
          faqs.map((f) => (
            <div
              key={f.id}
              className="bg-[#161A21] border border-white/5 rounded-2xl p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-[9px] font-black uppercase tracking-widest text-shop-yellow bg-shop-yellow/10 px-2 py-0.5 rounded">
                      {f.category}
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 bg-white/5 px-2 py-0.5 rounded">
                      Product #{f.product_id}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-white mb-2">{f.question}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{f.answer}</p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setEditing(f);
                      setError(null);
                    }}
                    className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-shop-yellow hover:text-shop-black transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(f.id)}
                    disabled={deleting === f.id}
                    className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors disabled:opacity-50"
                  >
                    {deleting === f.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5 text-[10px] text-gray-500">
                <span>👍 {f.helpful_count} helpful</span>
                <span>👁️ {f.views_count} views</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Edit modal ─────────────────────────────────────────── */}
      {editing && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setEditing(null)}
        >
          <div
            className="bg-[#161A21] border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-black uppercase tracking-tighter text-white">
                {editing.id ? "Edit FAQ" : "New FAQ"}
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
              <AdminField label="Product ID">
                <input
                  type="number"
                  value={editing.product_id ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, product_id: parseInt(e.target.value) || 0 })
                  }
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
                  placeholder="general, shipping, product, etc."
                  className={inputCls}
                />
              </AdminField>
              <AdminField label="Question">
                <input
                  type="text"
                  value={editing.question ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, question: e.target.value })
                  }
                  className={inputCls}
                />
              </AdminField>
              <AdminField label="Answer">
                <textarea
                  value={editing.answer ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, answer: e.target.value })
                  }
                  rows={5}
                  className={cn(inputCls, "resize-none")}
                />
              </AdminField>
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

// ── shared helpers ──
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
