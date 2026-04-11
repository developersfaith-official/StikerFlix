'use client'

import { useState, useEffect, use } from 'react'
import { Sticker } from '@/data'
import Link from 'next/link'
import { ChevronLeft, Star, Heart, ShoppingCart } from 'lucide-react'

export default function StickerDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  
  const [sticker, setSticker] = useState<Sticker | null>(null)
  const [relatedStickers, setRelatedStickers] = useState<Sticker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch single sticker
        const response = await fetch(`/api/stickers/${id}`)
        const result = await response.json()

        if (!result.success) {
          setError('Sticker not found')
          setLoading(false)
          return
        }

        const currentSticker = result.data
        setSticker(currentSticker)

        // Fetch all stickers for related items
        const { getStickers } = await import('@/data')
        const allStickers = await getStickers()

        // Filter related stickers (same category, different ID)
        const related = allStickers.filter(
          (s) => s.category === currentSticker.category && s.id !== currentSticker.id
        )

        setRelatedStickers(related.slice(0, 4)) // Show 4 related
        setError(null)
      } catch (err) {
        console.error('Error fetching:', err)
        setError('Failed to load sticker')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-shop-yellow"></div>
      </div>
    )
  }

  if (error || !sticker) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <h1 className="text-3xl font-black text-shop-black">STICKER NOT FOUND</h1>
        <Link
          href="/"
          className="px-6 py-3 bg-shop-yellow text-white rounded-full font-bold hover:bg-shop-black transition-colors"
        >
          GO BACK HOME
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Back Button */}
      <div className="px-4 md:px-12 py-6 border-b border-gray-200">
        <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-shop-yellow transition-colors w-fit">
          <ChevronLeft className="w-5 h-5" />
          <span className="font-bold">Back</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="px-4 md:px-12 py-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image */}
          <div className="flex items-center justify-center bg-gray-50 rounded-[40px] p-8">
            <img
              src={sticker.image}
              alt={sticker.Title}
              className="w-full h-auto max-h-[500px] object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Category */}
            <span className="inline-block px-4 py-2 bg-shop-yellow/10 text-shop-yellow font-bold text-xs uppercase rounded-full">
              {sticker.category}
            </span>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-black text-shop-black">
              {sticker.Title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-shop-yellow text-shop-yellow" />
                ))}
              </div>
              <span className="text-sm font-bold text-gray-500">(128 reviews)</span>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-black text-shop-black">${sticker.price}</span>
                <span className="text-xl text-gray-400 line-through">${(sticker.price * 1.2).toFixed(2)}</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 font-black text-sm rounded-full">
                  SAVE 20%
                </span>
              </div>
              <p className="text-sm text-gray-500">Free shipping included</p>
            </div>

            {/* Description */}
            <div className="border-t border-b border-gray-200 py-6">
              <p className="text-gray-600 leading-relaxed">{sticker.description}</p>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <h3 className="font-black text-shop-black">KEY FEATURES</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-shop-yellow rounded-full"></span>
                  High-quality vinyl
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-shop-yellow rounded-full"></span>
                  Waterproof & scratch-resistant
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-shop-yellow rounded-full"></span>
                  Easy to apply & remove
                </li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="space-y-3 pt-6">
              <button className="w-full bg-shop-yellow text-white py-4 rounded-full font-black uppercase hover:bg-shop-black transition-colors">
                Add to Cart
              </button>
              <button className="w-full bg-white border-2 border-shop-black text-shop-black py-4 rounded-full font-black uppercase hover:bg-shop-black hover:text-white transition-colors">
                Buy Now
              </button>
              <button className="w-full flex items-center justify-center gap-2 p-4 border border-gray-200 rounded-full hover:bg-gray-50">
                <Heart className="w-5 h-5" />
                <span className="font-bold">Save</span>
              </button>
            </div>
          </div>
        </div>

        {/* Related Stickers */}
        {relatedStickers.length > 0 && (
          <div className="mt-20 space-y-6">
            <h2 className="text-3xl font-black text-shop-black">RELATED STICKERS</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedStickers.map((s) => (
                <Link key={s.id} href={`/sticker/${s.id}`}>
                  <div className="bg-white border border-gray-200 rounded-[32px] overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="aspect-square bg-gray-50 p-4 overflow-hidden">
                      <img
                        src={s.image}
                        alt={s.Title}
                        className="w-full h-full object-contain hover:scale-110 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="font-black text-shop-black truncate">{s.Title}</h3>
                      <p className="text-lg font-black text-shop-black">${s.price}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
