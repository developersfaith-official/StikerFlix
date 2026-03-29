"use client";

import React from 'react';
import { BLOG_POSTS } from '../data';
import { Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export const BlogSection: React.FC = () => {
  return (
    <section className="py-20 px-4 md:px-12 bg-gray-50/30">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-shop-black">Sticker Stories</h2>
            <div className="h-1.5 w-24 bg-shop-yellow mt-2 rounded-full"></div>
            <p className="text-gray-400 font-bold uppercase text-xs tracking-[0.2em] mt-4">Tips, trends, and inspiration.</p>
          </div>
          <button className="group flex items-center gap-3 bg-white border border-gray-100 px-6 py-3 rounded-full font-black uppercase text-[10px] tracking-widest text-shop-black hover:bg-shop-yellow hover:text-white transition-all shadow-sm">
            Read All Stories <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {BLOG_POSTS.map((post, i) => (
            <motion.div 
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group cursor-pointer space-y-6"
            >
              <div className="aspect-[16/9] rounded-[32px] overflow-hidden relative shadow-xl shadow-black/5">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-500" />
                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                  <Calendar className="w-3.5 h-3.5 text-shop-yellow" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-shop-black">{post.date}</span>
                </div>
              </div>
              <div className="space-y-4 px-2">
                <h3 className="text-2xl font-black text-shop-black group-hover:text-shop-yellow transition-colors leading-tight">
                  {post.title}
                </h3>
                <p className="text-gray-500 line-clamp-2 text-sm font-medium leading-relaxed">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-2 text-shop-yellow font-black uppercase text-[10px] tracking-widest group-hover:gap-4 transition-all">
                  Read More <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
