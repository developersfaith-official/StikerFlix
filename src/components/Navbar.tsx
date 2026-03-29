"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Bell, User, Menu, X, ShoppingBasket, ChevronDown, Phone, MessageCircle, MapPin, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { CategoryOverlay } from './CategoryOverlay';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [pinnedCount, setPinnedCount] = useState(3);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Categories', isSpecial: true },
    { name: 'Trend', path: '/#trending' },
    { name: 'New Release', path: '/#new' },
    { name: 'Blog', path: '/#blog' },
  ];

  return (
    <>
      <nav className="w-full sticky top-0 z-[999] bg-white shadow-md">
        {/* Top Bar - Hidden on small mobile */}
        <div className="hidden sm:flex bg-gray-50 border-b border-gray-100 px-4 md:px-12 py-2 justify-between items-center text-[10px] md:text-[11px] font-medium text-gray-500 uppercase tracking-wider">
          <div className="flex gap-4 md:gap-6">
            <span className="flex items-center gap-1.5 hover:text-shop-yellow cursor-pointer transition-colors">
              <Phone className="w-3 h-3" /> Sell With Us
            </span>
            <span className="flex items-center gap-1.5 hover:text-shop-yellow cursor-pointer transition-colors">
              <MessageCircle className="w-3 h-3" /> Contact Us
            </span>
          </div>
          <div className="hidden md:flex gap-6">
            <span className="hover:text-shop-yellow cursor-pointer transition-colors">Sports & More</span>
            <span className="hover:text-shop-yellow cursor-pointer transition-colors">Essentials</span>
            <span className="hover:text-shop-yellow cursor-pointer transition-colors">Offers</span>
            <span className="hover:text-shop-yellow cursor-pointer transition-colors">Global Shopping</span>
          </div>
        </div>

        {/* Middle Bar */}
        <div className="px-4 md:px-12 py-3 md:py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 md:gap-8 flex-1">
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-shop-yellow rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
                <ShoppingBasket className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <span className="text-xl md:text-2xl font-black tracking-tighter uppercase text-shop-black">
                Sticker<span className="text-shop-yellow">Flix</span>
              </span>
            </Link>

            <div className="hidden md:flex flex-1 max-w-xl relative group">
              <input 
                type="text" 
                placeholder="Search all stickers..." 
                className="w-full bg-gray-100 border-none rounded-full px-6 py-2.5 text-sm focus:ring-2 focus:ring-shop-yellow/20 transition-all"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-shop-yellow transition-colors" />
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-8">
            <div className="hidden lg:flex items-center gap-6 text-gray-600">
              <div className="flex flex-col items-center gap-0.5 cursor-pointer hover:text-shop-yellow transition-colors group">
                <MapPin className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold uppercase">Track</span>
              </div>
              <div className="flex flex-col items-center gap-0.5 cursor-pointer hover:text-shop-yellow transition-colors group">
                <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold uppercase">Alerts</span>
              </div>
              <div className="flex flex-col items-center gap-0.5 cursor-pointer hover:text-shop-yellow transition-colors group">
                <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold uppercase">Wishlist</span>
              </div>
            </div>

            <div className="flex items-center gap-3 md:gap-4">
              <button className="relative group p-2 bg-gray-100 rounded-full hover:bg-shop-yellow transition-all">
                <ShoppingBasket className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                {pinnedCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-shop-yellow text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                    {pinnedCount}
                  </span>
                )}
              </button>

              <button className="hidden sm:flex items-center gap-2 font-bold text-sm text-shop-black hover:text-shop-yellow transition-colors">
                <User className="w-5 h-5" /> <span className="hidden md:inline">Sign In</span>
              </button>

              <button 
                className="lg:hidden p-2 text-shop-black"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar / Nav Links - Hidden on mobile */}
        <div className="hidden lg:flex px-4 md:px-12 py-3 border-t border-gray-100 justify-center gap-10">
          {navLinks.map((link) => (
            link.isSpecial ? (
              <button
                key={link.name}
                onClick={() => setIsCategoriesOpen(true)}
                className="text-xs font-black text-gray-600 hover:text-shop-yellow transition-colors flex items-center gap-1.5 uppercase tracking-widest group"
              >
                {link.name}
                <ChevronDown className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-300" />
              </button>
            ) : (
              <Link 
                key={link.name}
                href={link.path!} 
                className="text-xs font-black text-gray-600 hover:text-shop-yellow transition-colors uppercase tracking-widest"
              >
                {link.name}
              </Link>
            )
          ))}
        </div>

        {/* Mobile Search - Only on mobile */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative group">
            <input 
              type="text" 
              placeholder="Search stickers..." 
              className="w-full bg-gray-100 border-none rounded-full px-6 py-2 text-sm focus:ring-2 focus:ring-shop-yellow/20 transition-all"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-shop-yellow transition-colors" />
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              className="fixed inset-0 z-[110] bg-white flex flex-col p-8 lg:hidden"
            >
              <div className="flex justify-between items-center mb-12">
                <span className="text-shop-black text-2xl font-black uppercase tracking-tighter">
                  Sticker<span className="text-shop-yellow">Flix</span>
                </span>
                <X className="w-8 h-8 text-shop-black" onClick={() => setIsMobileMenuOpen(false)} />
              </div>
              
              <div className="flex flex-col gap-8 text-xl font-black uppercase tracking-tighter text-shop-black">
                {navLinks.map((link) => (
                  link.isSpecial ? (
                    <button
                      key={link.name}
                      onClick={() => { setIsMobileMenuOpen(false); setIsCategoriesOpen(true); }}
                      className="text-left hover:text-shop-yellow transition-colors"
                    >
                      {link.name}
                    </button>
                  ) : (
                    <Link 
                      key={link.name}
                      href={link.path!} 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="hover:text-shop-yellow transition-colors"
                    >
                      {link.name}
                    </Link>
                  )
                ))}
              </div>

              <div className="mt-auto pt-8 border-t border-gray-100 flex flex-col gap-4">
                <button className="bg-shop-yellow text-white font-black py-4 rounded-xl uppercase tracking-widest shadow-lg shadow-shop-yellow/20">
                  Sign In
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <CategoryOverlay 
        isOpen={isCategoriesOpen} 
        onClose={() => setIsCategoriesOpen(false)} 
      />
    </>
  );
};
