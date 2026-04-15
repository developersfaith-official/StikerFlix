"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Save,
  Trash2,
  Loader2,
  AlertCircle,
  ArrowLeft,
  ImageIcon,
  CheckCircle2,
} from "lucide-react";
import { Sticker } from "@/data";
import { cn } from "@/lib/utils";
import { useCategories } from "@/hooks/useCategories";

export interface StickerFormValues {
  Title: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isNew: boolean;
  isTreanding: boolean;
}

interface StickerFormProps {
  mode: "create" | "edit";
  initial?: Sticker;
}

const EMPTY: StickerFormValues = {
  Title: "",
  description: "",
  price: 0,
  category: "",
  image: "",
  isNew: false,
  isTreanding: false,
};

export const StickerForm: React.FC<StickerFormProps> = ({ mode, initial }) => {
  const router = useRouter();
  const { categories } = useCategories();
  const [values, setValues] = useState<StickerFormValues>(
    initial
      ? {
          Title: initial.Title ?? "",
          description: initial.description ?? "",
          price: initial.price ?? 0,
          category: initial.category ?? "",
          image: initial.image ?? "",
          isNew: !!initial.isNew,
          isTreanding: !!initial.isTreanding,
        }
      : EMPTY
  );

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const set = <K extends keyof StickerFormValues>(
    k: K,
    v: StickerFormValues[K]
  ) => setValues((prev) => ({ ...prev, [k]: v }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (values.Title.trim().length < 2) errs.Title = "Title is required";
    if (!values.category) errs.category = "Category is required";
    if (!values.image.trim()) errs.image = "Image URL is required";
    if (values.price < 0) errs.price = "Price cannot be negative";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!validate()) return;

    setSaving(true);
    try {
      const url =
        mode === "create"
          ? "/api/admin/stickers"
          : `/api/admin/stickers/${initial?.id}`;
      const method = mode === "create" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const body = await res.json();

      if (!res.ok) {
        setError(body.error ?? "Failed to save");
        return;
      }

      setSuccess(true);
      if (mode === "create") {
        setTimeout(() => router.push("/admin/stickers"), 600);
      } else {
        setTimeout(() => setSuccess(false), 1500);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initial) return;
    if (
      !confirm(
        `Delete "${initial.Title}"? This cannot be undone.`
      )
    )
      return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/stickers/${initial.id}`, {
        method: "DELETE",
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Failed to delete");
        setDeleting(false);
        return;
      }
      router.push("/admin/stickers");
    } catch {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <Link
            href="/admin/stickers"
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-shop-yellow transition-colors mb-3"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to stickers
          </Link>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white">
            {mode === "create" ? "New Sticker" : "Edit Sticker"}
          </h1>
          {mode === "edit" && initial && (
            <p className="text-xs text-gray-500 mt-2">
              ID: {initial.id} · Created{" "}
              {new Date(initial.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>

        {mode === "edit" && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-black uppercase tracking-widest transition-colors disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Delete
          </button>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-start gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            {mode === "create" ? "Sticker created successfully!" : "Changes saved."}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        {/* Left column — fields */}
        <div className="lg:col-span-2 space-y-5">
          <AdminField label="Title" error={errors.Title}>
            <input
              type="text"
              value={values.Title}
              onChange={(e) => set("Title", e.target.value)}
              placeholder="e.g. Vinyl Spider-Man Sticker"
              className={inputCls(!!errors.Title)}
            />
          </AdminField>

          <AdminField label="Description">
            <textarea
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
              rows={5}
              placeholder="Describe the sticker, materials, dimensions, use cases…"
              className={cn(inputCls(false), "resize-none")}
            />
          </AdminField>

          <div className="grid sm:grid-cols-2 gap-5">
            <AdminField label="Price (USD)" error={errors.price}>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  $
                </span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={values.price}
                  onChange={(e) => set("price", parseFloat(e.target.value) || 0)}
                  className={cn(inputCls(!!errors.price), "pl-8")}
                />
              </div>
            </AdminField>

            <AdminField label="Category" error={errors.category}>
              <select
                value={values.category}
                onChange={(e) => set("category", e.target.value)}
                className={inputCls(!!errors.category)}
              >
                <option value="">Select a category…</option>
                {categories.length === 0 ? (
                  <option disabled>
                    No categories yet — add some in /admin/categories
                  </option>
                ) : (
                  categories.map((cat) => (
                    <optgroup key={cat.id} label={cat.name}>
                      <option value={cat.name}>{cat.name} (all)</option>
                      {cat.subcategories.map((sub) => (
                        <option key={sub.id} value={sub.name}>
                          {sub.name}
                        </option>
                      ))}
                    </optgroup>
                  ))
                )}
              </select>
            </AdminField>
          </div>

          <AdminField label="Image URL" error={errors.image}>
            <input
              type="url"
              value={values.image}
              onChange={(e) => set("image", e.target.value)}
              placeholder="https://example.com/sticker.png"
              className={inputCls(!!errors.image)}
            />
          </AdminField>

          <div className="grid grid-cols-2 gap-3">
            <FlagToggle
              label="New Arrival"
              value={values.isNew}
              onChange={(v) => set("isNew", v)}
            />
            <FlagToggle
              label="Trending"
              value={values.isTreanding}
              onChange={(v) => set("isTreanding", v)}
            />
          </div>
        </div>

        {/* Right column — preview + submit */}
        <div className="space-y-5">
          <div className="bg-[#161A21] border border-white/5 rounded-2xl p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">
              Preview
            </p>
            <div className="aspect-square bg-white/[0.03] rounded-xl p-4 flex items-center justify-center">
              {values.image ? (
                <img
                  src={values.image}
                  alt="Preview"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <ImageIcon className="w-10 h-10 text-gray-700" />
              )}
            </div>
            <p className="text-sm font-black text-white mt-3 truncate">
              {values.Title || "Untitled sticker"}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-lg font-black text-shop-yellow">
                ${values.price.toFixed(2)}
              </p>
              {values.category && (
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 bg-white/5 px-2 py-0.5 rounded">
                  {values.category}
                </span>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-shop-yellow text-shop-black py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-white transition-colors shadow-lg shadow-shop-yellow/20 disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {mode === "create" ? "Create Sticker" : "Save Changes"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// ── helpers ────────────────────────────────────────────────────────────

const inputCls = (hasError: boolean) =>
  cn(
    "w-full px-4 py-3 bg-[#0F1115] rounded-xl border-2 text-sm text-white placeholder-gray-600 outline-none transition-colors",
    hasError
      ? "border-red-500/40 focus:border-red-500"
      : "border-white/5 focus:border-shop-yellow"
  );

function AdminField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-400 font-medium mt-1.5">{error}</p>
      )}
    </div>
  );
}

function FlagToggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={cn(
        "flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-colors text-left",
        value
          ? "border-shop-yellow/50 bg-shop-yellow/5"
          : "border-white/5 hover:border-white/10"
      )}
    >
      <span
        className={cn(
          "text-xs font-black uppercase tracking-widest",
          value ? "text-shop-yellow" : "text-gray-400"
        )}
      >
        {label}
      </span>
      <div
        className={cn(
          "w-10 h-5 rounded-full transition-colors relative",
          value ? "bg-shop-yellow" : "bg-white/10"
        )}
      >
        <div
          className={cn(
            "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all",
            value ? "left-5" : "left-0.5"
          )}
        />
      </div>
    </button>
  );
}
