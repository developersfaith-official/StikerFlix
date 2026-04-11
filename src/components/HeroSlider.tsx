"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Info, ShoppingCart, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Sticker } from '../data';

interface HeroSliderProps {
  stickers: Sticker[];
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ stickers }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % stickers.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [stickers.length]);

  const current = stickers[currentIndex];

  if (!current) return null;

  return (
    <div className="relative h-[60vh] md:h-[75vh] w-full bg-[#FEF9C3]/30 overflow-hidden">
      <div className="max-w-7xl mx-auto h-full px-4 md:px-12 flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
        <div className="flex-1 space-y-6 text-center md:text-left pt-20 md:pt-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 50, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <span className="bg-shop-yellow text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] mb-6 inline-block shadow-lg shadow-shop-yellow/20">
                Exclusive Collection
              </span>
              <h1 className="text-5xl md:text-7xl font-black text-shop-black leading-[0.9] tracking-tighter mb-6 uppercase">
                {current.Title.split(' ').map((word, i) => (
                  <span key={i} className={i % 2 === 1 ? "text-shop-yellow" : ""}>{word} </span>
                ))}
              </h1>
              <p className="text-gray-500 text-lg font-medium max-w-lg mb-10 leading-relaxed">
                {current.description}
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <Link
                  href={`/sticker/${current.id}`}
                  className="group flex items-center gap-3 bg-shop-black text-white px-8 py-4 rounded-full font-black uppercase text-xs tracking-widest hover:bg-shop-yellow transition-all shadow-xl shadow-black/10"
                >
                  <ShoppingCart className="w-4 h-4" /> Shop Now
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </Link>
                <Link
                  href={`/sticker/${current.id}`}
                  className="flex items-center gap-3 bg-white text-shop-black px-8 py-4 rounded-full font-black uppercase text-xs tracking-widest hover:bg-gray-50 transition-all border border-gray-100"
                >
                  <Info className="w-4 h-4" /> Details
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex-1 relative h-full flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 1.2, opacity: 0, rotate: 10 }}
              transition={{ duration: 0.8, ease: "backOut" }}
              className="relative w-full max-w-lg aspect-square"
            >
              <div className="absolute inset-0 bg-shop-yellow rounded-full blur-[100px] opacity-20 animate-pulse"></div>
              <img
                src={current.image}
                alt={current.Title}
                className="w-full h-full object-contain relative z-10 drop-shadow-[0_35px_35px_rgba(0,0,0,0.25)]"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-shop-yellow/5 to-transparent pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-shop-yellow rounded-full blur-[120px] opacity-10 pointer-events-none"></div>
      
      {/* Slider Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {stickers.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-1.5 transition-all duration-500 rounded-full ${i === currentIndex ? "w-12 bg-shop-yellow" : "w-3 bg-gray-300"}`}
          />
        ))}
      </div>
    </div>
  );
};
