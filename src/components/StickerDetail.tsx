import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { STICKERS } from '../data';
import { MessageCircle, Star, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { WHATSAPP_PHONE_NUMBER, WHATSAPP_MESSAGE_TEMPLATE } from '../constants';
import { cn } from '../lib/utils';

export const StickerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const sticker = STICKERS.find((s) => s.id === id);

  if (!sticker) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-bold">Sticker not found</h1>
        <Link to="/" className="text-netflix-red hover:underline">Go back home</Link>
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
    <div className="min-h-screen bg-netflix-black pt-20 pb-12 px-4 md:px-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      <div className="grid md:grid-cols-2 gap-12 items-start">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl overflow-hidden shadow-2xl shadow-netflix-red/10"
        >
          <img
            src={sticker.image}
            alt={sticker.title}
            className="w-full aspect-square object-cover"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-netflix-red font-bold uppercase tracking-widest text-xs">
              {sticker.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-black">{sticker.title}</h1>
            <p className="text-2xl font-bold text-white/90">${sticker.price}</p>
          </div>

          <p className="text-white/70 text-lg leading-relaxed">
            {sticker.description}
          </p>

          <button
            onClick={handleWhatsAppOrder}
            className="w-full md:w-auto flex items-center justify-center gap-3 bg-[#25D366] text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-lg"
          >
            <MessageCircle className="w-6 h-6" /> Order via WhatsApp
          </button>

          <div className="pt-12 space-y-6">
            <h3 className="text-xl font-bold border-b border-white/10 pb-4">Customer Remarks</h3>
            {sticker.remarks.length > 0 ? (
              <div className="space-y-4">
                {sticker.remarks.map((remark, idx) => (
                  <div key={idx} className="bg-white/5 p-4 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white/80">{remark.user}</span>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "w-3 h-3",
                              i < remark.rating ? "fill-yellow-400 text-yellow-400" : "text-white/20"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-white/60 italic">"{remark.comment}"</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/40 italic">No remarks yet. Be the first to order!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
