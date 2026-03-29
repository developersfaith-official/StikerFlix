"use client";

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { STICKERS } from '../data';
import { MessageCircle, Star, ArrowLeft, Heart, Share2, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { WHATSAPP_PHONE_NUMBER, WHATSAPP_MESSAGE_TEMPLATE } from '../constants';
import { cn } from '../lib/utils';
import { StickerRow } from './StickerRow';

export const StickerDetail: React.FC = () => {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const sticker = STICKERS.find((s) => s.id === id);

  const relatedStickers = STICKERS.filter(
    (s) => s.category === sticker?.category && s.id !== sticker?.id
  );

  if (!sticker) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-4 bg-cream">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-shop-black">Sticker not found</h1>
        <Link href="/" className="text-shop-yellow font-bold uppercase tracking-widest hover:underline">Go back home</Link>
      </div>
    );
  }

  const handleWhatsAppOrder = () => {
    const message = WHATSAPP_MESSAGE_TEMPLATE
      .replace('{title}', sticker.title)
      .replace('{price}', sticker.price.toString());
    const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-cream pt-12 md:pt-20 pb-20 px-4 md:px-12">
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-shop-black mb-12 transition-all font-black uppercase text-xs tracking-widest group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Collection
        </button>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[48px] p-12 shadow-2xl shadow-black/5 border border-gray-100 relative group"
          >
            <div className="absolute top-8 right-8 flex flex-col gap-4">
              <button className="p-3 bg-gray-50 hover:bg-shop-yellow hover:text-white rounded-full transition-all shadow-sm">
                <Heart className="w-5 h-5" />
              </button>
              <button className="p-3 bg-gray-50 hover:bg-shop-yellow hover:text-white rounded-full transition-all shadow-sm">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
            <img
              src={sticker.image}
              alt={sticker.title}
              className="w-full aspect-square object-contain group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
          </motion.div>

          <div className="space-y-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="bg-shop-yellow text-white font-black uppercase tracking-widest text-[10px] px-4 py-1.5 rounded-full">
                  {sticker.category}
                </span>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-shop-yellow text-shop-yellow" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">4.8 (120 Reviews)</span>
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-shop-black leading-none">{sticker.title}</h1>
              <div className="flex items-center gap-4">
                <p className="text-4xl font-black text-shop-black">${sticker.price}</p>
                <p className="text-xl font-bold text-gray-300 line-through">${(sticker.price * 1.2).toFixed(2)}</p>
                <span className="text-xs font-black text-green-500 uppercase tracking-widest bg-green-50 px-3 py-1 rounded-full">Save 20%</span>
              </div>
            </div>

            <p className="text-gray-500 text-lg font-medium leading-relaxed max-w-xl">
              {sticker.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handleWhatsAppOrder}
                className="flex items-center justify-center gap-3 bg-[#25D366] text-white px-8 py-5 rounded-full font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-xl shadow-green-500/20"
              >
                <MessageCircle className="w-5 h-5" /> Order via WhatsApp
              </button>
              <button
                className="flex items-center justify-center gap-3 bg-shop-black text-white px-8 py-5 rounded-full font-black uppercase text-xs tracking-widest hover:bg-shop-yellow transition-all shadow-xl shadow-black/10"
              >
                Add to Cart
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6 py-8 border-y border-gray-100">
              <div className="flex flex-col items-center text-center gap-2">
                <Truck className="w-6 h-6 text-shop-yellow" />
                <span className="text-[10px] font-black uppercase tracking-widest text-shop-black">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <ShieldCheck className="w-6 h-6 text-shop-yellow" />
                <span className="text-[10px] font-black uppercase tracking-widest text-shop-black">Secure Payment</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <RotateCcw className="w-6 h-6 text-shop-yellow" />
                <span className="text-[10px] font-black uppercase tracking-widest text-shop-black">Easy Returns</span>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-shop-black">Customer Remarks</h3>
                  <div className="h-1 w-12 bg-shop-yellow mt-1 rounded-full"></div>
                </div>
                <button className="text-[10px] font-black uppercase tracking-widest text-shop-yellow hover:underline">Write a Review</button>
              </div>
              
              {sticker.remarks.length > 0 ? (
                <div className="grid gap-4">
                  {sticker.remarks.map((remark, idx) => (
                    <motion.div 
                      key={idx} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-shop-yellow/10 flex items-center justify-center text-shop-yellow font-black uppercase">
                            {remark.user.charAt(0)}
                          </div>
                          <span className="font-black text-shop-black uppercase text-xs tracking-widest">{remark.user}</span>
                        </div>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "w-3 h-3",
                                i < remark.rating ? "fill-shop-yellow text-shop-yellow" : "text-gray-200"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-500 font-medium italic leading-relaxed">"{remark.comment}"</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-center">
                  <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">No remarks yet. Be the first to order!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Stickers */}
        {relatedStickers.length > 0 && (
          <div className="mt-40 border-t border-gray-100 pt-20">
            <StickerRow title="More Like This" stickers={relatedStickers} />
          </div>
        )}
      </div>
    </div>
  );
};
