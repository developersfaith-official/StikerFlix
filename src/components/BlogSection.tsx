"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, ArrowRight, Clock, BookOpen } from "lucide-react";
import { motion } from "motion/react";

interface BlogListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  published_at: string | null;
  reading_time_minutes: number;
}

export const BlogSection: React.FC = () => {
  const [posts, setPosts] = useState<BlogListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch("/api/blogs")
      .then((r) => r.json())
      .then((body) => {
        if (mounted && body.success) setPosts(body.blogs.slice(0, 2));
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="py-20 px-4 md:px-12 bg-gray-50/30">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-shop-black">
              Sticker Stories
            </h2>
            <div className="h-1.5 w-24 bg-shop-yellow mt-2 rounded-full"></div>
            <p className="text-gray-400 font-bold uppercase text-xs tracking-[0.2em] mt-4">
              Tips, trends, and inspiration.
            </p>
          </div>
          <Link
            href="/blog"
            className="group flex items-center gap-3 bg-white border border-gray-100 px-6 py-3 rounded-full font-black uppercase text-[10px] tracking-widest text-shop-black hover:bg-shop-yellow hover:text-white transition-all shadow-sm"
          >
            Read All Stories
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Empty state — first-time visitor with no blogs published yet */}
        {!loading && posts.length === 0 && (
          <Link
            href="/blog"
            className="group flex flex-col items-center justify-center text-center py-16 px-6 bg-white rounded-[32px] border-2 border-dashed border-gray-200 hover:border-shop-yellow hover:bg-shop-yellow/5 transition-all"
          >
            <div className="w-16 h-16 rounded-full bg-shop-yellow/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <BookOpen className="w-8 h-8 text-shop-yellow" />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tighter text-shop-black">
              Fresh Stories Coming Soon
            </h3>
            <p className="text-gray-500 text-sm mt-2 max-w-md">
              Guides, trends, and sticker-styling tips. Be the first to check out the blog.
            </p>
            <span className="mt-5 inline-flex items-center gap-2 text-shop-yellow font-black uppercase text-xs tracking-widest group-hover:gap-4 transition-all">
              Visit the Blog <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                href={`/blog/${post.slug}`}
                className="group cursor-pointer space-y-6 block"
              >
                <div className="aspect-[16/9] rounded-[32px] overflow-hidden relative shadow-xl shadow-black/5 bg-gray-100">
                  {post.featured_image_url && (
                    <img
                      src={post.featured_image_url}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-500" />
                  {post.published_at && (
                    <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                      <Calendar className="w-3.5 h-3.5 text-shop-yellow" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-shop-black">
                        {new Date(post.published_at).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                    <Clock className="w-3 h-3 text-shop-yellow" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-shop-black">
                      {post.reading_time_minutes} min
                    </span>
                  </div>
                </div>
                <div className="space-y-4 px-2">
                  <h3 className="text-2xl font-black text-shop-black group-hover:text-shop-yellow transition-colors leading-tight">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-gray-500 line-clamp-2 text-sm font-medium leading-relaxed">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-shop-yellow font-black uppercase text-[10px] tracking-widest group-hover:gap-4 transition-all">
                    Read More <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
