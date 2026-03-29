"use client";

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { STICKERS } from '../data';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search as SearchIcon, SlidersHorizontal, X, Check, Star, Plus, Filter } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

const SearchContent = () => {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [maxPrice, setMaxPrice] = useState<number>(10);
  const [showOnlyNew, setShowOnlyNew] = useState(false);
  const [showOnlyTrending, setShowOnlyTrending] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategory(cat);
      setIsFilterOpen(true);
    }
  }, [searchParams]);

  const categories = useMemo(() => ['All', ...Array.from(new Set(STICKERS.map(s => s.category)))], []);

  const filteredStickers = useMemo(() => {
    return STICKERS.filter(sticker => {
      const matchesQuery = sticker.title.toLowerCase().includes(query.toLowerCase()) || 
                           sticker.description.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || sticker.category === selectedCategory;
      const matchesPrice = sticker.price <= maxPrice;
      const matchesNew = !showOnlyNew || sticker.isNew;
      const matchesTrending = !showOnlyTrending || sticker.isTrending;

      return matchesQuery && matchesCategory && matchesPrice && matchesNew && matchesTrending;
    });
  }, [query, selectedCategory, maxPrice, showOnlyNew, showOnlyTrending]);

  return (
    <div className="min-h-screen bg-cream pt-12 md:pt-20 pb-20 px-4 md:px-12">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Search Header */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="relative w-full md:max-w-3xl group">
            <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-shop-yellow transition-colors" />
            <input
              type="text"
              placeholder="Search premium stickers..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-full py-5 pl-16 pr-6 focus:outline-none focus:ring-4 focus:ring-shop-yellow/10 focus:border-shop-yellow transition-all text-xl font-medium shadow-xl shadow-black/5"
            />
            {query && (
              <button 
                onClick={() => setQuery('')}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-shop-black"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>

          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={cn(
              "flex items-center gap-3 px-8 py-5 rounded-full font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-black/5",
              isFilterOpen ? "bg-shop-yellow text-white" : "bg-white text-shop-black hover:bg-gray-50"
            )}
          >
            <Filter className="w-5 h-5" />
            Filters {isFilterOpen ? 'Active' : ''}
          </button>
        </div>

        <div className="grid lg:grid-cols-4 gap-12 items-start">
          {/* Filters Panel */}
          {isFilterOpen && (
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="lg:col-span-1 space-y-10 bg-white p-8 rounded-[40px] shadow-2xl shadow-black/5 border border-gray-100"
            >
              {/* Category Filter */}
              <div className="space-y-6">
                <label className="text-xs font-black text-shop-black uppercase tracking-[0.2em]">Category</label>
                <div className="flex flex-col gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        "text-left px-4 py-3 rounded-2xl text-sm font-bold transition-all flex items-center justify-between group",
                        selectedCategory === cat ? "bg-shop-yellow text-white" : "text-gray-400 hover:bg-gray-50 hover:text-shop-black"
                      )}
                    >
                      {cat}
                      {selectedCategory === cat && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <label className="text-xs font-black text-shop-black uppercase tracking-[0.2em]">Max Price</label>
                  <span className="text-lg font-black text-shop-yellow">${maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-shop-yellow"
                />
                <div className="flex justify-between text-[10px] font-black text-gray-300 uppercase tracking-widest">
                  <span>$0</span>
                  <span>$10+</span>
                </div>
              </div>

              {/* Status Filters */}
              <div className="space-y-6">
                <label className="text-xs font-black text-shop-black uppercase tracking-[0.2em]">Status</label>
                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => setShowOnlyNew(!showOnlyNew)}
                    className="flex items-center gap-4 group"
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                      showOnlyNew ? "bg-shop-yellow border-shop-yellow" : "border-gray-100 group-hover:border-gray-300"
                    )}>
                      {showOnlyNew && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <span className={cn("text-sm font-bold uppercase tracking-widest", showOnlyNew ? "text-shop-black" : "text-gray-400")}>New Releases</span>
                  </button>
                  <button
                    onClick={() => setShowOnlyTrending(!showOnlyTrending)}
                    className="flex items-center gap-4 group"
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                      showOnlyTrending ? "bg-shop-yellow border-shop-yellow" : "border-gray-100 group-hover:border-gray-300"
                    )}>
                      {showOnlyTrending && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <span className={cn("text-sm font-bold uppercase tracking-widest", showOnlyTrending ? "text-shop-black" : "text-gray-400")}>Trending Now</span>
                  </button>
                </div>
              </div>

              {/* Reset */}
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setMaxPrice(10);
                  setShowOnlyNew(false);
                  setShowOnlyTrending(false);
                  setQuery('');
                }}
                className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-100 text-xs font-black uppercase tracking-widest text-gray-300 hover:border-shop-yellow hover:text-shop-yellow transition-all"
              >
                Reset All Filters
              </button>
            </motion.div>
          )}

          {/* Results Grid */}
          <div className={cn("space-y-8", isFilterOpen ? "lg:col-span-3" : "lg:col-span-4")}>
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">
                {filteredStickers.length} {filteredStickers.length === 1 ? 'result' : 'results'} found
              </h2>
              <div className="flex gap-2">
                <button className="p-2 bg-white rounded-lg border border-gray-100 text-shop-black hover:bg-gray-50 transition-colors">
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {filteredStickers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredStickers.map((sticker) => (
                  <motion.div
                    key={sticker.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -10 }}
                    className="bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 group/card"
                  >
                    <Link href={`/sticker/${sticker.id}`} className="block relative aspect-square bg-gray-50 p-6 overflow-hidden">
                      <img
                        src={sticker.image}
                        alt={sticker.title}
                        className="w-full h-full object-contain group-hover/card:scale-110 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <button className="absolute bottom-4 right-4 w-10 h-10 bg-shop-yellow rounded-full flex items-center justify-center text-white shadow-lg shadow-shop-yellow/30 translate-y-12 group-hover/card:translate-y-0 transition-transform duration-500">
                        <Plus className="w-6 h-6" />
                      </button>
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {sticker.isNew && <span className="bg-shop-yellow text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest">NEW</span>}
                        {sticker.isTrending && <span className="bg-shop-black text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest">HOT</span>}
                      </div>
                    </Link>
                    
                    <div className="p-6 space-y-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-shop-yellow text-shop-yellow" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">4.5 (21k)</span>
                      </div>
                      
                      <Link href={`/sticker/${sticker.id}`} className="block">
                        <h3 className="text-sm font-black text-shop-black truncate hover:text-shop-yellow transition-colors">{sticker.title}</h3>
                      </Link>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-black text-shop-black">${sticker.price}</span>
                        <span className="text-xs font-bold text-gray-300 line-through">${(sticker.price * 1.2).toFixed(2)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-32 text-center space-y-8 bg-white rounded-[48px] border-2 border-dashed border-gray-100">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                  <SearchIcon className="w-10 h-10 text-gray-200" />
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-black uppercase tracking-tighter text-shop-black">No stickers match your search</p>
                  <p className="text-gray-400 font-medium">Try adjusting your filters or search query.</p>
                </div>
                <button 
                  onClick={() => {
                    setQuery('');
                    setSelectedCategory('All');
                    setMaxPrice(10);
                    setShowOnlyNew(false);
                    setShowOnlyTrending(false);
                  }}
                  className="bg-shop-yellow text-white px-10 py-4 rounded-full font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-xl shadow-shop-yellow/20"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const SearchPage = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
};
