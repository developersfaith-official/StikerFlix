"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBasket, Instagram, Youtube, Share2, MessageCircle } from 'lucide-react';

export const Footer = () => {
  const pathname = usePathname();
  // Hide on admin + auth pages
  if (
    pathname?.startsWith('/admin') ||
    pathname === '/login' ||
    pathname === '/signup'
  ) {
    return null;
  }
  return (
    <footer className="bg-white border-t border-gray-100 py-12 md:py-20 px-4 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 mb-16">
        <div className="space-y-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-shop-yellow rounded-lg flex items-center justify-center">
              <ShoppingBasket className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase text-shop-black">
              Sticker<span className="text-shop-yellow">Flix</span>
            </span>
          </Link>
          <p className="text-gray-500 text-sm leading-relaxed">The ultimate destination for premium stickers. Express yourself with our unique collection of high-quality vinyl stickers for every surface.</p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:bg-shop-yellow hover:text-white transition-all"><Instagram className="w-5 h-5" /></a>
            <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:bg-shop-yellow hover:text-white transition-all"><Youtube className="w-5 h-5" /></a>
            <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:bg-shop-yellow hover:text-white transition-all"><Share2 className="w-5 h-5" /></a>
            <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:bg-shop-yellow hover:text-white transition-all"><MessageCircle className="w-5 h-5" /></a>
          </div>
        </div>

        <div>
          <h4 className="text-shop-black font-black uppercase text-xs tracking-widest mb-8">Quick Links</h4>
          <ul className="space-y-4 text-sm font-bold text-gray-400">
            <li><Link href="/" className="hover:text-shop-yellow transition-colors">Home</Link></li>
            <li><Link href="/search" className="hover:text-shop-yellow transition-colors">Search Stickers</Link></li>
            <li><Link href="/#trending" className="hover:text-shop-yellow transition-colors">Trending Now</Link></li>
            <li><Link href="/#blog" className="hover:text-shop-yellow transition-colors">Our Blog</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-shop-black font-black uppercase text-xs tracking-widest mb-8">Customer Care</h4>
          <ul className="space-y-4 text-sm font-bold text-gray-400">
            <li><a href="#" className="hover:text-shop-yellow transition-colors">Track Order</a></li>
            <li><a href="#" className="hover:text-shop-yellow transition-colors">Shipping Policy</a></li>
            <li><a href="#" className="hover:text-shop-yellow transition-colors">Returns & Refunds</a></li>
            <li><a href="#" className="hover:text-shop-yellow transition-colors">FAQs</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-shop-black font-black uppercase text-xs tracking-widest mb-8">Newsletter</h4>
          <p className="text-gray-500 text-sm mb-6">Subscribe to get special offers and once-in-a-lifetime deals.</p>
          <div className="flex gap-2">
            <input type="email" placeholder="Email Address" className="bg-gray-100 border-none rounded-lg px-4 py-2 text-sm flex-1 focus:ring-2 focus:ring-shop-yellow/20" />
            <button className="bg-shop-yellow text-white px-4 py-2 rounded-lg font-black uppercase text-[10px] tracking-widest">Join</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        <p>&copy; 2026 StickerFlix. All rights reserved.</p>
        <div className="flex gap-8">
          <a href="#" className="hover:text-shop-yellow transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-shop-yellow transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};
