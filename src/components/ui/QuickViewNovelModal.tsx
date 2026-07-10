"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, BookOpen } from "lucide-react";
import Link from "next/link";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { getNovelDetails, getNovelChapters } from "@/lib/novel-api";
import { NovelModalOptions } from "@/components/providers/NovelModalProvider";

interface QuickViewNovelModalProps {
  novel: any;
  options?: NovelModalOptions;
  onClose: () => void;
}

export default function QuickViewNovelModal({ novel, options, onClose }: QuickViewNovelModalProps) {
  const [mounted, setMounted] = useState(false);
  const [fullNovel, setFullNovel] = useState<any | null>(novel);
  const [chapters, setChapters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useLockBodyScroll();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Fetch full novel details and chapters
  useEffect(() => {
    if (!novel) return;
    let isMounted = true;

    const loadData = async () => {
      try {
        setIsLoading(true);
        // If we only have partial data from homepage, get full
        const details = await getNovelDetails(novel.id);
        if (isMounted && details) {
          setFullNovel(details);
          const chaps = await getNovelChapters(details.title.romaji || details.title.english);
          if (isMounted) setChapters(chaps);
        }
      } catch (err) {
        console.error("Failed to load novel details:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [novel]);

  if (!mounted) return null;

  const displayNovel = fullNovel || novel;
  const title = displayNovel?.title?.userPreferred || displayNovel?.title?.english || "Unknown Title";
  const coverUrl = displayNovel?.coverImage?.extraLarge || displayNovel?.coverImage?.large;
  const bannerUrl = displayNovel?.bannerImage || coverUrl;

  return createPortal(
    <AnimatePresence>
      {displayNovel && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="relative w-full max-w-5xl bg-[#111] rounded-2xl shadow-2xl border border-white/10 z-10 my-8 mx-4 overflow-hidden flex flex-col"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur transition border border-white/10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Banner Section */}
            <div className="relative w-full h-[300px] md:h-[400px] shrink-0">
              <img
                src={bannerUrl}
                alt={title}
                className="w-full h-full object-cover object-top opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/80 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col md:flex-row gap-8 items-end">
                <div className="w-32 md:w-48 shrink-0 rounded-lg overflow-hidden shadow-2xl border-2 border-white/20 hidden md:block">
                  <img src={coverUrl} alt={title} className="w-full h-auto object-cover" />
                </div>
                <div className="flex-1 pb-4">
                  <h1 className="text-4xl md:text-5xl font-cinzel font-bold text-white mb-2 drop-shadow-md">
                    {title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300 font-medium mb-4">
                    {displayNovel.averageScore && (
                      <span className="text-green-400 font-bold">{displayNovel.averageScore}% Match</span>
                    )}
                    {displayNovel.status && <span>{displayNovel.status}</span>}
                    {displayNovel.genres && (
                      <div className="flex gap-2">
                        {displayNovel.genres.slice(0, 3).map((g: string) => (
                          <span key={g} className="px-2 py-0.5 bg-white/10 rounded-full text-xs">
                            {g}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {chapters.length > 0 && (
                    <Link
                      href={`/novel/${displayNovel.id}/read/${chapters[0].id}`}
                      className="inline-flex items-center gap-2 bg-white text-black hover:bg-indigo-500 hover:text-white font-bold py-3 px-8 rounded-full transition"
                      onClick={onClose}
                    >
                      <Play className="w-5 h-5 fill-current" />
                      Read First Chapter
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <h3 className="text-2xl font-bold font-cinzel text-white mb-4">Synopsis</h3>
                <div 
                  className="text-slate-300 text-lg leading-relaxed font-garamond"
                  dangerouslySetInnerHTML={{ __html: displayNovel?.description || "No description available." }}
                />
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold font-cinzel text-white mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-400" />
                    Chapters
                  </h3>
                  {isLoading ? (
                    <div className="text-slate-400 animate-pulse">Loading chapters...</div>
                  ) : (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                      <div className="space-y-2">
                        {chapters.map((chapter: any, index: number) => (
                          <Link 
                            key={chapter.id} 
                            href={`/novel/${displayNovel.id}/read/${chapter.id}`}
                            onClick={onClose}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-white/10 transition border border-transparent hover:border-white/10 group"
                          >
                            <span className="font-medium text-slate-200 group-hover:text-indigo-300 transition line-clamp-1 pr-4">
                              {chapter.title || `Chapter ${chapter.number || index + 1}`}
                            </span>
                          </Link>
                        ))}
                        {chapters.length === 0 && (
                          <p className="text-slate-500 italic">No chapters available.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
