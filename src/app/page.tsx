"use client";

import React from 'react';
import { STICKERS } from '@/data';
import { HeroSlider } from '@/components/HeroSlider';
import { StickerRow } from '@/components/StickerRow';
import { CategoriesSection } from '@/components/CategoriesSection';
import { BlogSection } from '@/components/BlogSection';
import { Testimonials } from '@/components/Testimonials';
import { motion } from 'motion/react';

export default function Home() {
  const trendingStickers = STICKERS.filter(s => s.isTrending);
  const newStickers = STICKERS.filter(s => s.isNew);
  const categories = Array.from(new Set(STICKERS.map(s => s.category)));

  return (
    <div className="pb-20">
      <HeroSlider stickers={newStickers.slice(0, 3)} />
      
      <div className="space-y-20 pt-20">
        <div id="trending">
          <StickerRow title="Deals of the Day" stickers={trendingStickers} />
        </div>

        <div className="px-4 md:px-12">
          <div className="max-w-7xl mx-auto bg-shop-yellow/5 rounded-[40px] p-12 flex flex-col md:flex-row items-center justify-between gap-12 border border-shop-yellow/10">
            <div className="max-w-md">
              <span className="bg-shop-yellow text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block">Weekend Discount</span>
              <h2 className="text-5xl font-black text-shop-black leading-none mb-6">BEST DEALS <br/> <span className="text-shop-yellow">ENDLESS DEALS</span></h2>
              <p className="text-gray-500 mb-8 font-medium">Discover the best deals across endless options, offering quality and unbeatable variety daily.</p>
              <button className="bg-shop-black text-white px-8 py-4 rounded-full font-black uppercase tracking-widest hover:bg-shop-yellow transition-colors shadow-lg shadow-black/10">Explore Deals</button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-shop-yellow rounded-full blur-3xl opacity-20"></div>
              <img 
                src="https://picsum.photos/seed/sticker-pack/600/600" 
                alt="Promo" 
                className="relative w-full max-w-sm rounded-3xl shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>

        <div id="explore">
          <CategoriesSection />
        </div>

        <div id="new">
          <StickerRow title="New Releases" stickers={newStickers} />
        </div>
        
        {categories.map(cat => (
          <div key={cat} id={cat.toLowerCase()}>
            <StickerRow 
              title={`${cat} Collection`} 
              stickers={STICKERS.filter(s => s.category === cat)} 
            />
          </div>
        ))}

        <Testimonials />

        <div id="blog">
          <BlogSection />
        </div>
      </div>
    </div>
  );
}
