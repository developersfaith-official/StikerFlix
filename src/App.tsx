import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { STICKERS } from './data';
import { HeroSlider } from './components/HeroSlider';
import { StickerRow } from './components/StickerRow';
import { StickerDetail } from './components/StickerDetail';
import { BlogSection } from './components/BlogSection';
import { CategoriesSection } from './components/CategoriesSection';
import { SearchPage } from './components/SearchPage';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { CategoryOverlay } from './components/CategoryOverlay';
import { Search, Bell, User, Menu, X, Instagram, Youtube, MessageCircle, Share2, ChevronDown, ShoppingBasket, Heart, Phone, MapPin, Star, Quote } from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [pinnedCount, setPinnedCount] = useState(3);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Categories', isSpecial: true },
    { name: 'Trend', path: '/#trending' },
    { name: 'New Release', path: '/#new' },
    { name: 'Blog', path: '/#blog' },
  ];

  return (
    <>
      <nav className="w-full z-50 bg-white">
        {/* Top Bar */}
        <div className="hidden md:flex bg-gray-50 border-b border-gray-100 px-4 md:px-12 py-2 justify-between items-center text-[11px] font-medium text-gray-500 uppercase tracking-wider">
          <div className="flex gap-6">
            <span className="flex items-center gap-1.5 hover:text-shop-yellow cursor-pointer transition-colors">
              <Phone className="w-3 h-3" /> Sell With Us
            </span>
            <span className="flex items-center gap-1.5 hover:text-shop-yellow cursor-pointer transition-colors">
              <MessageCircle className="w-3 h-3" /> Contact Us
            </span>
          </div>
          <div className="flex gap-6">
            <span className="hover:text-shop-yellow cursor-pointer transition-colors">Sports & More</span>
            <span className="hover:text-shop-yellow cursor-pointer transition-colors">Essentials</span>
            <span className="hover:text-shop-yellow cursor-pointer transition-colors">Offers</span>
            <span className="hover:text-shop-yellow cursor-pointer transition-colors">Global Shopping</span>
          </div>
        </div>

        {/* Middle Bar */}
        <div className={cn(
          "px-4 md:px-12 py-4 flex items-center justify-between transition-all duration-300",
          isScrolled ? "fixed top-0 left-0 bg-white shadow-md py-3" : "relative"
        )}>
          <div className="flex items-center gap-8 flex-1">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-shop-yellow rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
                <ShoppingBasket className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase text-shop-black">
                Sticker<span className="text-shop-yellow">Flix</span>
              </span>
            </Link>

            <div className="hidden md:flex flex-1 max-w-xl relative group">
              <input 
                type="text" 
                placeholder="Search all stickers..." 
                className="w-full bg-gray-100 border-none rounded-full px-6 py-2.5 text-sm focus:ring-2 focus:ring-shop-yellow/20 transition-all"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-shop-yellow transition-colors" />
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-8">
            <div className="hidden sm:flex items-center gap-6 text-gray-600">
              <div className="flex flex-col items-center gap-0.5 cursor-pointer hover:text-shop-yellow transition-colors group">
                <MapPin className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold uppercase">Track</span>
              </div>
              <div className="flex flex-col items-center gap-0.5 cursor-pointer hover:text-shop-yellow transition-colors group">
                <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold uppercase">Alerts</span>
              </div>
              <div className="flex flex-col items-center gap-0.5 cursor-pointer hover:text-shop-yellow transition-colors group">
                <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold uppercase">Wishlist</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative group p-2 bg-gray-100 rounded-full hover:bg-shop-yellow transition-all">
                <ShoppingBasket className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                {pinnedCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-shop-yellow text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                    {pinnedCount}
                  </span>
                )}
              </button>

              <button className="hidden md:flex items-center gap-2 font-bold text-sm text-shop-black hover:text-shop-yellow transition-colors">
                <User className="w-5 h-5" /> Sign In
              </button>

              <button 
                className="lg:hidden p-2 text-shop-black"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar / Nav Links */}
        <div className="hidden lg:flex px-4 md:px-12 py-3 border-t border-gray-100 justify-center gap-10">
          {navLinks.map((link) => (
            link.isSpecial ? (
              <button
                key={link.name}
                onClick={() => setIsCategoriesOpen(true)}
                className="text-xs font-black text-gray-600 hover:text-shop-yellow transition-colors flex items-center gap-1.5 uppercase tracking-widest group"
              >
                {link.name}
                <ChevronDown className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-300" />
              </button>
            ) : (
              <Link 
                key={link.name}
                to={link.path!} 
                className="text-xs font-black text-gray-600 hover:text-shop-yellow transition-colors uppercase tracking-widest"
              >
                {link.name}
              </Link>
            )
          ))}
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              className="fixed inset-0 z-[60] bg-white flex flex-col p-8 lg:hidden"
            >
              <div className="flex justify-between items-center mb-12">
                <span className="text-shop-black text-2xl font-black uppercase tracking-tighter">
                  Sticker<span className="text-shop-yellow">Flix</span>
                </span>
                <X className="w-8 h-8 text-shop-black" onClick={() => setIsMobileMenuOpen(false)} />
              </div>
              
              <div className="flex flex-col gap-8 text-xl font-black uppercase tracking-tighter text-shop-black">
                {navLinks.map((link) => (
                  link.isSpecial ? (
                    <button
                      key={link.name}
                      onClick={() => { setIsMobileMenuOpen(false); setIsCategoriesOpen(true); }}
                      className="text-left hover:text-shop-yellow transition-colors"
                    >
                      {link.name}
                    </button>
                  ) : (
                    <Link 
                      key={link.name}
                      to={link.path!} 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="hover:text-shop-yellow transition-colors"
                    >
                      {link.name}
                    </Link>
                  )
                ))}
              </div>

              <div className="mt-auto pt-8 border-t border-gray-100 flex flex-col gap-4">
                <button className="bg-shop-yellow text-white font-black py-4 rounded-xl uppercase tracking-widest shadow-lg shadow-shop-yellow/20">
                  Sign In
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <CategoryOverlay 
        isOpen={isCategoriesOpen} 
        onClose={() => setIsCategoriesOpen(false)} 
      />
    </>
  );
};

const Testimonials = () => {
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

const Home = () => {
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
};

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
};

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/sticker/:id" element={<StickerDetail />} />
      </Routes>
      <FloatingWhatsApp />
      
      <footer className="bg-white border-t border-gray-100 py-20 px-4 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
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
              <li><Link to="/" className="hover:text-shop-yellow transition-colors">Home</Link></li>
              <li><Link to="/search" className="hover:text-shop-yellow transition-colors">Search Stickers</Link></li>
              <li><Link to="/#trending" className="hover:text-shop-yellow transition-colors">Trending Now</Link></li>
              <li><Link to="/#blog" className="hover:text-shop-yellow transition-colors">Our Blog</Link></li>
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
    </Router>
  );
}
