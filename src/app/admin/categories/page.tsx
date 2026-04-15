"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FolderTree,
  Loader2,
  ChevronDown,
  Package,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  AlertTriangle,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { invalidateCategoriesCache } from "@/hooks/useCategories";

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface FormState {
  id?: string;
  name: string;
  parent_id: string | null;
  sort_order: number;
}

const EMPTY: FormState = { name: "", parent_id: null, sort_order: 0 };

export default function AdminCategoriesPage() {
  const [ready, setReady] = useState<boolean | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stickerCounts, setStickerCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [openParent, setOpenParent] = useState<string | null>(null);

  const [editing, setEditing] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/categories");
    const body = await res.json();
    if (!body.ready) {
      setReady(false);
      setLoading(false);
      return;
    }
    setReady(true);
    setCategories(body.categories ?? []);
    setStickerCounts(body.stickerCounts ?? {});
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Split into top-level + children lookup
  const { topLevel, childrenOf } = useMemo(() => {
    const top: Category[] = [];
    const kids: Record<string, Category[]> = {};
    for (const c of categories) {
      if (c.parent_id === null) top.push(c);
      else {
        if (!kids[c.parent_id]) kids[c.parent_id] = [];
        kids[c.parent_id].push(c);
      }
    }
    top.sort((a, b) => a.sort_order - b.sort_order);
    for (const k of Object.values(kids))
      k.sort((a, b) => a.sort_order - b.sort_order);
    return { topLevel: top, childrenOf: kids };
  }, [categories]);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    setError(null);
    const isNew = !editing.id;
    const url = isNew
      ? "/api/admin/categories"
      : `/api/admin/categories/${editing.id}`;
    const res = await fetch(url, {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editing.name,
        parent_id: editing.parent_id,
        sort_order: editing.sort_order,
      }),
    });
    const body = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(body.error ?? "Failed to save");
      return;
    }
    setEditing(null);
    fetchData();
    invalidateCategoriesCache();
  };

  const handleDelete = async (c: Category) => {
    const hasChildren = (childrenOf[c.id]?.length ?? 0) > 0;
    const confirmMsg = hasChildren
      ? `Delete "${c.name}" AND all its subcategories? This cannot be undone.`
      : `Delete "${c.name}"? This cannot be undone.`;
    if (!confirm(confirmMsg)) return;
    setDeleting(c.id);
    const res = await fetch(`/api/admin/categories/${c.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      fetchData();
      invalidateCategoriesCache();
    }
    setDeleting(null);
  };

  // ─── Migration-needed screen ─────────────────────────────────────
  if (ready === false) {
    const migrationPath = "supabase/migrations/0003_categories.sql";
    return (
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white">
            Categories
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
                The <code className="text-shop-yellow">categories</code> table doesn&apos;t exist yet.
                Run the migration SQL in Supabase to enable category management.
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
                        navigator.clipboard.writeText(migrationPath);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1500);
                      }}
                      className="flex items-center gap-2 mt-2 px-3 py-2 bg-[#0F1115] rounded-lg border border-white/5 text-xs font-mono text-shop-yellow hover:border-shop-yellow/30 transition-colors"
                    >
                      {migrationPath}
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
                    Copy contents and paste into{" "}
                    <a
                      href="https://supabase.com/dashboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-shop-yellow hover:underline"
                    >
                      Supabase Dashboard
                    </a>{" "}
                    → <strong>SQL Editor</strong> → <strong>Run</strong>.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-shop-yellow/10 text-shop-yellow flex items-center justify-center text-xs font-black shrink-0">
                    3
                  </span>
                  <div>
                    The migration seeds your existing 7 categories + all subcategories. Refresh
                    this page when done.
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Loading ─────────────────────────────────────
  if (loading || ready === null) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
      </div>
    );
  }

  // ─── Main CRUD UI ─────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white">
            Categories
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {topLevel.length} top-level · {categories.length} total
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
          New Category
        </button>
      </div>

      <div className="space-y-3">
        {topLevel.map((cat) => {
          const isOpen = openParent === cat.id;
          const kids = childrenOf[cat.id] ?? [];
          const totalCount =
            (stickerCounts[cat.name] ?? 0) +
            kids.reduce((s, k) => s + (stickerCounts[k.name] ?? 0), 0);
          return (
            <div
              key={cat.id}
              className="bg-[#161A21] border border-white/5 rounded-2xl overflow-hidden"
            >
              <div
                className="flex items-center gap-3 px-5 py-4 hover:bg-white/[0.02] cursor-pointer transition-colors"
                onClick={() => setOpenParent(isOpen ? null : cat.id)}
              >
                <FolderTree className="w-5 h-5 text-shop-yellow shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-white truncate">
                    {cat.name}
                  </p>
                  <p className="text-[10px] text-gray-500 font-medium">
                    {kids.length} subcategories · {totalCount} stickers · /{cat.slug}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditing({
                      id: cat.id,
                      name: cat.name,
                      parent_id: cat.parent_id,
                      sort_order: cat.sort_order,
                    });
                    setError(null);
                  }}
                  className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-shop-yellow hover:text-shop-black transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(cat);
                  }}
                  disabled={deleting === cat.id}
                  className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors disabled:opacity-50"
                >
                  {deleting === cat.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
                <Link
                  href={`/admin/stickers?category=${encodeURIComponent(cat.name)}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-[10px] font-black uppercase tracking-widest text-shop-yellow hover:underline px-2"
                >
                  View
                </Link>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-gray-500 transition-transform",
                    isOpen && "rotate-180"
                  )}
                />
              </div>

              {isOpen && (
                <div className="px-5 pb-4 pt-1 space-y-2 border-t border-white/5 bg-[#0F1115]/50">
                  <div className="flex items-center justify-between py-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                      Subcategories
                    </p>
                    <button
                      onClick={() => {
                        setEditing({
                          name: "",
                          parent_id: cat.id,
                          sort_order: kids.length + 1,
                        });
                        setError(null);
                      }}
                      className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-shop-yellow hover:underline"
                    >
                      <Plus className="w-3 h-3" />
                      Add
                    </button>
                  </div>
                  {kids.length === 0 ? (
                    <p className="text-xs text-gray-500 italic py-2">
                      No subcategories. Add one to get started.
                    </p>
                  ) : (
                    kids.map((k) => (
                      <div
                        key={k.id}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.02] hover:bg-white/5 transition-colors"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-shop-yellow/50 shrink-0" />
                        <p className="text-xs font-bold text-gray-300 flex-1 min-w-0 truncate">
                          {k.name}
                        </p>
                        <span className="flex items-center gap-1 text-[10px] text-gray-500 shrink-0">
                          <Package className="w-3 h-3" />
                          {stickerCounts[k.name] ?? 0}
                        </span>
                        <button
                          onClick={() => {
                            setEditing({
                              id: k.id,
                              name: k.name,
                              parent_id: k.parent_id,
                              sort_order: k.sort_order,
                            });
                            setError(null);
                          }}
                          className="p-1.5 rounded bg-white/5 text-gray-400 hover:bg-shop-yellow hover:text-shop-black transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(k)}
                          disabled={deleting === k.id}
                          className="p-1.5 rounded bg-white/5 text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors disabled:opacity-50"
                        >
                          {deleting === k.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Edit modal ─────────────────────────────────── */}
      {editing && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setEditing(null)}
        >
          <div
            className="bg-[#161A21] border border-white/10 rounded-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-black uppercase tracking-tighter text-white">
                {editing.id
                  ? "Edit Category"
                  : editing.parent_id
                  ? "New Subcategory"
                  : "New Category"}
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
              <Field label="Name">
                <input
                  type="text"
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                  autoFocus
                  className={inputCls}
                />
              </Field>
              <Field label="Parent (optional)">
                <select
                  value={editing.parent_id ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, parent_id: e.target.value || null })
                  }
                  className={inputCls}
                >
                  <option value="">— Top-level category —</option>
                  {topLevel
                    .filter((c) => c.id !== editing.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </Field>
              <Field label="Sort Order">
                <input
                  type="number"
                  value={editing.sort_order}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      sort_order: parseInt(e.target.value) || 0,
                    })
                  }
                  className={inputCls}
                />
              </Field>
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
                disabled={saving || !editing.name.trim()}
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

function Field({
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
