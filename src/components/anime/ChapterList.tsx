"use client";

import { useEffect, useState } from "react";
import { getNovelSlugFromTitle, getNovelChapters } from "@/lib/novels";
import { Loader2, Tv, AlertCircle, Play, ChevronDown, Clock, BookOpen } from "lucide-react";
import { Anime } from "@tutkli/jikan-ts";
import Link from "next/link";

export default function ChapterList({ anime, onClose }: { anime: Anime; onClose?: () => void }) {
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [novelSlug, setNovelSlug] = useState<string | null>(null);

  // Group selector
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch chapters on mount
  useEffect(() => {
    let isMounted = true;

    const fetchChapters = async () => {
      setLoading(true);
      setError(null);

      try {
        // Step 1: Find the slug by trying multiple titles
        // Handle both AniList format (title is an object) and Jikan format (title is a string)
        const titleObj = anime.title as any;
        const possibleTitles = [
          // AniList format: title is { romaji, english, userPreferred }
          ...(typeof titleObj === 'object' && titleObj !== null
            ? [titleObj.romaji, titleObj.english, titleObj.userPreferred, titleObj.native]
            : []),
          // Jikan format: title is a string, with separate fields
          ...(typeof titleObj === 'string' ? [titleObj] : []),
          anime.title_japanese,
          anime.title_english,
          (anime as any).title_romaji,
        ].filter((t): t is string => typeof t === 'string' && t.length > 0);

        let slug: string | null = null;
        for (const title of possibleTitles) {
          slug = await getNovelSlugFromTitle(title);
          if (slug) break;
        }

        if (!isMounted) return;

        if (!slug) {
          setError("Novel not found in reading database.");
          setLoading(false);
          return;
        }

        setNovelSlug(slug);

        // Step 2: Fetch chapters for the active page
        const chapterData = await getNovelChapters(slug, activePage);
        if (!isMounted) return;

        if (chapterData && chapterData.chapters) {
          setChapters(chapterData.chapters);
          setTotalPages(chapterData.totalPages || 1);
        } else {
          setChapters([]);
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || "Failed to load chapters.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchChapters();
    return () => { isMounted = false; };
  }, [anime.title, anime.title_english, activePage]);

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-indigo-400">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="font-bold tracking-widest text-sm uppercase">Loading Chapters...</p>
      </div>
    );
  }

  // ── Error or No Chapters ──
  if (error || chapters.length === 0) {
    const isNotFound = error?.includes("not found") || chapters.length === 0;
    const titleForSearch = anime.title_english || anime.title || "this novel";
    const googleSearchUrl = `https://www.google.com/search?q=Read+${encodeURIComponent(titleForSearch)}+novel+online`;

    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 bg-white/[0.02] rounded-2xl border border-white/5 text-center">
        <BookOpen className="w-16 h-16 text-slate-500/50 mb-6" />
        <h3 className="text-2xl font-bold text-white mb-3">
          {isNotFound ? "Not Available Yet" : "Could Not Load Chapters"}
        </h3>
        <p className="text-slate-400 max-w-md mb-8 leading-relaxed">
          {isNotFound 
            ? "We couldn't find chapters for this novel in our current reading database. It might be officially licensed, unpublished, or known under a different name."
            : error}
        </p>
        
        <a 
          href={googleSearchUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full transition-colors border border-white/10 hover:border-white/20"
        >
          Search Web for Chapters
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── Header: Title + Page Selector ── */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-black text-white">Chapters</h3>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400 font-medium">Page {activePage} of {totalPages}</span>
            <div className="relative">
              <select
                value={activePage}
                onChange={(e) => setActivePage(Number(e.target.value))}
                className="appearance-none bg-[#141414] border border-white/20 text-white rounded-md px-4 py-2 pr-10 font-bold text-sm focus:outline-none focus:border-white/40 cursor-pointer hover:bg-[#1a1a1a] transition"
              >
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <option key={p} value={p} className="bg-[#141414] text-white">
                    Page {p}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* ── Chapter List ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {chapters.map((chap, idx) => {
          const chapterNumber = (activePage - 1) * 50 + idx + 1; // Assuming 50 per page usually
          const titleToDisplay = chap.title || `Chapter ${chapterNumber}`;

          return (
            <Link
              key={chap.slug || idx}
              href={`/novel/${anime.mal_id}/read/${chap.slug}?novelSlug=${novelSlug}`}
              onClick={() => {
                if (onClose) onClose();
              }}
              className="group flex flex-col justify-center p-4 bg-white/5 border border-white/10 hover:border-indigo-500/50 hover:bg-white/10 transition-colors rounded-xl cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-500 transition-colors">
                  <BookOpen className="w-5 h-5 text-indigo-400 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <h4 className="text-white font-bold text-sm truncate" title={titleToDisplay}>
                    {titleToDisplay}
                  </h4>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
