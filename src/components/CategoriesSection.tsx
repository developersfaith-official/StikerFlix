import React from 'react';
import { Link } from 'react-router-dom';
import { Laptop, Baby, Utensils, MoreHorizontal, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

const CATEGORIES = [
  { name: 'Kids', icon: Baby, image: 'https://picsum.photos/seed/kids-stickers/400/600', size: 'row-span-2' },
  { name: 'Laptop', icon: Laptop, image: 'https://picsum.photos/seed/laptop-stickers/400/300', size: 'col-span-1' },
  { name: 'Kitchen', icon: Utensils, image: 'https://picsum.photos/seed/kitchen-stickers/400/300', size: 'col-span-1' },
  { name: 'Other', icon: MoreHorizontal, image: 'https://picsum.photos/seed/other-stickers/800/400', size: 'col-span-2' },
];

export const CategoriesSection: React.FC = () => {
  return (
    <section className="px-4 md:px-12 py-20 bg-gray-50/50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div>
            <h2 className="text-4xl font-black uppercase tracking-tighter text-shop-black leading-none">First Time? <br/> <span className="text-shop-yellow">Start Explore!</span></h2>
            <p className="text-gray-400 font-bold uppercase text-xs tracking-[0.2em] mt-4">Explore popular categories!</p>
          </div>
          <Link to="/search" className="group flex items-center gap-3 bg-white border border-gray-100 px-6 py-3 rounded-full font-black uppercase text-[10px] tracking-widest text-shop-black hover:bg-shop-yellow hover:text-white transition-all shadow-sm">
            All Category <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-6 h-[600px]">
          {/* Main Large Card */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-2 md:row-span-2 relative rounded-[40px] overflow-hidden group shadow-xl shadow-black/5"
          >
            <img src={CATEGORIES[0].image} alt={CATEGORIES[0].name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-10 left-10 space-y-4">
              <span className="bg-shop-yellow text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">Trending</span>
              <h3 className="text-4xl font-black text-white uppercase tracking-tighter">{CATEGORIES[0].name} Fashion</h3>
              <button className="bg-white text-shop-black px-6 py-2.5 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-shop-yellow hover:text-white transition-all">See more</button>
            </div>
          </motion.div>

          {/* Smaller Cards */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-1 relative rounded-[40px] overflow-hidden group shadow-xl shadow-black/5"
          >
            <img src={CATEGORIES[1].image} alt={CATEGORIES[1].name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
            <div className="absolute bottom-6 left-6">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-3">{CATEGORIES[1].name}</h3>
              <button className="bg-shop-yellow text-white px-4 py-2 rounded-full font-black uppercase text-[8px] tracking-widest">Explore</button>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-1 relative rounded-[40px] overflow-hidden group shadow-xl shadow-black/5"
          >
            <img src={CATEGORIES[2].image} alt={CATEGORIES[2].name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
            <div className="absolute bottom-6 left-6">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-3">{CATEGORIES[2].name}</h3>
              <button className="bg-shop-yellow text-white px-4 py-2 rounded-full font-black uppercase text-[8px] tracking-widest">Explore</button>
            </div>
          </motion.div>

          {/* Wide Bottom Card */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-2 relative rounded-[40px] overflow-hidden group shadow-xl shadow-black/5"
          >
            <img src={CATEGORIES[3].image} alt={CATEGORIES[3].name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
            <div className="absolute left-10 top-1/2 -translate-y-1/2 space-y-4">
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Discover <br/> {CATEGORIES[3].name} Stickers</h3>
              <button className="bg-white text-shop-black px-6 py-2.5 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-shop-yellow hover:text-white transition-all">View Collection</button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
