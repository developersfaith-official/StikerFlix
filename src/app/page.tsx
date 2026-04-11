"use client";
import React, { useEffect, useState } from 'react';
import { getStickers, Sticker, CATEGORY_MAP, BLOG_POSTS } from '@/data';
import { HeroSlider } from '@/components/HeroSlider';
import { StickerRow } from '@/components/StickerRow';
import { CategoriesSection } from '@/components/CategoriesSection';
import { BlogSection } from '@/components/BlogSection';
import { Testimonials } from '@/components/Testimonials';
import { motion } from 'motion/react';

export default function Home() {
  // State management
  const [stickers, setStickers] = useState<Sticker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch data on mount
  useEffect(() => {
    const fetchStickers = async () => {
      try {
        setLoading(true)
        const data = await getStickers()
        console.log('Fetched stickers:', data) // Debug log
        setStickers(data)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch stickers:', err)
        setError('Failed to load stickers')
      } finally {
        setLoading(false)
      }
    }

    fetchStickers()
  }, [])

  // Filter data from fetched stickers
  const trendingStickers = stickers.filter(s => s.isTreanding === true)
  const newStickers = stickers.filter(s => s.isNew === true)
  const categories = Array.from(new Set(stickers.map(s => s.category)))

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-shop-yellow mx-auto"></div>
          <p className="text-lg text-gray-500">Loading stickers...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4 text-red-500">
          <p className="text-lg font-bold">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-shop-yellow text-white rounded-full font-bold"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-20">
      {/* Hero Slider */}
      <HeroSlider stickers={newStickers.slice(0, 3)} />
      
      <div className="space-y-20 pt-20">
        
        {/* Trending Section */}
        <div id="trending">
          {trendingStickers.length > 0 ? (
            <StickerRow title="Deals of the Day" stickers={trendingStickers} />
          ) : (
            <div className="px-4 md:px-12 py-8 text-center text-gray-400">
              No trending stickers available
            </div>
          )}
        </div>

        {/* Promo Section */}
        <div className="px-4 md:px-12">
          <div className="max-w-7xl mx-auto bg-shop-yellow/5 rounded-[40px] p-12 flex flex-col md:flex-row items-center justify-between gap-12 border border-shop-yellow/10">
            <div className="max-w-md">
              <span className="bg-shop-yellow text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block">
                Weekend Discount
              </span>
              <h2 className="text-5xl font-black text-shop-black leading-none mb-6">
                BEST DEALS <br/> <span className="text-shop-yellow">ENDLESS DEALS</span>
              </h2>
              <p className="text-gray-500 mb-8 font-medium">
                Discover the best deals across endless options, offering quality and unbeatable variety daily.
              </p>
              <button className="bg-shop-black text-white px-8 py-4 rounded-full font-black uppercase tracking-widest hover:bg-shop-yellow transition-colors shadow-lg shadow-black/10">
                Explore Deals
              </button>
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

        {/* Categories Section */}
        <div id="explore">
          <CategoriesSection />
        </div>

        {/* New Releases Section */}
        <div id="new">
          {newStickers.length > 0 ? (
            <StickerRow title="New Releases" stickers={newStickers} />
          ) : (
            <div className="px-4 md:px-12 py-8 text-center text-gray-400">
              No new stickers available
            </div>
          )}
        </div>

        {/* Dynamic Category Sections */}
        {categories.length > 0 ? (
          categories.map(cat => {
            const categoryStickers = stickers.filter(s => s.category === cat)
            return categoryStickers.length > 0 ? (
              <div key={cat} id={cat.toLowerCase()}>
                <StickerRow 
                  title={`${cat} Collection`} 
                  stickers={categoryStickers} 
                />
              </div>
            ) : null
          })
        ) : (
          <div className="px-4 md:px-12 py-8 text-center text-gray-400">
            No categories available
          </div>
        )}

        {/* Testimonials */}
        <Testimonials />

        {/* Blog Section */}
        <div id="blog">
          <BlogSection />
        </div>

      </div>
    </div>
  );
}