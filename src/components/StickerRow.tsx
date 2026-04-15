"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Star, Plus, Check } from 'lucide-react';
import { Sticker } from '../data';
import { useCart } from '@/hooks/useCart';
import { cn } from '@/lib/utils';

interface StickerRowProps {
  title: string;
  stickers: Sticker[];
}

export const StickerRow: React.FC<StickerRowProps> = ({ title, stickers }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);
  const [justAddedId, setJustAddedId] = useState<number | null>(null);
  const { addToCart } = useCart();

  const handleQuickAdd = (e: React.MouseEvent, sticker: Sticker) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(Number(sticker.id));
    setJustAddedId(Number(sticker.id));
    setTimeout(() => setJustAddedId((cur) => (cur === Number(sticker.id) ? null : cur)), 1200);
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 0);
      setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth * 0.8 : clientWidth * 0.8;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6 py-8 relative group max-w-7xl mx-auto">
      <div className="flex justify-between items-end px-4 md:px-12">
        <div>
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-shop-black">
            {title}
          </h2>
          <div className="h-1 w-12 bg-shop-yellow mt-1 rounded-full"></div>
        </div>
        <Link href="/search" className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-shop-yellow transition-colors">View All</Link>
      </div>
      
      <div className="relative">
        {showLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-40 bg-white shadow-xl rounded-full p-3 hover:bg-shop-yellow hover:text-white transition-all opacity-0 group-hover:opacity-100 hidden md:block border border-gray-100"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-6 overflow-x-auto hide-scrollbar px-4 md:px-12 scroll-smooth py-4"
        >
          {stickers.map((sticker) => (
            <motion.div
              key={sticker.id}
              whileHover={{ y: -10 }}
              className="flex-none w-[220px] md:w-[280px] bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 group/card"
            >
              <Link href={`/sticker/${sticker.id}`} className="block relative aspect-square bg-gray-50 p-6 overflow-hidden">
                <img
                  src={sticker.image}
                  alt={sticker.Title}
                  className="w-full h-full object-contain group-hover/card:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
              </Link>

              <div className="p-5 space-y-3">
                {/* Row 1 — Title */}
                <Link href={`/sticker/${sticker.id}`} className="block">
                  <h3 className="text-sm font-black text-shop-black leading-snug line-clamp-2 min-h-[2.5rem] hover:text-shop-yellow transition-colors">
                    {sticker.Title}
                  </h3>
                </Link>

                {/* Row 2 — Pricing + sold + discount + add button */}
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-shop-black leading-none">
                    ${sticker.price}
                  </span>
                  <span className="text-xs font-bold text-gray-300 line-through leading-none">
                    ${(sticker.price * 1.2).toFixed(0)}
                  </span>
                  <span className="text-[10px] font-medium text-gray-400 leading-none whitespace-nowrap">
                    {((Number(sticker.id) % 9) + 1) * 100}+ sold
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-wider text-shop-yellow border border-shop-yellow rounded px-1.5 py-0.5 leading-none">
                    -20%
                  </span>
                  <button
                    type="button"
                    aria-label="Add to cart"
                    onClick={(e) => handleQuickAdd(e, sticker)}
                    className="ml-auto shrink-0 w-8 h-8 rounded-full bg-shop-black text-white flex items-center justify-center hover:bg-shop-yellow hover:scale-110 active:scale-95 transition-all shadow-md"
                  >
                    {justAddedId === Number(sticker.id) ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Row 3 — Rating */}
                <div className="flex items-center gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star
                      key={i}
                      className={cn(
                        'w-3 h-3',
                        i < 4
                          ? 'fill-shop-yellow text-shop-yellow'
                          : 'fill-shop-yellow/50 text-shop-yellow/50'
                      )}
                    />
                  ))}
                  <span className="text-[10px] font-bold text-gray-400 ml-1">
                    (287)
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {showRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-40 bg-white shadow-xl rounded-full p-3 hover:bg-shop-yellow hover:text-white transition-all opacity-0 group-hover:opacity-100 hidden md:block border border-gray-100"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
};
