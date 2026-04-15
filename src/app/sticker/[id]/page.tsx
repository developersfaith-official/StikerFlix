"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  Star,
  ShoppingCart,
  Check,
  Loader2,
  ChevronDown,
  ShieldCheck,
  Truck,
  RotateCcw,
  Package,
  CreditCard,
  Info,
} from "lucide-react";
import { Sticker, getStickers, FAQ, Review } from "@/data";
import { useCart } from "@/hooks/useCart";
import { ImageGallery } from "@/components/ImageGallery";
import { PricingTiers } from "@/components/PricingTiers";
import { cn } from "@/lib/utils";

// Lazy-loaded Phase 2 components
const FAQAccordion = dynamic(
  () =>
    import("@/components/FAQAccordion").then((mod) => ({
      default: mod.FAQAccordion,
    })),
  { ssr: false }
);
const ReviewsSection = dynamic(
  () =>
    import("@/components/ReviewsSection").then((mod) => ({
      default: mod.ReviewsSection,
    })),
  { ssr: false }
);
const PeopleAlsoSearched = dynamic(
  () =>
    import("@/components/PeopleAlsoSearched").then((mod) => ({
      default: mod.PeopleAlsoSearched,
    })),
  { ssr: false }
);

// ── Mock data helpers (replace when Supabase columns exist) ────────────
const MOCK_FEATURES = [
  "High-quality premium vinyl material",
  "Waterproof & scratch-resistant finish",
  "Easy to apply and remove cleanly",
  "UV resistant — no fading outdoors",
  "Suitable for laptops, bottles, cars & more",
  "Free shipping on bulk orders",
];

const MOCK_SPECS: Record<string, string> = {
  Material: "Premium vinyl (PVC)",
  Finish: "Glossy / Matte available",
  Thickness: "0.15mm",
  Adhesive: "Removable pressure-sensitive",
  "Water Resistance": "IP67 rated",
  "UV Protection": "Yes — fade-resistant",
};

// ── Accordion tab data ─────────────────────────────────────────────────
interface TabItem {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabItem[] = [
  { id: "details", title: "Product Details", icon: Info },
  { id: "shipping", title: "Shipping Information", icon: Truck },
  { id: "payment", title: "Payment Guarantee", icon: CreditCard },
];

// ═══════════════════════════════════════════════════════════════════════
export default function StickerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [sticker, setSticker] = useState<Sticker | null>(null);
  const [relatedStickers, setRelatedStickers] = useState<Sticker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cart
  const { addToCart } = useCart();
  const [cartQty, setCartQty] = useState(1);
  const [cartUnitPrice, setCartUnitPrice] = useState(0);
  const [justAdded, setJustAdded] = useState(false);

  // Tabs
  const [openTab, setOpenTab] = useState<string | null>(null);

  // SEO data (for JSON-LD)
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  // ── Fetch data ─────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);

        const response = await fetch(`/api/stickers/${id}`);
        const result = await response.json();

        if (!result.success) {
          if (mounted) setError("Sticker not found");
          return;
        }

        const currentSticker: Sticker = result.data;
        if (mounted) {
          setSticker(currentSticker);
          setCartUnitPrice(currentSticker.price);
        }

        const allStickers = await getStickers();
        const related = allStickers
          .filter(
            (s) =>
              s.category === currentSticker.category &&
              s.id !== currentSticker.id
          )
          .slice(0, 4);
        if (mounted) setRelatedStickers(related);

