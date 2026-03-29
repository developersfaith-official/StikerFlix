import React from 'react';
import { BLOG_POSTS } from '../data';
import { Calendar } from 'lucide-react';

export const BlogSection: React.FC = () => {
  return (
    <section className="py-16 px-4 md:px-12 space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Sticker Stories</h2>
        <p className="text-white/60">Tips, trends, and inspiration for your sticker collection.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {BLOG_POSTS.map((post) => (
          <div key={post.id} className="group cursor-pointer space-y-4">
            <div className="aspect-video rounded-xl overflow-hidden relative">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-netflix-red font-bold uppercase">
                <Calendar className="w-3 h-3" /> {post.date}
              </div>
              <h3 className="text-xl font-bold group-hover:text-netflix-red transition-colors">
                {post.title}
              </h3>
              <p className="text-white/60 line-clamp-2 text-sm">
                {post.excerpt}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
