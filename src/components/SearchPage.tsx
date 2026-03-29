import React, { useState, useMemo } from 'react';
import { STICKERS } from '../data';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, SlidersHorizontal, X, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(10);
  const [showOnlyNew, setShowOnlyNew] = useState(false);
  const [showOnlyTrending, setShowOnlyTrending] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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
    <div className="min-h-screen bg-netflix-black pt-24 pb-12 px-4 md:px-12 space-y-8">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-2xl group">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-netflix-red transition-colors" />
          <input
            type="text"
            placeholder="Search stickers by name or description..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white/10 border border-white/10 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-netflix-red/50 focus:bg-white/20 transition-all text-lg"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all",
            isFilterOpen ? "bg-netflix-red text-white" : "bg-white/10 text-white hover:bg-white/20"
          )}
        >
          <SlidersHorizontal className="w-5 h-5" />
          Filters {isFilterOpen ? 'Active' : ''}
        </button>
      </div>

      {/* Filters Panel */}
      {isFilterOpen && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="bg-white/5 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-4 gap-8 border border-white/10"
        >
          {/* Category Filter */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-white/40 uppercase tracking-wider">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-3 py-1 rounded-full text-sm transition-all",
                    selectedCategory === cat ? "bg-white text-black" : "bg-white/10 hover:bg-white/20"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-white/40 uppercase tracking-wider">Max Price: ${maxPrice}</label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseFloat(e.target.value))}
              className="w-full accent-netflix-red"
            />
            <div className="flex justify-between text-xs text-white/40">
              <span>$0</span>
              <span>$10+</span>
            </div>
          </div>

          {/* Status Filters */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-white/40 uppercase tracking-wider">Status</label>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setShowOnlyNew(!showOnlyNew)}
                className="flex items-center gap-3 group"
              >
                <div className={cn(
                  "w-5 h-5 rounded border flex items-center justify-center transition-all",
                  showOnlyNew ? "bg-netflix-red border-netflix-red" : "border-white/20 group-hover:border-white/40"
                )}>
                  {showOnlyNew && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className={cn("text-sm", showOnlyNew ? "text-white" : "text-white/60")}>New Releases</span>
              </button>
              <button
                onClick={() => setShowOnlyTrending(!showOnlyTrending)}
                className="flex items-center gap-3 group"
              >
                <div className={cn(
                  "w-5 h-5 rounded border flex items-center justify-center transition-all",
                  showOnlyTrending ? "bg-netflix-red border-netflix-red" : "border-white/20 group-hover:border-white/40"
                )}>
                  {showOnlyTrending && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className={cn("text-sm", showOnlyTrending ? "text-white" : "text-white/60")}>Trending Now</span>
              </button>
            </div>
          </div>

          {/* Reset */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedCategory('All');
                setMaxPrice(10);
                setShowOnlyNew(false);
                setShowOnlyTrending(false);
                setQuery('');
              }}
              className="text-sm text-netflix-red hover:underline font-bold"
            >
              Reset All Filters
            </button>
          </div>
        </motion.div>
      )}

      {/* Results Grid */}
      <div className="space-y-4">
        <h2 className="text-xl text-white/60">
          {filteredStickers.length} {filteredStickers.length === 1 ? 'result' : 'results'} found
        </h2>
        
        {filteredStickers.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredStickers.map((sticker) => (
              <Link
                key={sticker.id}
                to={`/sticker/${sticker.id}`}
                className="group relative aspect-video rounded-md overflow-hidden bg-white/5 hover:scale-105 transition-all duration-300"
              >
                <img
                  src={sticker.image}
                  alt={sticker.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                  <p className="text-sm font-bold truncate">{sticker.title}</p>
                  <p className="text-xs text-netflix-red font-bold">${sticker.price}</p>
                </div>
                {(sticker.isNew || sticker.isTrending) && (
                  <div className="absolute top-2 left-2 flex gap-1">
                    {sticker.isNew && <span className="bg-netflix-red text-[10px] font-bold px-1.5 py-0.5 rounded">NEW</span>}
                    {sticker.isTrending && <span className="bg-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded">HOT</span>}
                  </div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-4">
            <p className="text-2xl text-white/40">No stickers match your search.</p>
            <button 
              onClick={() => {
                setQuery('');
                setSelectedCategory('All');
                setMaxPrice(10);
                setShowOnlyNew(false);
                setShowOnlyTrending(false);
              }}
              className="bg-white text-black px-6 py-2 rounded font-bold hover:bg-white/80 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
