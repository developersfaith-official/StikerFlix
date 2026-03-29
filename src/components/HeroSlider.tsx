import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Info, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Sticker } from '../data';

interface HeroSliderProps {
  stickers: Sticker[];
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ stickers }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % stickers.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [stickers.length]);

  const current = stickers[currentIndex];

  return (
    <div className="relative h-[70vh] md:h-[85vh] w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <img
            src={current.image}
            alt={current.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-netflix-black via-netflix-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-[15%] left-4 md:left-12 max-w-xl space-y-4">
        <motion.h1
          key={`title-${current.id}`}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl md:text-6xl font-black uppercase tracking-tighter"
        >
          {current.title}
        </motion.h1>
        <motion.p
          key={`desc-${current.id}`}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm md:text-lg text-white/80 line-clamp-3"
        >
          {current.description}
        </motion.p>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-3"
        >
          <Link
            to={`/sticker/${current.id}`}
            className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded font-bold hover:bg-white/80 transition-colors"
          >
            <Play className="fill-black w-5 h-5" /> Order Now
          </Link>
          <Link
            to={`/sticker/${current.id}`}
            className="flex items-center gap-2 bg-netflix-gray/50 text-white px-6 py-2 rounded font-bold hover:bg-netflix-gray/30 transition-colors backdrop-blur-md"
          >
            <Info className="w-5 h-5" /> More Info
          </Link>
        </motion.div>
      </div>
    </div>
  );
};
