"use client";

import React from 'react';
import { motion } from 'motion/react';
import { Star, Quote } from 'lucide-react';

export const Testimonials = () => {
  const testimonials = [
    {
      name: "William Hope",
      role: "Senior Designer at IT Studio",
      text: "This product exceeded my expectations! Remarkable craftsmanship; I will buy it again.",
      avatar: "https://picsum.photos/seed/user1/100/100"
    },
    {
      name: "Sarah Jenkins",
      role: "Creative Director",
      text: "The quality of these stickers is unmatched. They look amazing on my laptop!",
      avatar: "https://picsum.photos/seed/user2/100/100"
    },
    {
      name: "Michael Chen",
      role: "Tech Enthusiast",
      text: "Fast delivery and great variety. The DIY stickers are my favorite.",
      avatar: "https://picsum.photos/seed/user3/100/100"
    }
  ];

  return (
    <section className="px-4 md:px-12 py-20 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 bg-shop-yellow rounded-full flex items-center justify-center">
            <Quote className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-shop-black">What our customers</h2>
            <p className="text-gray-500 font-bold uppercase text-sm tracking-widest">Are saying?</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-gray-50 p-8 rounded-3xl border border-gray-100 relative group hover:bg-white hover:shadow-xl transition-all duration-500"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-shop-yellow text-shop-yellow" />
                ))}
              </div>
              <p className="text-gray-600 italic mb-8 leading-relaxed">"{t.text}"</p>
              <div className="flex items-center gap-4">
                <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full border-2 border-white shadow-md" referrerPolicy="no-referrer" />
                <div>
                  <h4 className="font-black text-shop-black">{t.name}</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
