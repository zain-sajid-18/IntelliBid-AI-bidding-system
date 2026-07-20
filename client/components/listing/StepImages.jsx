"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, ImagePlus, Star } from "lucide-react";
import { useListingStore } from "@/store/listingStore";

export default function StepImages() {
    const { imagePreviews, addImages, removeImage } = useListingStore();
    const inputRef = useRef(null);
    const [dragging, setDragging] = useState(false);

    const handleFiles = (files) => {
        if (!files || files.length === 0) return;
        addImages(files);
    };

    const onDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
    };

    const slots = Array.from({ length: 6 });
    const canAddMore = imagePreviews.length < 6;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="font-display text-3xl font-black uppercase tracking-tight">
                    Upload Photos
                </h2>
                <p className="mt-1 font-medium text-[var(--ink)]/60">
                    Add up to 6 images. The first image becomes your cover photo.
                </p>
            </div>

            {/* Drop zone */}
            {canAddMore && (
                <div
                    onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragOver={(e) => e.preventDefault()}
                    onDragLeave={() => setDragging(false)}
                    onDrop={onDrop}
                    onClick={() => inputRef.current?.click()}
                    className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-[4px] border-dashed p-12 text-center transition-all cursor-pointer
                        ${dragging 
                            ? 'border-[var(--electric)] bg-[var(--electric)]/10 scale-[1.02]' 
                            : 'border-[var(--ink)]/40 hover:border-[var(--electric)] hover:bg-[var(--electric)]/5'
                        }`}
                >
                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl border-[3px] border-[var(--ink)] shadow-[3px_3px_0_0_var(--ink)] transition-colors ${dragging ? 'bg-[var(--electric)]' : 'bg-[var(--acid)]'}`}>
                        <Upload className="h-7 w-7" strokeWidth={3} />
                    </div>
                    <div>
                        <p className="font-display text-lg font-black uppercase">
                            {dragging ? 'Drop it!' : 'Drag & Drop or Click'}
                        </p>
                        <p className="text-sm font-medium text-[var(--ink)]/50">
                            JPG, PNG, or WebP · Max 8 MB each · {6 - imagePreviews.length} slots left
                        </p>
                    </div>
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFiles(e.target.files)}
                    />
                </div>
            )}

            {/* Image grid */}
            {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                    <AnimatePresence>
                        {slots.map((_, i) => {
                            const src = imagePreviews[i];
                            return (
                                <motion.div
                                    key={i}
                                    layout
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="relative aspect-square overflow-hidden rounded-xl border-[3px] border-[var(--ink)] shadow-[3px_3px_0_0_var(--ink)] bg-[var(--background)]"
                                >
                                    {src ? (
                                        <>
                                            <img src={src} alt={`Listing image ${i + 1}`} className="h-full w-full object-cover" />
                                            {i === 0 && (
                                                <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full border-[2px] border-[var(--ink)] bg-[var(--acid)] px-2 py-0.5 font-display text-[10px] font-black uppercase shadow-[1px_1px_0_0_var(--ink)]">
                                                    <Star className="h-2.5 w-2.5" fill="currentColor" /> Cover
                                                </div>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removeImage(i)}
                                                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border-[2px] border-[var(--ink)] bg-white shadow-[2px_2px_0_0_var(--ink)] transition-transform hover:scale-110 active:scale-95"
                                            >
                                                <X className="h-3.5 w-3.5" strokeWidth={3} />
                                            </button>
                                        </>
                                    ) : (
                                        <div 
                                            onClick={() => inputRef.current?.click()}
                                            className="flex h-full w-full cursor-pointer items-center justify-center opacity-20 hover:opacity-40 transition-opacity"
                                        >
                                            <ImagePlus className="h-8 w-8" />
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            {imagePreviews.length === 0 && (
                <p className="text-center text-sm font-bold text-[var(--ink)]/40 uppercase tracking-widest">
                    No images yet — drag some above to get started
                </p>
            )}
        </div>
    );
}
