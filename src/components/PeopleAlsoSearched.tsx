"use client";

import React from "react";
import Link from "next/link";
import { TrendingUp, Search } from "lucide-react";

const TRENDING_KEYWORDS = [
  "Anime Stickers",
  "Laptop Decals",
  "Waterproof Vinyl",
  "Marvel Stickers",
  "Car Stickers",
  "Custom Logo",
  "Holographic Pack",
  "Kawaii Stickers",
  "Sports Decals",
  "Gaming Stickers",
  "Retro Vintage",
  "Nature & Wildlife",
];

export const PeopleAlsoSearched: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-shop-yellow" />
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-shop-black">
            People Also Searched
          </h2>
        </div>
        <div className="h-1 w-12 bg-shop-yellow mt-2 rounded-full" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {TRENDING_KEYWORDS.map((keyword) => (
          <Link
            key={keyword}
            href={`/search?q=${encodeURIComponent(keyword)}`}
            className="group flex items-center gap-2.5 px-4 py-3 bg-white border border-gray-100 rounded-xl hover:border-shop-yellow hover:bg-shop-yellow/5 transition-all"
          >
            <Search className="w-3.5 h-3.5 text-gray-300 group-hover:text-shop-yellow transition-colors shrink-0" />
            <span className="text-xs font-bold text-gray-600 group-hover:text-shop-black transition-colors truncate">
              {keyword}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};
