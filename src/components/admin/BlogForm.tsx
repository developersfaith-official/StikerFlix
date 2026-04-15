"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Save,
  Trash2,
  Loader2,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Plus,
  X,
  Link as LinkIcon,
  ExternalLink,
  Sparkles,
  Info,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  calculateSeoScore,
  slugify,
  type Blog,
  type AffiliateLink,
  type SeoReport,
} from "@/lib/blog-seo";

interface BlogFormProps {
  mode: "create" | "edit";
  initial?: Blog;
}

interface FormState {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image_url: string;
  meta_title: string;
  meta_description: string;
  focus_keyword: string;
  related_keywords: string[];
  status: "draft" | "published" | "scheduled";
  published_at: string;
  scheduled_at: string;
  category: string;
  is_featured: boolean;
  affiliate_links: AffiliateLink[];
  affiliate_disclosure: string;
  tags: string[];
  author_name: string;
}

const DEFAULT_DISCLOSURE =
  "As an Amazon Associate and affiliate partner, I earn from qualifying purchases. Some links in this post may be affiliate links; this does not change the price for you.";

const CATEGORIES = [
  "tutorial",
  "review",
  "guide",
  "trends",
  "news",
  "marketing",
  "stickers",
];

const EMPTY: FormState = {
  title: "",
  slug: "",
  content: "",
  excerpt: "",
  featured_image_url: "",
  meta_title: "",
  meta_description: "",
  focus_keyword: "",
  related_keywords: [],
  status: "draft",
  published_at: "",
  scheduled_at: "",
  category: "stickers",
  is_featured: false,
  affiliate_links: [],
  affiliate_disclosure: DEFAULT_DISCLOSURE,
  tags: [],
  author_name: "",
};

