import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Star, ShoppingCart, Plus } from 'lucide-react';
import { Sticker } from '../data';
import { cn } from '../lib/utils';

interface StickerRowProps {
  title: string;
  stickers: Sticker[];
}

export const StickerRow: React.FC<StickerRowProps> = ({ title, stickers }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

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
        <Link to="/search" className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-shop-yellow transition-colors">View All</Link>
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
              <Link to={`/sticker/${sticker.id}`} className="block relative aspect-square bg-gray-50 p-6 overflow-hidden">
                <img
                  src={sticker.image}
                  alt={sticker.title}
                  className="w-full h-full object-contain group-hover/card:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <button className="absolute bottom-4 right-4 w-10 h-10 bg-shop-yellow rounded-full flex items-center justify-center text-white shadow-lg shadow-shop-yellow/30 translate-y-12 group-hover/card:translate-y-0 transition-transform duration-500">
                  <Plus className="w-6 h-6" />
                </button>
              </Link>
              
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-shop-yellow text-shop-yellow" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">4.5 (21k)</span>
                </div>
                
                <Link to={`/sticker/${sticker.id}`} className="block">
                  <h3 className="text-sm font-black text-shop-black truncate hover:text-shop-yellow transition-colors">{sticker.title}</h3>
                </Link>
                
                <div className="flex items-center gap-3">
                  <span className="text-lg font-black text-shop-black">${sticker.price}</span>
                  <span className="text-xs font-bold text-gray-300 line-through">${(sticker.price * 1.2).toFixed(2)}</span>
                  <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">20% OFF</span>
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
