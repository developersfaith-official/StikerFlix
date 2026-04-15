"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Calendar,
  User,
  Share2,
  Twitter,
  Facebook,
  Link as LinkIcon,
  Loader2,
  AlertCircle,
  Info,
  ExternalLink,
  ShoppingBag,
} from "lucide-react";
import { Blog, AffiliateLink } from "@/lib/blog-seo";
import {
  BlogLanguageSelector,
  LANGUAGES,
  LANG_DISCLAIMER,
  translateHtml,
  type LangCode,
} from "@/components/BlogLanguageSelector";

interface RelatedBlog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  published_at: string | null;
  reading_time_minutes: number;
}

export default function BlogReaderPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [blog, setBlog] = useState<Blog | null>(null);
  const [related, setRelated] = useState<RelatedBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // ── Language / translation state ──
  const [lang, setLang] = useState<LangCode>("en");
  const [translating, setTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [translatedTitle, setTranslatedTitle] = useState<string | null>(null);
  const [translatedExcerpt, setTranslatedExcerpt] = useState<string | null>(
    null
  );

  const isRtl = LANGUAGES.find((l) => l.code === lang)?.rtl ?? false;

  // Kick off translation when lang changes
  useEffect(() => {
    if (!blog) return;
    if (lang === "en") {
      setTranslatedContent(null);
      setTranslatedTitle(null);
      setTranslatedExcerpt(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setTranslating(true);
      const [c, t, e] = await Promise.all([
        translateHtml(blog.content, lang),
        translateHtml(`<p>${blog.title}</p>`, lang),
        blog.excerpt ? translateHtml(`<p>${blog.excerpt}</p>`, lang) : Promise.resolve(""),
      ]);
      if (!cancelled) {
        setTranslatedContent(c);
        setTranslatedTitle(t.replace(/<\/?p>/g, ""));
        setTranslatedExcerpt(e.replace(/<\/?p>/g, ""));
        setTranslating(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lang, blog]);

  useEffect(() => {
    let mounted = true;
    fetch(`/api/blogs/${slug}`)
      .then((r) => r.json())
      .then((body) => {
        if (!mounted) return;
        if (!body.success) setError(body.error ?? "Blog not found");
        else {
          setBlog(body.blog);
          setRelated(body.related ?? []);
        }
      })
      .catch(() => mounted && setError("Failed to load blog"))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [slug]);

  // Inject JSON-LD once we have the blog
  useEffect(() => {
    if (!blog) return;
    const schema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: blog.title,
      description: blog.meta_description ?? blog.excerpt ?? undefined,
      image: blog.featured_image_url ?? undefined,
      datePublished: blog.published_at,
      dateModified: blog.updated_at,
      author: {
        "@type": "Person",
        name: blog.author_name ?? "StickerFlix Team",
      },
      keywords: [blog.focus_keyword, ...blog.related_keywords]
        .filter(Boolean)
        .join(", "),
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "blog-jsonld";
    script.text = JSON.stringify(schema);
    document.getElementById("blog-jsonld")?.remove();
    document.head.appendChild(script);
    return () => {
      document.getElementById("blog-jsonld")?.remove();
    };
  }, [blog]);

  const trackAffiliateClick = (blogId: string) => {
    fetch("/api/blogs/track-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blogId }),
    }).catch(() => {});
  };

  const handleShare = async (platform: "twitter" | "facebook" | "copy") => {
    const url =
      typeof window !== "undefined" ? window.location.href : "";
    const text = blog?.title ?? "";
    if (platform === "twitter") {
      window.open(
        `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
        "_blank"
      );
    } else if (platform === "facebook") {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        "_blank"
      );
    } else {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 1500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-shop-yellow" />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <AlertCircle className="w-10 h-10 text-gray-300" />
        <h1 className="text-2xl font-black uppercase tracking-tighter text-shop-black">
          {error ?? "Blog not found"}
        </h1>
        <Link
          href="/blog"
          className="text-xs font-black uppercase tracking-widest text-shop-yellow hover:underline"
        >
          ← Back to blog
        </Link>
      </div>
    );
  }

  const hasAffiliate = blog.affiliate_links.length > 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero banner */}
      <div className="relative bg-gray-50 border-b border-gray-100">
        {blog.featured_image_url && (
          <div className="aspect-[21/9] md:aspect-[16/6] max-h-[500px] overflow-hidden bg-gray-100">
            <img
              src={blog.featured_image_url}
              alt={blog.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">
        <Link
          href="/blog"
          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-shop-yellow transition-colors mb-8"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to blog
        </Link>

        {/* Header */}
        <div className="space-y-4 mb-10">
          {blog.category && (
            <span className="inline-block text-[10px] font-black uppercase tracking-widest text-shop-yellow bg-shop-yellow/10 px-3 py-1 rounded-full">
              {blog.category}
            </span>
          )}
          <h1
            className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-shop-black leading-tight"
            dir={isRtl ? "rtl" : "ltr"}
          >
            {translatedTitle ?? blog.title}
          </h1>
          {(translatedExcerpt || blog.excerpt) && (
            <p
              className="text-lg text-gray-500 leading-relaxed max-w-3xl"
              dir={isRtl ? "rtl" : "ltr"}
            >
              {translatedExcerpt || blog.excerpt}
            </p>
          )}

          {/* Language selector */}
          <div className="pt-2">
            <BlogLanguageSelector
              current={lang}
              onChange={setLang}
              translating={translating}
            />
            {lang !== "en" && <LANG_DISCLAIMER />}
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 flex-wrap pt-4 text-xs text-gray-400 font-bold uppercase tracking-widest border-t border-gray-100">
            {blog.author_name && (
              <span className="flex items-center gap-1.5">
                <User className="w-3 h-3" />
                {blog.author_name}
              </span>
            )}
            {blog.published_at && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                {new Date(blog.published_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              {blog.reading_time_minutes} min read
            </span>

            {/* Share */}
            <div className="flex items-center gap-2 ml-auto">
              <Share2 className="w-3 h-3 text-gray-400" />
              <button
                onClick={() => handleShare("twitter")}
                aria-label="Share on Twitter"
                className="p-1.5 rounded-full hover:bg-shop-yellow/10 hover:text-shop-yellow transition-colors"
              >
                <Twitter className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleShare("facebook")}
                aria-label="Share on Facebook"
                className="p-1.5 rounded-full hover:bg-shop-yellow/10 hover:text-shop-yellow transition-colors"
              >
                <Facebook className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleShare("copy")}
                aria-label="Copy link"
                className="p-1.5 rounded-full hover:bg-shop-yellow/10 hover:text-shop-yellow transition-colors relative"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                {copiedLink && (
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[9px] bg-shop-black text-white px-2 py-0.5 rounded whitespace-nowrap">
                    Copied!
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* FTC disclosure banner */}
        {hasAffiliate && blog.affiliate_disclosure && (
          <div className="flex items-start gap-3 p-4 bg-shop-yellow/5 border border-shop-yellow/20 rounded-2xl mb-10 text-xs text-gray-600 leading-relaxed">
            <Info className="w-4 h-4 mt-0.5 text-shop-yellow shrink-0" />
            <span>
              <strong className="text-shop-black">Disclosure:</strong>{" "}
              {blog.affiliate_disclosure}
            </span>
          </div>
        )}

        {/* Content */}
        {translating && lang !== "en" && (
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-4">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Translating to {LANGUAGES.find((l) => l.code === lang)?.label}…
          </div>
        )}
        <article
          className="prose-custom"
          dir={isRtl ? "rtl" : "ltr"}
          dangerouslySetInnerHTML={{ __html: translatedContent ?? blog.content }}
        />

        {/* Tags */}
        {blog.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-100 flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Tags:
            </span>
            {blog.tags.map((t) => (
              <span
                key={t}
                className="text-[10px] font-black uppercase tracking-widest text-gray-500 bg-gray-100 px-3 py-1 rounded-full"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Affiliate recommendations */}
        {hasAffiliate && (
          <div className="mt-12 pt-8 border-t border-gray-100">
            <h2 className="text-xl font-black uppercase tracking-tighter text-shop-black mb-1">
              Recommended Products
            </h2>
            <div className="h-1 w-10 bg-shop-yellow rounded-full mb-6" />
            <div className="grid gap-3">
              {blog.affiliate_links.map((link: AffiliateLink, i: number) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener sponsored noreferrer"
                  onClick={() => trackAffiliateClick(blog.id)}
                  className="group flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-shop-yellow/5 hover:border-shop-yellow border border-transparent transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-shop-yellow/10 text-shop-yellow flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-shop-black truncate">
                      {link.product_name || link.url}
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-0.5">
                      {link.platform}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-shop-yellow transition-colors shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16 pt-12 border-t border-gray-100">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-shop-black mb-1">
              Related Articles
            </h2>
            <div className="h-1 w-10 bg-shop-yellow rounded-full mb-8" />
            <div className="grid md:grid-cols-3 gap-6">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/blog/${r.slug}`}
                  className="group"
                >
                  <div className="aspect-video bg-gray-50 rounded-2xl overflow-hidden mb-3">
                    {r.featured_image_url && (
                      <img
                        src={r.featured_image_url}
                        alt={r.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>
                  <h3 className="text-base font-black uppercase tracking-tight text-shop-black leading-snug group-hover:text-shop-yellow transition-colors line-clamp-2">
                    {r.title}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">
                    {r.reading_time_minutes} min read
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Minimal "prose" styling (global CSS would be cleaner but we keep it local) */}
      <style jsx global>{`
        .prose-custom {
          color: #374151;
          font-size: 1.0625rem;
          line-height: 1.8;
          max-width: none;
        }
        .prose-custom h1,
        .prose-custom h2,
        .prose-custom h3 {
          color: #1a1a1a;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: -0.02em;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          line-height: 1.2;
        }
        .prose-custom h2 {
          font-size: 1.875rem;
          border-top: 1px solid #f3f4f6;
          padding-top: 2rem;
        }
        .prose-custom h3 {
          font-size: 1.375rem;
        }
        .prose-custom p {
          margin-bottom: 1.25rem;
        }
        .prose-custom a {
          color: #facc15;
          font-weight: 700;
          text-decoration: underline;
          text-decoration-thickness: 2px;
          text-underline-offset: 3px;
        }
        .prose-custom a:hover {
          color: #1a1a1a;
        }
        .prose-custom ul,
        .prose-custom ol {
          padding-left: 1.5rem;
          margin-bottom: 1.25rem;
        }
        .prose-custom ul {
          list-style: disc;
        }
        .prose-custom ol {
          list-style: decimal;
        }
        .prose-custom li {
          margin-bottom: 0.5rem;
        }
        .prose-custom strong {
          color: #1a1a1a;
          font-weight: 800;
        }
        .prose-custom blockquote {
          border-left: 4px solid #facc15;
          padding: 0.5rem 1.5rem;
          margin: 2rem 0;
          font-style: italic;
          color: #6b7280;
          background: #fafaf7;
          border-radius: 0.75rem;
        }
        .prose-custom img {
          border-radius: 1rem;
          margin: 2rem auto;
        }
        .prose-custom code {
          background: #f3f4f6;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
        }
      `}</style>
    </div>
  );
}
