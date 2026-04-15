"use client";

import React, { useState, useCallback } from "react";
import { Languages, Loader2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

// Supported languages — code follows MyMemory/ISO-639-1
export const LANGUAGES = [
  { code: "en", label: "English", rtl: false, short: "EN" },
  { code: "ar", label: "العربية", rtl: true, short: "AR" },
  { code: "ur", label: "اردو", rtl: true, short: "UR" },
  { code: "ps", label: "پښتو", rtl: true, short: "PS" },
  // "Roman Urdu" = Urdu in Latin script. Auto-translation can't do this
  // reliably, so we expose it as a separate option that maps to Urdu with
  // a note; ideally admins add Roman Urdu content manually.
  { code: "ur-Latn", label: "Roman Urdu", rtl: false, short: "RU" },
] as const;

export type LangCode = (typeof LANGUAGES)[number]["code"];

interface Props {
  current: LangCode;
  onChange: (code: LangCode) => void;
  translating: boolean;
}

export const BlogLanguageSelector: React.FC<Props> = ({
  current,
  onChange,
  translating,
}) => {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
        <Languages className="w-3.5 h-3.5" />
        Read in:
      </div>
      <div className="flex flex-wrap gap-1.5">
        {LANGUAGES.map((lang) => {
          const active = current === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => onChange(lang.code)}
              disabled={translating && !active}
              className={cn(
                "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                active
                  ? "bg-shop-black text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-shop-yellow hover:text-white",
                translating && !active && "opacity-40 cursor-not-allowed"
              )}
            >
              {active && translating ? (
                <Loader2 className="w-3 h-3 animate-spin inline" />
              ) : (
                <>
                  <span className="hidden sm:inline">{lang.label}</span>
                  <span className="sm:hidden">{lang.short}</span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────
// Translation helper — client-side, uses MyMemory free API.
// Chunks HTML by tag boundaries to stay under the 500-char/req soft cap.
// Caches per (text,lang) in-memory for the session.
// ─────────────────────────────────────────────────────────────────────

const cache = new Map<string, string>();

async function translateChunk(text: string, target: string): Promise<string> {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
    text
  )}&langpair=en|${target}`;
  try {
    const r = await fetch(url);
    const body = await r.json();
    const translated: string | undefined = body?.responseData?.translatedText;
    if (!translated) throw new Error("No translation in response");
    return translated;
  } catch {
    return text; // fall back to original on failure
  }
}

/**
 * Translates an HTML string by breaking it into text nodes, translating each,
 * and reassembling. Preserves tags and attributes.
 *
 * For Roman Urdu ('ur-Latn'), we translate to Urdu and prepend a note —
 * machine transliteration is unreliable so we prefer honest UX over bad output.
 */
export async function translateHtml(
  html: string,
  target: LangCode
): Promise<string> {
  if (target === "en") return html;

  const cacheKey = `${target}::${html}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;

  // Map ur-Latn → ur (MyMemory has no Roman-Urdu target)
  const apiTarget = target === "ur-Latn" ? "ur" : target;

  // Split into safe chunks at sentence/paragraph boundaries inside tags.
  // The simple approach: split by closing block tags, translate each, reassemble.
  const parts = html.split(/(<\/(?:p|h1|h2|h3|h4|li|blockquote)>)/g);

  const translated: string[] = [];
  for (const part of parts) {
    if (!part) continue;
    if (part.startsWith("</")) {
      translated.push(part);
      continue;
    }
    // If it's very short / has no visible text, skip the API call
    const visible = part.replace(/<[^>]*>/g, "").trim();
    if (visible.length < 2) {
      translated.push(part);
      continue;
    }
    // Further chunk by 450 chars to respect MyMemory limit
    if (visible.length <= 450) {
      translated.push(await translateChunk(part, apiTarget));
    } else {
      // Chunk by text, preserve opening tag(s) best-effort
      const chunks = chunkText(part, 450);
      const out: string[] = [];
      for (const c of chunks) {
        out.push(await translateChunk(c, apiTarget));
      }
      translated.push(out.join(""));
    }
  }

  let result = translated.join("");
  if (target === "ur-Latn") {
    result =
      `<p><em>Roman Urdu transliteration is limited — showing standard Urdu script instead.</em></p>` +
      result;
  }

  cache.set(cacheKey, result);
  return result;
}

function chunkText(s: string, max: number): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < s.length) {
    // Try to break at a space/period/newline within the last 50 chars
    const end = Math.min(i + max, s.length);
    let cut = end;
    if (end < s.length) {
      const slice = s.slice(i, end);
      const m = slice.search(/[.!?]\s|\n\n/g);
      if (m > max - 100) cut = i + m + 1;
    }
    out.push(s.slice(i, cut));
    i = cut;
  }
  return out;
}

export const LANG_DISCLAIMER: React.FC = () => (
  <div className="flex items-start gap-2 mt-3 text-[10px] text-gray-400 leading-relaxed">
    <Info className="w-3 h-3 mt-0.5 shrink-0" />
    <span>
      Automatic translation powered by MyMemory. Nuance may be lost — switch back to
      English for the author&apos;s original wording.
    </span>
  </div>
);