        // Fetch FAQs + Reviews for SEO schema
        const [faqRes, revRes] = await Promise.all([
          fetch(`/api/faqs?productId=${id}`).then((r) => r.json()).catch(() => ({ data: [] })),
          fetch(`/api/reviews?productId=${id}`).then((r) => r.json()).catch(() => ({ data: [] })),
        ]);
        if (mounted) {
          setFaqs(faqRes.data ?? []);
          setReviews(revRes.data ?? []);
        }
      } catch {
        if (mounted) setError("Failed to load sticker");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      mounted = false;
    };
  }, [id]);

  // ── JSON-LD structured data ────────────────────────────────────────
  useEffect(() => {
    if (!sticker) return;

    const schemas: object[] = [];

    // Product schema
    const productSchema: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: sticker.Title,
      description: sticker.description,
      image: sticker.image,
      category: sticker.category,
      offers: {
        "@type": "Offer",
        price: sticker.price,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
    };
    if (reviews.length > 0) {
      const avg = +(
        reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      ).toFixed(1);
      productSchema.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: avg,
        reviewCount: reviews.length,
      };
    }
    schemas.push(productSchema);

    // FAQ schema
    if (faqs.length > 0) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      });
    }

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(schemas);
    script.id = "stickerflix-jsonld";
    // Remove previous if exists
    document.getElementById("stickerflix-jsonld")?.remove();
    document.head.appendChild(script);

    return () => {
      document.getElementById("stickerflix-jsonld")?.remove();
    };
  }, [sticker, faqs, reviews]);

  // ── Handlers ───────────────────────────────────────────────────────
  const handleQuantityChange = useCallback(
    (qty: number, unitPrice: number) => {
      setCartQty(qty);
      setCartUnitPrice(unitPrice);
    },
    []
  );

  const handleAddToCart = () => {
    if (!sticker) return;
    addToCart(sticker.id, cartQty);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  // ── Loading state ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-shop-yellow" />
          <span className="text-xs font-black uppercase tracking-widest text-gray-400">
            Loading sticker…
          </span>
        </div>
      </div>
    );
  }

  // ── Error / not found ──────────────────────────────────────────────
  if (error || !sticker) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 px-4">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-shop-black text-center">
          Sticker Not Found
        </h1>
        <p className="text-gray-500 font-medium">
          The sticker you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="px-8 py-4 bg-shop-yellow text-white rounded-full font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-lg shadow-shop-yellow/20"
        >
          Go Back Home
        </Link>
      </div>
    );
  }

  const totalPrice = +(cartUnitPrice * cartQty).toFixed(2);

  // ══════════════════════════════════════════════════════════════════
  return (
    <div className="bg-white min-h-screen">
      {/* ── Breadcrumb / back ──────────────────────────────────────── */}
      <div className="px-4 md:px-12 py-4 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-gray-400 font-medium">
          <Link href="/" className="hover:text-shop-yellow transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link
            href="/search"
            className="hover:text-shop-yellow transition-colors"
          >
            {sticker.category}
          </Link>
          <span>/</span>
          <span className="text-shop-black truncate max-w-[200px]">
            {sticker.Title}
          </span>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────── */}
      <div className="px-4 md:px-12 py-8 md:py-12 max-w-7xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-shop-black mb-8 transition-all font-black uppercase text-xs tracking-widest group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* ── LEFT: Image gallery (40%) ──────────────────────────── */}
          <div className="lg:col-span-2 lg:sticky lg:top-24 lg:self-start">
            <ImageGallery
              mainImage={sticker.image}
              title={sticker.Title}
              isTrending={sticker.isTreanding}
            />
          </div>

          {/* ── RIGHT: Product details (60%) ──────────────────────── */}
          <div className="lg:col-span-3 space-y-8">
            {/* Category badge */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-block bg-shop-yellow/10 text-shop-yellow font-black uppercase tracking-widest text-[10px] px-4 py-1.5 rounded-full">
                {sticker.category}
              </span>
              {sticker.isNew && (
                <span className="inline-block bg-blue-50 text-blue-500 font-black uppercase tracking-widest text-[10px] px-4 py-1.5 rounded-full">
                  New Arrival
                </span>
              )}
              {sticker.isTreanding && (
                <span className="inline-block bg-orange-50 text-orange-500 font-black uppercase tracking-widest text-[10px] px-4 py-1.5 rounded-full">
                  Trending
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter text-shop-black leading-none">
              {sticker.Title}
            </h1>

            {/* Rating */}
            {(() => {
              const avgRating =
                reviews.length > 0
                  ? +(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
                  : 4.5;
              const reviewCount = reviews.length > 0 ? reviews.length : 128;
              return (
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex gap-0.5">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-5 h-5",
                          i < Math.round(avgRating)
                            ? "fill-shop-yellow text-shop-yellow"
                            : "fill-shop-yellow/40 text-shop-yellow/40"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-gray-500">
                    {avgRating}/5
                  </span>
                  <span className="text-sm text-gray-400">
                    ({reviewCount} reviews)
                  </span>
                  <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">
                    98% buyers satisfied
                  </span>
                </div>
              );
            })()}

            {/* Main price display */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-4xl md:text-5xl font-black text-shop-black">
                ${sticker.price}
              </span>
              <span className="text-xl text-gray-300 line-through font-bold">
                ${(sticker.price * 1.25).toFixed(2)}
              </span>
              <span className="text-xs font-black text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase tracking-wider">
                Save 20%
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-500 leading-relaxed font-medium max-w-2xl">
              {sticker.description}
            </p>

            {/* Pricing tiers + quantity */}
            <div className="border-t border-gray-100 pt-8">
              <PricingTiers
                basePrice={sticker.price}
                onQuantityChange={handleQuantityChange}
              />
            </div>

            {/* Add to cart — full width */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleAddToCart}
                className="w-full bg-shop-yellow text-white py-5 rounded-full font-black uppercase tracking-widest text-sm hover:bg-shop-black transition-all shadow-xl shadow-shop-yellow/20 flex items-center justify-center gap-3"
              >
                {justAdded ? (
                  <>
                    <Check className="w-5 h-5" />
                    Added {cartQty} {cartQty === 1 ? "unit" : "units"} — $
                    {totalPrice}
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart — {cartQty}{" "}
                    {cartQty === 1 ? "unit" : "units"} · ${totalPrice}
                  </>
                )}
              </button>

              <Link
                href="/cart"
                className="w-full flex items-center justify-center bg-shop-black text-white py-4 rounded-full font-black uppercase tracking-widest text-xs hover:bg-gray-800 transition-all"
              >
                Go to Cart
              </Link>
            </div>

            {/* Key features */}
            <div className="border-t border-gray-100 pt-8">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">
                Key Features
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MOCK_FEATURES.map((feat, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-sm text-gray-600"
                  >
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-shop-yellow shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4 py-6 border-y border-gray-100">
              <div className="flex flex-col items-center text-center gap-2">
                <Truck className="w-6 h-6 text-shop-yellow" />
                <span className="text-[10px] font-black uppercase tracking-widest text-shop-black">
                  Free Shipping
                </span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <ShieldCheck className="w-6 h-6 text-shop-yellow" />
                <span className="text-[10px] font-black uppercase tracking-widest text-shop-black">
                  Secure Payment
                </span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <RotateCcw className="w-6 h-6 text-shop-yellow" />
                <span className="text-[10px] font-black uppercase tracking-widest text-shop-black">
                  Easy Returns
                </span>
              </div>
            </div>

            {/* ── Accordion tabs ──────────────────────────────────── */}
            <div className="space-y-3">
              {TABS.map((tab) => {
                const isOpen = openTab === tab.id;
                const Icon = tab.icon;
                return (
                  <div
                    key={tab.id}
                    className="border border-gray-100 rounded-2xl overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setOpenTab(isOpen ? null : tab.id)
                      }
                      className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-shop-yellow" />
                        <span className="text-sm font-black uppercase tracking-widest text-shop-black">
                          {tab.title}
                        </span>
                      </div>
                      <ChevronDown
                        className={cn(
                          "w-5 h-5 text-gray-400 transition-transform duration-300",
                          isOpen && "rotate-180"
                        )}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 pt-1">
                            {tab.id === "details" && (
                              <div className="space-y-3">
                                {Object.entries(MOCK_SPECS).map(
                                  ([key, val]) => (
                                    <div
                                      key={key}
                                      className="flex justify-between text-sm border-b border-dashed border-gray-100 pb-2"
                                    >
                                      <span className="text-gray-400 font-medium">
                                        {key}
                                      </span>
                                      <span className="text-shop-black font-bold">
                                        {val}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                            {tab.id === "shipping" && (
                              <div className="space-y-3 text-sm text-gray-600">
                                <div className="flex items-start gap-2">
                                  <Package className="w-4 h-4 text-shop-yellow mt-0.5 shrink-0" />
                                  <p>
                                    <strong>Standard Shipping:</strong>{" "}
                                    7–14 business days. Free on orders
                                    of 10+ units.
                                  </p>
                                </div>
                                <div className="flex items-start gap-2">
                                  <Truck className="w-4 h-4 text-shop-yellow mt-0.5 shrink-0" />
                                  <p>
                                    <strong>Express Shipping:</strong>{" "}
                                    3–5 business days. Additional $4.99.
                                  </p>
                                </div>
                                <p className="text-xs text-gray-400">
                                  Orders are processed within 1–2
                                  business days. Tracking number
                                  provided via email.
                                </p>
                              </div>
                            )}
                            {tab.id === "payment" && (
                              <div className="space-y-3 text-sm text-gray-600">
                                <div className="flex items-start gap-2">
                                  <ShieldCheck className="w-4 h-4 text-shop-yellow mt-0.5 shrink-0" />
                                  <p>
                                    <strong>
                                      Secure Checkout:
                                    </strong>{" "}
                                    All transactions are encrypted with
                                    256-bit SSL.
                                  </p>
                                </div>
                                <div className="flex items-start gap-2">
                                  <CreditCard className="w-4 h-4 text-shop-yellow mt-0.5 shrink-0" />
                                  <p>
                                    <strong>
                                      Accepted Methods:
                                    </strong>{" "}
                                    Visa, MasterCard, PayPal, Apple
                                    Pay, Google Pay, Cash on Delivery.
                                  </p>
                                </div>
                                <div className="flex items-start gap-2">
                                  <RotateCcw className="w-4 h-4 text-shop-yellow mt-0.5 shrink-0" />
                                  <p>
                                    <strong>
                                      Money-Back Guarantee:
                                    </strong>{" "}
                                    30-day full refund if you&apos;re
                                    not satisfied.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Related stickers ─────────────────────────────────────── */}
        {relatedStickers.length > 0 && (
          <div className="mt-20 pt-12 border-t border-gray-100">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-shop-black">
                  Related Stickers
                </h2>
                <div className="h-1 w-12 bg-shop-yellow mt-1 rounded-full" />
              </div>
              <Link
                href="/search"
                className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-shop-yellow transition-colors"
              >
                View All
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedStickers.map((s) => (
                <Link key={s.id} href={`/sticker/${s.id}`}>
                  <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 group/related">
                    <div className="aspect-square bg-gray-50 p-4 overflow-hidden">
                      <img
                        src={s.image}
                        alt={s.Title}
                        className="w-full h-full object-contain group-hover/related:scale-110 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="text-sm font-black text-shop-black truncate group-hover/related:text-shop-yellow transition-colors">
                        {s.Title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-shop-black">
                          ${s.price}
                        </span>
                        <span className="text-xs text-gray-300 line-through">
                          ${(s.price * 1.25).toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Phase 2: Reviews ────────────────────────────────────── */}
        <div className="mt-20 pt-12 border-t border-gray-100">
          <ReviewsSection productId={parseInt(id)} />
        </div>

        {/* ── Phase 2: FAQ ────────────────────────────────────────── */}
        <div className="mt-16 pt-12 border-t border-gray-100">
          <FAQAccordion productId={parseInt(id)} />
        </div>

        {/* ── Phase 2: People Also Searched ────────────────────────── */}
        <div className="mt-16 pt-12 border-t border-gray-100 pb-8">
          <PeopleAlsoSearched />
        </div>
      </div>

      {/* ── Mobile sticky add-to-cart ──────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 font-medium truncate">
              {sticker.Title}
            </p>
            <p className="text-lg font-black text-shop-black">
              ${totalPrice}{" "}
              <span className="text-xs font-medium text-gray-400">
                ({cartQty} {cartQty === 1 ? "unit" : "units"})
              </span>
            </p>
          </div>
          <button
            onClick={handleAddToCart}
            className="shrink-0 bg-shop-yellow text-white px-6 py-3 rounded-full font-black uppercase text-xs tracking-widest hover:bg-shop-black transition-all flex items-center gap-2"
          >
            {justAdded ? (
              <>
                <Check className="w-4 h-4" /> Added
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" /> Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
