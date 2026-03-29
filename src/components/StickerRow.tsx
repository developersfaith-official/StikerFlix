import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
    <div className="space-y-2 py-4 relative group">
      <h2 className="text-xl md:text-2xl font-bold px-4 md:px-12 text-white/90">
        {title}
      </h2>
      
      <div className="relative">
        {showLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-40 bg-black/50 hover:bg-black/70 px-2 transition-opacity opacity-0 group-hover:opacity-100 hidden md:block"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-2 overflow-x-auto hide-scrollbar px-4 md:px-12 scroll-smooth"
        >
          {stickers.map((sticker) => (
            <Link
              key={sticker.id}
              to={`/sticker/${sticker.id}`}
              className="flex-none w-[160px] md:w-[280px] aspect-video relative rounded-md overflow-hidden transition-transform duration-300 hover:scale-105 hover:z-10"
            >
              <img
                src={sticker.image}
                alt={sticker.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                <p className="text-sm font-bold truncate">{sticker.title}</p>
                <p className="text-xs text-netflix-red font-semibold">${sticker.price}</p>
              </div>
            </Link>
          ))}
        </div>

        {showRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-40 bg-black/50 hover:bg-black/70 px-2 transition-opacity opacity-0 group-hover:opacity-100 hidden md:block"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        )}
      </div>
    </div>
  );
};