export const BlogForm: React.FC<BlogFormProps> = ({ mode, initial }) => {
  const router = useRouter();

  const [values, setValues] = useState<FormState>(
    initial
      ? {
          title: initial.title,
          slug: initial.slug,
          content: initial.content ?? "",
          excerpt: initial.excerpt ?? "",
          featured_image_url: initial.featured_image_url ?? "",
          meta_title: initial.meta_title ?? "",
          meta_description: initial.meta_description ?? "",
          focus_keyword: initial.focus_keyword ?? "",
          related_keywords: initial.related_keywords ?? [],
          status: initial.status,
          published_at: initial.published_at?.slice(0, 16) ?? "",
          scheduled_at: initial.scheduled_at?.slice(0, 16) ?? "",
          category: initial.category ?? "stickers",
          is_featured: initial.is_featured,
          affiliate_links: initial.affiliate_links ?? [],
          affiliate_disclosure:
            initial.affiliate_disclosure ?? DEFAULT_DISCLOSURE,
          tags: initial.tags ?? [],
          author_name: initial.author_name ?? "",
        }
      : EMPTY
  );

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(mode === "edit");
  const [tagInput, setTagInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");

  // Auto-slug from title (unless user edited slug manually)
  const handleTitleChange = (v: string) => {
    setValues((p) => ({
      ...p,
      title: v,
      slug: slugManuallyEdited ? p.slug : slugify(v),
    }));
  };

  // ── SEO report (live) ─────────────────────────────────────────────
  const seo: SeoReport = useMemo(
    () =>
      calculateSeoScore({
        title: values.title,
        content: values.content,
        excerpt: values.excerpt,
        meta_title: values.meta_title,
        meta_description: values.meta_description,
        focus_keyword: values.focus_keyword,
        featured_image_url: values.featured_image_url,
      }),
    [
      values.title,
      values.content,
      values.excerpt,
      values.meta_title,
      values.meta_description,
      values.focus_keyword,
      values.featured_image_url,
    ]
  );

  // ── Submit ───────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (values.title.trim().length < 3) {
      setError("Title must be at least 3 characters");
      return;
    }

    setSaving(true);
    const url =
      mode === "create"
        ? "/api/admin/blogs"
        : `/api/admin/blogs/${initial?.id}`;
    const method = mode === "create" ? "POST" : "PUT";

    const payload = {
      ...values,
      seo_score: seo.score,
      published_at: values.published_at
        ? new Date(values.published_at).toISOString()
        : null,
      scheduled_at: values.scheduled_at
        ? new Date(values.scheduled_at).toISOString()
        : null,
    };

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(body.error ?? "Failed to save");
      return;
    }

    setSuccess(true);
    if (mode === "create") {
      setTimeout(() => router.push("/admin/blogs"), 600);
    } else {
      setTimeout(() => setSuccess(false), 1500);
    }
  };

  const handleDelete = async () => {
    if (!initial) return;
    if (!confirm(`Delete "${initial.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/blogs/${initial.id}`, {
      method: "DELETE",
    });
    if (res.ok) router.push("/admin/blogs");
    else setDeleting(false);
  };

  // ── Tags + keywords helpers ──────────────────────────────────────
  const addTag = () => {
    const t = tagInput.trim();
    if (t && !values.tags.includes(t)) {
      setValues((p) => ({ ...p, tags: [...p.tags, t] }));
    }
    setTagInput("");
  };
  const removeTag = (t: string) =>
    setValues((p) => ({ ...p, tags: p.tags.filter((x) => x !== t) }));

  const addKeyword = () => {
    const k = keywordInput.trim();
    if (k && !values.related_keywords.includes(k)) {
      setValues((p) => ({
        ...p,
        related_keywords: [...p.related_keywords, k],
      }));
    }
    setKeywordInput("");
  };
  const removeKeyword = (k: string) =>
    setValues((p) => ({
      ...p,
      related_keywords: p.related_keywords.filter((x) => x !== k),
    }));

  // ── Affiliate helpers ────────────────────────────────────────────
  const addAffiliate = () =>
    setValues((p) => ({
      ...p,
      affiliate_links: [
        ...p.affiliate_links,
        {
          url: "",
          product_name: "",
          platform: "amazon",
          commission_percent: 5,
        },
      ],
    }));
  const updateAffiliate = (idx: number, patch: Partial<AffiliateLink>) =>
    setValues((p) => ({
      ...p,
      affiliate_links: p.affiliate_links.map((a, i) =>
        i === idx ? { ...a, ...patch } : a
      ),
    }));
  const removeAffiliate = (idx: number) =>
    setValues((p) => ({
      ...p,
      affiliate_links: p.affiliate_links.filter((_, i) => i !== idx),
    }));

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Link
            href="/admin/blogs"
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-shop-yellow transition-colors mb-3"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to blogs
          </Link>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white">
            {mode === "create" ? "New Blog" : "Edit Blog"}
          </h1>
          {mode === "edit" && initial && (
            <p className="text-xs text-gray-500 mt-2">
              {initial.view_count} views · Created{" "}
              {new Date(initial.created_at).toLocaleDateString()}
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
            {mode === "create" ? "Blog created!" : "Changes saved."}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        {/* ── Main column (2/3) ────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Basic info */}
          <Section title="Basic Info">
            <Field label={`Title (${values.title.length} chars)`}>
              <input
                type="text"
                value={values.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Best Laptop Stickers for Programmers in 2026"
                className={inputCls}
              />
            </Field>
            <Field
              label={`Slug${!slugManuallyEdited ? " (auto-generated)" : ""}`}
            >
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
                  /blog/
                </span>
                <input
                  type="text"
                  value={values.slug}
                  onChange={(e) => {
                    setSlugManuallyEdited(true);
                    setValues({ ...values, slug: slugify(e.target.value) });
                  }}
                  className={cn(inputCls, "pl-16")}
                />
              </div>
            </Field>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Author name">
                <input
                  type="text"
                  value={values.author_name}
                  onChange={(e) =>
                    setValues({ ...values, author_name: e.target.value })
                  }
                  placeholder="StickerFlix Team"
                  className={inputCls}
                />
              </Field>
              <Field label="Category">
                <select
                  value={values.category}
                  onChange={(e) =>
                    setValues({ ...values, category: e.target.value })
                  }
                  className={inputCls}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Featured image URL">
              <input
                type="url"
                value={values.featured_image_url}
                onChange={(e) =>
                  setValues({
                    ...values,
                    featured_image_url: e.target.value,
                  })
                }
                placeholder="https://example.com/cover.jpg"
                className={inputCls}
              />
              {values.featured_image_url && (
                <div className="mt-3 aspect-video bg-white/[0.03] rounded-lg overflow-hidden">
                  <img
                    src={values.featured_image_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) =>
                      ((e.target as HTMLImageElement).style.display = "none")
                    }
                  />
                </div>
              )}
            </Field>

            <Field label="Excerpt (shown in blog list)">
              <textarea
                value={values.excerpt}
                onChange={(e) =>
                  setValues({ ...values, excerpt: e.target.value })
                }
                rows={2}
                placeholder="A short summary that entices readers to click through."
                className={cn(inputCls, "resize-none")}
              />
            </Field>
          </Section>

          {/* Content */}
          <Section
            title={`Content · ${seo.wordCount} words · ${seo.readingTimeMinutes} min read`}
          >
            <div className="text-[10px] text-gray-500 mb-3 font-medium">
              Write in HTML. Use{" "}
              <code className="text-shop-yellow">&lt;h2&gt;</code>{" "}
              <code className="text-shop-yellow">&lt;p&gt;</code>{" "}
              <code className="text-shop-yellow">&lt;a&gt;</code>{" "}
              <code className="text-shop-yellow">&lt;strong&gt;</code> for structure.
              Rich editor coming in a future update.
            </div>
            <textarea
              value={values.content}
              onChange={(e) =>
                setValues({ ...values, content: e.target.value })
              }
              rows={18}
              placeholder="<h2>Introduction</h2>\n<p>Your paragraph here.</p>"
              className={cn(inputCls, "resize-y font-mono text-xs leading-relaxed")}
            />
          </Section>

          {/* SEO */}
          <Section title="SEO">
            <Field label={`Meta title (${values.meta_title.length}/60)`}>
              <input
                type="text"
                value={values.meta_title}
                onChange={(e) =>
                  setValues({ ...values, meta_title: e.target.value })
                }
                placeholder="Usually matches title but may differ"
                className={inputCls}
              />
            </Field>
            <Field label={`Meta description (${values.meta_description.length}/160)`}>
              <textarea
                value={values.meta_description}
                onChange={(e) =>
                  setValues({ ...values, meta_description: e.target.value })
                }
                rows={2}
                placeholder="The snippet Google shows in search results."
                className={cn(inputCls, "resize-none")}
              />
            </Field>
            <Field label="Focus keyword">
              <input
                type="text"
                value={values.focus_keyword}
                onChange={(e) =>
                  setValues({ ...values, focus_keyword: e.target.value })
                }
                placeholder="laptop stickers"
                className={inputCls}
              />
            </Field>
            <Field label="Related keywords">
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addKeyword();
                    }
                  }}
                  placeholder="Press Enter to add"
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={addKeyword}
                  className="px-4 py-3 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {values.related_keywords.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {values.related_keywords.map((k) => (
                    <Tag
                      key={k}
                      label={k}
                      onRemove={() => removeKeyword(k)}
                    />
                  ))}
                </div>
              )}
            </Field>
            <Field label="Tags (for filtering/display)">
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Press Enter to add"
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-3 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {values.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {values.tags.map((t) => (
                    <Tag key={t} label={t} onRemove={() => removeTag(t)} />
                  ))}
                </div>
              )}
            </Field>
          </Section>

          {/* Affiliate */}
          <Section title={`Affiliate Links · ${values.affiliate_links.length}`}>
            <div className="space-y-3">
              {values.affiliate_links.map((link, i) => (
                <div
                  key={i}
                  className="p-4 bg-[#0F1115] rounded-xl border border-white/5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                      Link #{i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAffiliate(i)}
                      className="p-1.5 rounded bg-white/5 text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={link.product_name}
                      onChange={(e) =>
                        updateAffiliate(i, { product_name: e.target.value })
                      }
                      placeholder="Product name"
                      className={inputCls}
                    />
                    <select
                      value={link.platform}
                      onChange={(e) =>
                        updateAffiliate(i, {
                          platform: e.target.value as AffiliateLink["platform"],
                        })
                      }
                      className={inputCls}
                    >
                      <option value="amazon">Amazon</option>
                      <option value="etsy">Etsy</option>
                      <option value="internal">Internal (our shop)</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) =>
                      updateAffiliate(i, { url: e.target.value })
                    }
                    placeholder="https://amazon.com/dp/…?tag=yourtag-20"
                    className={inputCls}
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                      Commission %
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step="0.01"
                      value={link.commission_percent}
                      onChange={(e) =>
                        updateAffiliate(i, {
                          commission_percent: parseFloat(e.target.value) || 0,
                        })
                      }
                      className={cn(inputCls, "w-24")}
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addAffiliate}
                className="w-full py-3 rounded-xl border-2 border-dashed border-white/10 text-gray-500 hover:border-shop-yellow/30 hover:text-shop-yellow transition-colors text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add affiliate link
              </button>
            </div>

            <div className="mt-5">
              <Field label="FTC disclosure">
                <textarea
                  value={values.affiliate_disclosure}
                  onChange={(e) =>
                    setValues({
                      ...values,
                      affiliate_disclosure: e.target.value,
                    })
                  }
                  rows={2}
                  className={cn(inputCls, "resize-none text-xs")}
                />
              </Field>
            </div>
          </Section>
        </div>

        {/* ── Sidebar column (1/3) ────────────────────────────────── */}
        <div className="space-y-5">
          {/* SEO score card */}
          <div className="bg-[#161A21] border border-white/5 rounded-2xl p-5 sticky top-24">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-shop-yellow" />
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">
                SEO Score
              </h3>
              <span
                className={cn(
                  "ml-auto text-xs font-black px-2 py-0.5 rounded",
                  seo.score >= 80
                    ? "bg-green-500/10 text-green-400"
                    : seo.score >= 50
                    ? "bg-yellow-500/10 text-yellow-400"
                    : "bg-red-500/10 text-red-400"
                )}
              >
                {seo.score}/100
              </span>
            </div>

            <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-4">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  seo.score >= 80
                    ? "bg-green-500"
                    : seo.score >= 50
                    ? "bg-yellow-500"
                    : "bg-red-500"
                )}
                style={{ width: `${seo.score}%` }}
              />
            </div>

            <div className="space-y-1.5 max-h-96 overflow-y-auto">
              {seo.checks.map((c) => (
                <div
                  key={c.id}
                  className="flex items-start gap-2 text-[11px] py-1"
                >
                  {c.passed ? (
                    <CheckCircle className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 mt-0.5 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "font-bold",
                          c.passed ? "text-gray-300" : "text-gray-500"
                        )}
                      >
                        {c.label}
                      </span>
                      <span className="text-gray-500 text-[10px] shrink-0">
                        {c.value}
                      </span>
                    </div>
                    {!c.passed && c.tip && (
                      <p className="text-gray-500 text-[10px] mt-0.5 leading-relaxed">
                        {c.tip}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Publishing */}
          <Section title="Publishing">
            <Field label="Status">
              <select
                value={values.status}
                onChange={(e) =>
                  setValues({
                    ...values,
                    status: e.target.value as FormState["status"],
                  })
                }
                className={inputCls}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </Field>

            {values.status === "scheduled" && (
              <Field label="Scheduled for">
                <input
                  type="datetime-local"
                  value={values.scheduled_at}
                  onChange={(e) =>
                    setValues({ ...values, scheduled_at: e.target.value })
                  }
                  className={inputCls}
                />
              </Field>
            )}

            {values.status === "published" && (
              <Field label="Published at (optional)">
                <input
                  type="datetime-local"
                  value={values.published_at}
                  onChange={(e) =>
                    setValues({ ...values, published_at: e.target.value })
                  }
                  className={inputCls}
                />
              </Field>
            )}

            <label className="flex items-center gap-3 cursor-pointer mt-2">
              <input
                type="checkbox"
                checked={values.is_featured}
                onChange={(e) =>
                  setValues({ ...values, is_featured: e.target.checked })
                }
                className="w-4 h-4 accent-shop-yellow cursor-pointer"
              />
              <span className="text-xs font-bold text-gray-300">
                Featured (show on homepage)
              </span>
            </label>
          </Section>

          {/* Save button */}
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
                {mode === "create" ? "Create Blog" : "Save Changes"}
              </>
            )}
          </button>

          {/* Preview link */}
          {mode === "edit" && initial && values.status === "published" && (
            <Link
              href={`/blog/${values.slug}`}
              target="_blank"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/5 text-gray-300 hover:bg-white/10 text-xs font-black uppercase tracking-widest transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View Live
            </Link>
          )}
        </div>
      </form>
    </div>
  );
};

// ── helpers ────────────────────────────────────────────────────────

const inputCls =
  "w-full px-4 py-3 bg-[#0F1115] rounded-xl border-2 border-white/5 text-sm text-white placeholder-gray-600 outline-none focus:border-shop-yellow transition-colors";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#161A21] border border-white/5 rounded-2xl p-5 md:p-6 space-y-4">
      <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

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

function Tag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1.5 text-xs font-bold text-shop-yellow bg-shop-yellow/10 px-3 py-1 rounded-full">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="text-shop-yellow/60 hover:text-shop-yellow"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
