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
import { Search, Bell, User, Menu, X } from 'lucide-react';
import { cn } from './lib/utils';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 w-full z-50 transition-colors duration-300 px-4 md:px-12 py-4 flex items-center justify-between",
      isScrolled ? "bg-netflix-black" : "bg-gradient-to-b from-black/80 to-transparent"
    )}>
      <div className="flex items-center gap-8">
        <Link to="/" className="text-netflix-red text-2xl md:text-3xl font-black tracking-tighter uppercase">
          StickerFlix
        </Link>
        <div className="hidden md:flex items-center gap-5 text-sm font-medium text-white/80">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <Link to="/#trending" className="hover:text-white transition-colors">Trending</Link>
          <Link to="/#new" className="hover:text-white transition-colors">New Releases</Link>
          <Link to="/#blog" className="hover:text-white transition-colors">Blog</Link>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <Link to="/search">
          <Search className="w-5 h-5 cursor-pointer hover:text-white/70" />
        </Link>
        <Bell className="w-5 h-5 cursor-pointer hover:text-white/70" />
        <User className="w-5 h-5 cursor-pointer hover:text-white/70" />
        <button 
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-netflix-black border-t border-white/10 p-4 flex flex-col gap-4 md:hidden">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          <Link to="/#trending" onClick={() => setIsMobileMenuOpen(false)}>Trending</Link>
          <Link to="/#new" onClick={() => setIsMobileMenuOpen(false)}>New Releases</Link>
          <Link to="/#blog" onClick={() => setIsMobileMenuOpen(false)}>Blog</Link>
        </div>
      )}
    </nav>
  );
};

const Home = () => {
  const trendingStickers = STICKERS.filter(s => s.isTrending);
  const newStickers = STICKERS.filter(s => s.isNew);
  const categories = Array.from(new Set(STICKERS.map(s => s.category)));

  return (
    <div className="pb-20">
      <HeroSlider stickers={newStickers.slice(0, 3)} />
      
      <div className="-mt-32 relative z-10 space-y-8">
        <div id="trending">
          <StickerRow title="Most Demanded Stickers" stickers={trendingStickers} />
        </div>

        <CategoriesSection />

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
      
      <footer className="bg-netflix-black border-t border-white/10 py-12 px-4 md:px-12 text-center text-white/40 text-sm">
        <p>&copy; 2026 StickerFlix. All rights reserved.</p>
        <p className="mt-2">Place orders via WhatsApp for fast delivery.</p>
      </footer>
    </Router>
  );
}
