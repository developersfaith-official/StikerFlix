"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowRight, Search, ChevronRight, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useCategories } from "@/hooks/useCategories";

interface CategoryOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CategoryOverlay: React.FC<CategoryOverlayProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const { categories, loading } = useCategories();

  // Reset to first category when opened
  useEffect(() => {
    if (isOpen) {
      setActiveIdx(0);
      setSearchTerm("");
    }
  }, [isOpen]);

  // Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Filter by search
  const filteredCategories = searchTerm.trim()
    ? categories
        .map((c) => ({
          ...c,
          subcategories: c.subcategories.filter((s) =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase())
          ),
        }))
        .filter(
          (c) =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.subcategories.length > 0
        )
    : categories;

  const activeCategory = filteredCategories[activeIdx] ?? filteredCategories[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 -translate-x-1/2 top-24 w-[min(960px,calc(100vw-2rem))] max-h-[min(600px,calc(100vh-8rem))] z-[1001] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with search */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setActiveIdx(0);
                  }}
                  placeholder="Search categories…"
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm text-shop-black placeholder-gray-400 outline-none focus:ring-2 focus:ring-shop-yellow/30 transition-all"
                />
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="p-2 text-gray-400 hover:text-shop-black hover:bg-gray-100 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Two-pane body */}
            <div className="flex-1 grid grid-cols-12 overflow-hidden">
              {/* Left pane — category list */}
              <div className="col-span-5 md:col-span-4 border-r border-gray-100 overflow-y-auto py-2">
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-5 h-5 animate-spin text-shop-yellow" />
                  </div>
                ) : filteredCategories.length === 0 ? (
                  <div className="px-6 py-12 text-center text-sm text-gray-400 font-medium">
                    {categories.length === 0
                      ? "No categories yet. Add them in /admin/categories."
                      : `No categories match "${searchTerm}"`}
                  </div>
                ) : (
                  <ul>
                    {filteredCategories.map((cat, i) => {
                      const isActive = i === activeIdx;
                      return (
                        <li key={cat.name}>
                          <button
                            onMouseEnter={() => setActiveIdx(i)}
                            onFocus={() => setActiveIdx(i)}
                            onClick={() => setActiveIdx(i)}
                            className={cn(
                              "w-full flex items-center justify-between px-5 py-3 text-left transition-colors group",
                              isActive
                                ? "bg-shop-yellow/10 text-shop-black"
                                : "text-gray-600 hover:bg-gray-50"
                            )}
                          >
                            <span
                              className={cn(
                                "text-sm font-black uppercase tracking-tight transition-colors",
                                isActive
                                  ? "text-shop-black"
                                  : "text-gray-600 group-hover:text-shop-black"
                              )}
                            >
                              {cat.name}
                            </span>
                            <ChevronRight
                              className={cn(
                                "w-4 h-4 transition-all",
                                isActive
                                  ? "text-shop-yellow translate-x-0"
                                  : "text-gray-300 -translate-x-1 group-hover:translate-x-0"
                              )}
                            />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Right pane — subcategories */}
              <div className="col-span-7 md:col-span-8 overflow-y-auto p-6 bg-gray-50/50">
                {activeCategory && (
                  <motion.div
                    key={activeCategory.name}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* "View all" header */}
                    <Link
                      href={`/search?category=${activeCategory.name}`}
                      onClick={onClose}
                      className="group flex items-center justify-between p-3 mb-4 rounded-xl bg-shop-black text-white hover:bg-shop-yellow transition-colors"
                    >
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-shop-black/60">
                          Browse All
                        </p>
                        <p className="text-sm font-black uppercase tracking-tight">
                          {activeCategory.name}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    {/* Subcategory grid */}
                    {activeCategory.subcategories.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {activeCategory.subcategories.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/search?category=${activeCategory.name}&sub=${sub.name}`}
                            onClick={onClose}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-white transition-colors group"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-200 group-hover:bg-shop-yellow group-hover:scale-150 transition-all shrink-0" />
                            <span className="text-sm text-gray-600 group-hover:text-shop-black font-bold truncate">
                              {sub.name}
                            </span>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 px-1">
                        No subcategories yet.
                      </p>
                    )}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Footer — quick shortcuts */}
            <div className="px-6 py-3 border-t border-gray-100 bg-white flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <Sparkles className="w-3.5 h-3.5 text-shop-yellow" />
                <Link
                  href="/search?filter=new"
                  onClick={onClose}
                  className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-shop-yellow transition-colors"
                >
                  New Arrivals
                </Link>
                <span className="text-gray-200">·</span>
                <Link
                  href="/search?filter=trending"
                  onClick={onClose}
                  className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-shop-yellow transition-colors"
                >
                  Trending
                </Link>
                <span className="text-gray-200">·</span>
                <Link
                  href="/search?filter=sale"
                  onClick={onClose}
                  className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-shop-yellow transition-colors"
                >
                  Sale
                </Link>
              </div>
              <p className="text-[10px] text-gray-300 uppercase tracking-[0.3em] font-black">
                ESC to close
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
