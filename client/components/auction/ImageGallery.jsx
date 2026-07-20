"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Maximize2 } from "lucide-react";

export default function ImageGallery({ images = [], title }) {
    const [mainImageIdx, setMainImageIdx] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const safeImages = images.length > 0 ? images : ['https://via.placeholder.com/600x600?text=No+Image'];

    return (
        <div className="flex flex-col gap-3">
            {/* Main Hero Image */}
            <div className="group relative aspect-square w-full rounded-2xl border-[4px] border-[var(--ink)] bg-[var(--background)] overflow-hidden shadow-[6px_6px_0_0_var(--ink)]">
                <img 
                    src={safeImages[mainImageIdx]} 
                    alt={title} 
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <button 
                    onClick={() => setIsFullscreen(true)}
                    className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl border-[3px] border-[var(--ink)] bg-white shadow-[2px_2px_0_0_var(--ink)] opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                >
                    <Maximize2 size={18} strokeWidth={3} />
                </button>
            </div>

            {/* Thumbnails */}
            {safeImages.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                    {safeImages.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setMainImageIdx(idx)}
                            className={`aspect-square rounded-xl border-[3px] overflow-hidden transition-all hover:-translate-y-1 ${
                                mainImageIdx === idx 
                                    ? 'border-[var(--electric)] shadow-[4px_4px_0_0_var(--electric)]' 
                                    : 'border-[var(--ink)] shadow-[2px_2px_0_0_var(--ink)] opacity-70 hover:opacity-100'
                            }`}
                        >
                            <img src={img} alt={`Thumbnail ${idx+1}`} className="h-full w-full object-cover" />
                        </button>
                    ))}
                </div>
            )}

            {/* Fullscreen Lightbox */}
            <AnimatePresence>
                {isFullscreen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center bg-[var(--ink)]/90 backdrop-blur-md p-4 md:p-10"
                        onClick={() => setIsFullscreen(false)}
                    >
                        <button 
                            className="absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-white/20 bg-white/10 text-white hover:bg-white/20 transition-colors"
                            onClick={() => setIsFullscreen(false)}
                        >
                            <X size={24} strokeWidth={3} />
                        </button>
                        
                        <motion.img 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            src={safeImages[mainImageIdx]} 
                            className="max-h-full max-w-full rounded-2xl border-[4px] border-[var(--ink)] shadow-[12px_12px_0_0_var(--acid)] object-contain bg-white"
                            onClick={(e) => e.stopPropagation()} // prevent closing when clicking image
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
