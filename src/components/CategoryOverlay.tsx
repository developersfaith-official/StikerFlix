"use client";

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight } from 'lucide-react';
import { CATEGORY_MAP } from '../data';
import Link from 'next/link';

interface CategoryOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CategoryOverlay: React.FC<CategoryOverlayProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[1000] bg-white/95 backdrop-blur-3xl overflow-y-auto"
          onClick={onClose}
        >
          <div 
            className="max-w-7xl mx-auto px-6 md:px-12 py-24 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-16">
              <div>
                <h2 className="text-5xl font-black uppercase tracking-tighter text-shop-black">Categories</h2>
                <div className="h-1.5 w-24 bg-shop-yellow mt-2 rounded-full"></div>
              </div>
              <button
                onClick={onClose}
                className="p-4 bg-gray-100 hover:bg-shop-yellow hover:text-white rounded-full transition-all duration-500 group shadow-sm"
              >
                <X className="w-8 h-8 group-hover:rotate-90 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-16 gap-y-20">
              {CATEGORY_MAP.map((category, idx) => (
                <motion.div 
                  key={category.name} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="space-y-8"
                >
                  <Link
                    href={`/search?category=${category.name}`}
                    onClick={onClose}
                    className="group flex items-center justify-between border-b-2 border-gray-100 pb-4 hover:border-shop-yellow transition-colors"
                  >
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-shop-black group-hover:text-shop-yellow transition-colors">
                      {category.name}
                    </h3>
                    <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0 text-shop-yellow" />
                  </Link>

                  {category.subcategories && (
                    <ul className="space-y-4">
                      {category.subcategories.map((sub) => (
                        <li key={sub}>
                          <Link
                            href={`/search?category=${category.name}&sub=${sub}`}
                            onClick={onClose}
                            className="text-gray-400 hover:text-shop-black transition-all duration-300 text-lg font-bold flex items-center gap-2 group/sub"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-200 group-hover/sub:bg-shop-yellow group-hover/sub:scale-150 transition-all"></span>
                            {sub}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="mt-32 pt-16 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex gap-8">
                <Link href="/search" onClick={onClose} className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-shop-yellow transition-colors">New Arrivals</Link>
                <Link href="/search" onClick={onClose} className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-shop-yellow transition-colors">Best Sellers</Link>
                <Link href="/search" onClick={onClose} className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-shop-yellow transition-colors">Sale</Link>
              </div>
              <p className="text-gray-300 text-[10px] uppercase tracking-[0.4em] font-black">
                StickerFlix Premium Collection &copy; 2026
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
