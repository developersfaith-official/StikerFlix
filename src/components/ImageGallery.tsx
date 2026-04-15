"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Heart,
  Share2,
  Flame,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  mainImage: string;
  title: string;
  isTrending?: boolean;
  galleryImages?: string[];
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  mainImage,
  title,
  isTrending = false,
  galleryImages,
}) => {
  // Mock gallery: repeat the main image to simulate multiple angles
  const images =
    galleryImages && galleryImages.length > 0
      ? galleryImages
      : [mainImage, mainImage, mainImage, mainImage, mainImage];

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  const currentImage = images[selectedIndex];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const goPrev = () =>
    setSelectedIndex((i) => (i > 0 ? i - 1 : images.length - 1));
  const goNext = () =>
    setSelectedIndex((i) => (i < images.length - 1 ? i + 1 : 0));

  return (
    <div className="space-y-4">
      {/* ── Main image ── */}
      <div
        ref={imgRef}
        className="relative bg-gray-50 rounded-3xl overflow-hidden cursor-zoom-in aspect-[4/5] group"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onMouseMove={handleMouseMove}
        onClick={() => setShowLightbox(true)}
      >
        <img
          src={currentImage}
          alt={title}
          className="w-full h-full object-contain p-8 transition-transform duration-300"
          style={
            isHovering
              ? {
                  transform: "scale(1.5)",
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                }
              : undefined
          }
          referrerPolicy="no-referrer"
        />

        {/* Icon overlay (top-right) */}
        <div className="absolute top-4 right-4 flex flex-col gap-3 z-10">
          {isTrending && (
            <div className="flex items-center gap-1.5 bg-shop-yellow text-white px-3 py-1.5 rounded-full shadow-lg">
              <Flame className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Trending
              </span>
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className={cn(
              "p-2.5 rounded-full shadow-md transition-all",
              isLiked
                ? "bg-red-500 text-white"
                : "bg-white/90 text-gray-600 hover:bg-white"
            )}
          >
            <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-2.5 bg-white/90 rounded-full shadow-md text-gray-600 hover:bg-white transition-all"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowLightbox(true);
            }}
            className="p-2.5 bg-white/90 rounded-full shadow-md text-gray-600 hover:bg-white transition-all"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>

        {/* Image counter (bottom-left) */}
        <div className="absolute bottom-4 left-4 bg-black/50 text-white text-[10px] font-bold px-3 py-1 rounded-full">
          {selectedIndex + 1} / {images.length}
        </div>
      </div>

      {/* ── Thumbnail slider ── */}
      <div className="flex gap-3 overflow-x-auto hide-scrollbar px-1 py-1">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setSelectedIndex(i)}
            className={cn(
              "shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all p-1.5 bg-gray-50",
              selectedIndex === i
                ? "border-shop-yellow shadow-md"
                : "border-gray-200 hover:border-gray-300"
            )}
          >
            <img
              src={img}
              alt={`${title} view ${i + 1}`}
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </button>
        ))}
      </div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {showLightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setShowLightbox(false)}
          >
            <button
              className="absolute top-6 right-6 text-white/70 hover:text-white z-10"
              onClick={() => setShowLightbox(false)}
            >
              <X className="w-8 h-8" />
            </button>

            <button
              className="absolute left-4 md:left-8 text-white/70 hover:text-white z-10"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
            >
              <ChevronLeft className="w-10 h-10" />
            </button>

            <motion.img
              key={selectedIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={currentImage}
              alt={title}
              className="max-w-full max-h-[85vh] object-contain"
              onClick={(e) => e.stopPropagation()}
              referrerPolicy="no-referrer"
            />

            <button
              className="absolute right-4 md:right-8 text-white/70 hover:text-white z-10"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
            >
              <ChevronRight className="w-10 h-10" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-6 flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex(i);
                  }}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    selectedIndex === i
                      ? "bg-shop-yellow w-6"
                      : "bg-white/40 hover:bg-white/70 w-2"
                  )}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
