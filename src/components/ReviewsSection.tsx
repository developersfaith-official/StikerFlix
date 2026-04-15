"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  BadgeCheck,
  MessageSquareText,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Review } from "@/data";

interface ReviewsSectionProps {
  productId: number;
}

const INITIAL_SHOW = 5;

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  productId,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCount, setShowCount] = useState(INITIAL_SHOW);
  const [votedHelpful, setVotedHelpful] = useState<Set<number>>(new Set());
  const [votedUnhelpful, setVotedUnhelpful] = useState<Set<number>>(new Set());

  useEffect(() => {
    let mounted = true;
    fetch(`/api/reviews?productId=${productId}`)
      .then((r) => r.json())
      .then((res) => {
        if (mounted && res.success) setReviews(res.data);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [productId]);

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return +(
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    ).toFixed(1);
  }, [reviews]);

  const ratingDistribution = useMemo(() => {
    const dist = [0, 0, 0, 0, 0]; // 1-star to 5-star
    reviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1]++;
    });
    return dist;
  }, [reviews]);

  const handleHelpful = (reviewId: number) => {
    if (votedHelpful.has(reviewId)) return;
    setVotedHelpful((prev) => new Set(prev).add(reviewId));
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId ? { ...r, helpful_count: r.helpful_count + 1 } : r
      )
    );
  };

  const handleUnhelpful = (reviewId: number) => {
    if (votedUnhelpful.has(reviewId)) return;
    setVotedUnhelpful((prev) => new Set(prev).add(reviewId));
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? { ...r, unhelpful_count: r.unhelpful_count + 1 }
          : r
      )
    );
  };

  const visibleReviews = reviews.slice(0, showCount);
  const hasMore = showCount < reviews.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-shop-yellow" />
      </div>
    );
  }

  if (reviews.length === 0) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <MessageSquareText className="w-6 h-6 text-shop-yellow" />
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-shop-black">
            Customer Reviews
          </h2>
        </div>
        <div className="h-1 w-12 bg-shop-yellow mt-2 rounded-full" />
      </div>

      {/* Summary bar */}
      <div className="bg-gray-50 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start md:items-center">
        {/* Left: big number */}
        <div className="text-center md:text-left shrink-0">
          <p className="text-5xl font-black text-shop-black">{avgRating}</p>
          <div className="flex gap-0.5 mt-2 justify-center md:justify-start">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star
                key={i}
                className={cn(
                  "w-4 h-4",
                  i < Math.round(avgRating)
                    ? "fill-shop-yellow text-shop-yellow"
                    : "fill-gray-200 text-gray-200"
                )}
              />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1 font-medium">
            {reviews.length} reviews
          </p>
        </div>

        {/* Right: distribution bars */}
        <div className="flex-1 w-full space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingDistribution[star - 1];
            const pct =
              reviews.length > 0
                ? Math.round((count / reviews.length) * 100)
                : 0;
            return (
              <div key={star} className="flex items-center gap-3 text-sm">
                <span className="text-xs font-bold text-gray-400 w-4 text-right">
                  {star}
                </span>
                <Star className="w-3 h-3 fill-shop-yellow text-shop-yellow shrink-0" />
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-shop-yellow rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-gray-400 w-8">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review cards */}
      <div className="space-y-4">
        {visibleReviews.map((review) => (
          <div
            key={review.id}
            className="bg-white border border-gray-100 rounded-2xl p-5 md:p-6 space-y-4"
          >
            {/* Top row: author + rating + date */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-shop-yellow/10 flex items-center justify-center text-shop-yellow font-black uppercase text-sm">
                  {review.author_name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-shop-black">
                      {review.author_name}
                    </span>
                    {review.verified_purchase && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        <BadgeCheck className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex gap-0.5 mt-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-3 h-3",
                          i < review.rating
                            ? "fill-shop-yellow text-shop-yellow"
                            : "fill-gray-200 text-gray-200"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-gray-400 font-medium">
                {new Date(review.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            {/* Title + text */}
            {review.title && (
              <h4 className="text-sm font-black text-shop-black">
                {review.title}
              </h4>
            )}
            <p className="text-sm text-gray-500 leading-relaxed">
              {review.text}
            </p>

            {/* Helpful / unhelpful */}
            <div className="flex items-center gap-4 pt-2 border-t border-gray-50">
              <span className="text-[10px] text-gray-400 font-medium">
                Was this helpful?
              </span>
              <button
                onClick={() => handleHelpful(review.id)}
                disabled={votedHelpful.has(review.id)}
                className={cn(
                  "flex items-center gap-1 text-xs font-bold transition-colors",
                  votedHelpful.has(review.id)
                    ? "text-shop-yellow"
                    : "text-gray-400 hover:text-shop-yellow"
                )}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                {review.helpful_count}
              </button>
              <button
                onClick={() => handleUnhelpful(review.id)}
                disabled={votedUnhelpful.has(review.id)}
                className={cn(
                  "flex items-center gap-1 text-xs font-bold transition-colors",
                  votedUnhelpful.has(review.id)
                    ? "text-red-400"
                    : "text-gray-400 hover:text-red-400"
                )}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                {review.unhelpful_count}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <button
          onClick={() => setShowCount((c) => c + 5)}
          className="w-full flex items-center justify-center gap-2 py-4 border border-gray-200 rounded-2xl text-sm font-black uppercase tracking-widest text-gray-500 hover:border-shop-yellow hover:text-shop-yellow transition-colors"
        >
          <ChevronDown className="w-4 h-4" />
          Load More Reviews ({reviews.length - showCount} remaining)
        </button>
      )}
    </div>
  );
};
