"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart3,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SEOKeywords } from "@/data";

type SortField = "keyword" | "search_volume" | "difficulty";
type SortDir = "asc" | "desc";

export const RankingKeywords: React.FC = () => {
  const [keywords, setKeywords] = useState<SEOKeywords[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>("search_volume");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    let mounted = true;
    fetch("/api/keywords")
      .then((r) => r.json())
      .then((res) => {
        if (mounted && res.success) setKeywords(res.data);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const sorted = useMemo(() => {
    return [...keywords]
      .sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortDir === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        return sortDir === "asc"
          ? (aVal as number) - (bVal as number)
          : (bVal as number) - (aVal as number);
      })
      .slice(0, 20);
  }, [keywords, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const getDifficultyColor = (d: number) => {
    if (d <= 30) return "text-green-600 bg-green-50";
    if (d <= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getDifficultyLabel = (d: number) => {
    if (d <= 30) return "Easy";
    if (d <= 60) return "Medium";
    return "Hard";
  };

  const SortIcon = ({
    field,
  }: {
    field: SortField;
  }) => {
    if (sortField !== field)
      return <ArrowUpDown className="w-3 h-3 text-gray-300" />;
    return sortDir === "asc" ? (
      <ArrowUp className="w-3 h-3 text-shop-yellow" />
    ) : (
      <ArrowDown className="w-3 h-3 text-shop-yellow" />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-shop-yellow" />
      </div>
    );
  }

  if (keywords.length === 0) return null;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-shop-yellow" />
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-shop-black">
            Ranking Keywords
          </h2>
        </div>
        <div className="h-1 w-12 bg-shop-yellow mt-2 rounded-full" />
      </div>

      {/* Table */}
      <div className="border border-gray-100 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 bg-gray-50 px-4 md:px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
          <button
            onClick={() => toggleSort("keyword")}
            className="col-span-5 md:col-span-5 flex items-center gap-1 hover:text-shop-black transition-colors"
          >
            Keyword <SortIcon field="keyword" />
          </button>
          <span className="col-span-3 md:col-span-3 hidden md:flex items-center">
            Category
          </span>
          <button
            onClick={() => toggleSort("search_volume")}
            className="col-span-4 md:col-span-2 flex items-center gap-1 hover:text-shop-black transition-colors justify-end md:justify-start"
          >
            Volume <SortIcon field="search_volume" />
          </button>
          <button
            onClick={() => toggleSort("difficulty")}
            className="col-span-3 md:col-span-2 flex items-center gap-1 hover:text-shop-black transition-colors justify-end"
          >
            Difficulty <SortIcon field="difficulty" />
          </button>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-50">
          {sorted.map((kw, i) => (
            <div
              key={kw.id}
              className={cn(
                "grid grid-cols-12 px-4 md:px-6 py-3 items-center text-sm transition-colors",
                i % 2 === 0 ? "bg-white" : "bg-gray-50/30"
              )}
            >
              <div className="col-span-5 md:col-span-5 flex items-center gap-2 min-w-0">
                <span className="text-[10px] font-bold text-gray-300 w-5 shrink-0">
                  {i + 1}
                </span>
                <span className="font-bold text-shop-black truncate text-xs md:text-sm">
                  {kw.keyword}
                </span>
              </div>
              <span className="col-span-3 md:col-span-3 hidden md:block text-xs text-gray-400 truncate">
                {kw.category}
              </span>
              <div className="col-span-4 md:col-span-2 text-right md:text-left">
                <span className="text-xs font-bold text-shop-black">
                  {kw.search_volume.toLocaleString()}
                </span>
              </div>
              <div className="col-span-3 md:col-span-2 flex justify-end">
                <span
                  className={cn(
                    "text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider",
                    getDifficultyColor(kw.difficulty)
                  )}
                >
                  {getDifficultyLabel(kw.difficulty)} ({kw.difficulty})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
