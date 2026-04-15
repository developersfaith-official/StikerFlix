// Lightweight SEO scoring — no external dependencies.
// Returns 0–100 plus actionable per-check details.

export interface AffiliateLink {
  url: string;
  product_name: string;
  platform: "amazon" | "etsy" | "custom" | "internal";
  commission_percent: number;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  focus_keyword: string | null;
  related_keywords: string[];
  seo_score: number;
  status: "draft" | "published" | "scheduled";
  published_at: string | null;
  scheduled_at: string | null;
  author_id: string | null;
  author_name: string | null;
  category: string | null;
  is_featured: boolean;
  view_count: number;
  affiliate_links: AffiliateLink[];
  affiliate_disclosure: string | null;
  reading_time_minutes: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface SeoCheck {
  id: string;
  label: string;
  passed: boolean;
  value: string | number;
  points: number;
  maxPoints: number;
  tip?: string;
}

export interface SeoReport {
  score: number;              // 0..100
  wordCount: number;
  readingTimeMinutes: number;
  checks: SeoCheck[];
}

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, " ");
const countWords = (text: string) =>
  text.trim().split(/\s+/).filter(Boolean).length;

export function calculateReadingTime(contentHtml: string): number {
  const words = countWords(stripHtml(contentHtml));
  return Math.max(1, Math.round(words / 200)); // 200 WPM
}

/**
 * Scores a blog draft 0–100 across 10 SEO checks.
 * All logic is client-safe so the SEO panel can update live.
 */
export function calculateSeoScore(input: {
  title: string;
  content: string;
  excerpt: string;
  meta_title: string;
  meta_description: string;
  focus_keyword: string;
  featured_image_url: string;
}): SeoReport {
  const plainContent = stripHtml(input.content);
  const lowerContent = plainContent.toLowerCase();
  const lowerTitle = input.title.toLowerCase();
  const keyword = input.focus_keyword.trim().toLowerCase();
  const wordCount = countWords(plainContent);

  const checks: SeoCheck[] = [];

  // 1. Title length 50–60
  const titleLen = input.title.length;
  const titleOk = titleLen >= 40 && titleLen <= 70;
  checks.push({
    id: "title-length",
    label: "Title length (40–70 chars)",
    passed: titleOk,
    value: `${titleLen} chars`,
    points: titleOk ? 10 : 0,
    maxPoints: 10,
    tip: titleOk ? undefined : "Aim for 40–70 characters for best CTR.",
  });

  // 2. Meta description 120–170
  const mdLen = input.meta_description.length;
  const mdOk = mdLen >= 120 && mdLen <= 170;
  checks.push({
    id: "meta-desc",
    label: "Meta description (120–170 chars)",
    passed: mdOk,
    value: `${mdLen} chars`,
    points: mdOk ? 10 : 0,
    maxPoints: 10,
    tip: mdOk
      ? undefined
      : "Google typically shows 150–160 chars. Write a compelling snippet.",
  });

  // 3. Focus keyword provided
  const hasKeyword = keyword.length >= 2;
  checks.push({
    id: "focus-keyword",
    label: "Focus keyword set",
    passed: hasKeyword,
    value: hasKeyword ? keyword : "missing",
    points: hasKeyword ? 5 : 0,
    maxPoints: 5,
    tip: hasKeyword ? undefined : "Pick one phrase to rank for, e.g. 'laptop stickers'.",
  });

  // 4. Keyword in title
  const kwInTitle = hasKeyword && lowerTitle.includes(keyword);
  checks.push({
    id: "keyword-in-title",
    label: "Focus keyword in title",
    passed: kwInTitle,
    value: kwInTitle ? "yes" : "no",
    points: kwInTitle ? 10 : 0,
    maxPoints: 10,
    tip: kwInTitle ? undefined : "Include your focus keyword in the title.",
  });

  // 5. Keyword in first paragraph
  const firstPara = lowerContent.slice(0, 300);
  const kwInIntro = hasKeyword && firstPara.includes(keyword);
  checks.push({
    id: "keyword-in-intro",
    label: "Focus keyword in first paragraph",
    passed: kwInIntro,
    value: kwInIntro ? "yes" : "no",
    points: kwInIntro ? 10 : 0,
    maxPoints: 10,
    tip: kwInIntro ? undefined : "Mention the keyword within the first 150 words.",
  });

  // 6. Keyword density 0.5%–3%
  const kwCount = hasKeyword
    ? (lowerContent.match(new RegExp(`\\b${escapeRegex(keyword)}\\b`, "g")) ?? []).length
    : 0;
  const density = wordCount > 0 ? (kwCount / wordCount) * 100 : 0;
  const densityOk = hasKeyword && density >= 0.5 && density <= 3;
  checks.push({
    id: "density",
    label: "Keyword density (0.5%–3%)",
    passed: densityOk,
    value: `${density.toFixed(2)}%`,
    points: densityOk ? 10 : 0,
    maxPoints: 10,
    tip: densityOk ? undefined : "Use the keyword naturally 3–10 times in a long post.",
  });

  // 7. Word count ≥ 600 (ideal 1200+)
  const countOk = wordCount >= 600;
  const countExcellent = wordCount >= 1200;
  checks.push({
    id: "word-count",
    label: "Word count (600+ minimum)",
    passed: countOk,
    value: `${wordCount} words`,
    points: countExcellent ? 15 : countOk ? 10 : 0,
    maxPoints: 15,
    tip: countOk
      ? undefined
      : "Longer posts rank better. Aim for 1200+ words.",
  });

  // 8. Headings (H2 present)
  const h2Count = (input.content.match(/<h2[\s>]/gi) ?? []).length;
  const headingsOk = h2Count >= 2;
  checks.push({
    id: "headings",
    label: "H2 headings (2+)",
    passed: headingsOk,
    value: `${h2Count} H2`,
    points: headingsOk ? 10 : 0,
    maxPoints: 10,
    tip: headingsOk ? undefined : "Break up content with at least 2 H2 sections.",
  });

  // 9. Internal links
  const linkCount = (input.content.match(/<a[\s>]/gi) ?? []).length;
  const linksOk = linkCount >= 2;
  checks.push({
    id: "internal-links",
    label: "Links (2+)",
    passed: linksOk,
    value: `${linkCount} links`,
    points: linksOk ? 10 : 0,
    maxPoints: 10,
    tip: linksOk ? undefined : "Add links to related products or articles.",
  });

  // 10. Featured image present
  const hasImage = input.featured_image_url.trim().length > 0;
  checks.push({
    id: "featured-image",
    label: "Featured image",
    passed: hasImage,
    value: hasImage ? "yes" : "no",
    points: hasImage ? 10 : 0,
    maxPoints: 10,
    tip: hasImage ? undefined : "Upload a featured image for social sharing.",
  });

  const score = checks.reduce((s, c) => s + c.points, 0);
  const maxScore = checks.reduce((s, c) => s + c.maxPoints, 0);
  const scaled = Math.round((score / maxScore) * 100);

  return {
    score: scaled,
    wordCount,
    readingTimeMinutes: Math.max(1, Math.round(wordCount / 200)),
    checks,
  };
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
