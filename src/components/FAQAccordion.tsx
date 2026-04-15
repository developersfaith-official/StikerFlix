"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronDown,
  HelpCircle,
  ThumbsUp,
  MessageCircleQuestion,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FAQ } from "@/data";

interface FAQAccordionProps {
  productId: number;
}

export const FAQAccordion: React.FC<FAQAccordionProps> = ({ productId }) => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);
  const [votedIds, setVotedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    let mounted = true;
    fetch(`/api/faqs?productId=${productId}`)
      .then((r) => r.json())
      .then((res) => {
        if (mounted && res.success) setFaqs(res.data);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [productId]);

  const handleVote = (faqId: number) => {
    if (votedIds.has(faqId)) return;
    setVotedIds((prev) => new Set(prev).add(faqId));
    setFaqs((prev) =>
      prev.map((f) =>
        f.id === faqId ? { ...f, helpful_count: f.helpful_count + 1 } : f
      )
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-shop-yellow" />
      </div>
    );
  }

  if (faqs.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <MessageCircleQuestion className="w-6 h-6 text-shop-yellow" />
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-shop-black">
          Frequently Asked Questions
        </h2>
      </div>
      <div className="h-1 w-12 bg-shop-yellow rounded-full" />

      <div className="space-y-3">
        {faqs.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div
              key={faq.id}
              className="border border-gray-100 rounded-2xl overflow-hidden bg-white"
            >
              <button
                onClick={() => setOpenId(isOpen ? null : faq.id)}
                className="w-full flex items-start justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left gap-4"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <HelpCircle
                    className={cn(
                      "w-5 h-5 shrink-0 mt-0.5 transition-colors",
                      isOpen ? "text-shop-yellow" : "text-gray-300"
                    )}
                  />
                  <span className="text-sm font-bold text-shop-black leading-snug">
                    {faq.question}
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    "w-5 h-5 text-gray-400 shrink-0 transition-transform duration-300 mt-0.5",
                    isOpen && "rotate-180"
                  )}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-0 pl-13">
                      <p className="text-sm text-gray-500 leading-relaxed ml-8">
                        {faq.answer}
                      </p>
                      <div className="flex items-center gap-4 mt-4 ml-8">
                        <button
                          onClick={() => handleVote(faq.id)}
                          disabled={votedIds.has(faq.id)}
                          className={cn(
                            "flex items-center gap-1.5 text-xs font-bold transition-colors",
                            votedIds.has(faq.id)
                              ? "text-shop-yellow cursor-default"
                              : "text-gray-400 hover:text-shop-yellow"
                          )}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          Helpful ({faq.helpful_count})
                        </button>
                        <span className="text-[10px] text-gray-300">
                          {faq.views_count} views
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
