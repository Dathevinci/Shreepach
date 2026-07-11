import { getChapterContent, getNovelDetails } from "@/lib/novels";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, BookOpen, AlertCircle } from "lucide-react";
import PageTransition from "@/components/layout/PageTransition";
import NovelReaderContent from "./NovelReaderContent";

export const revalidate = 3600;

export default async function NovelReader({ 
  params,
  searchParams 
}: { 
  params: Promise<{ id: string, chapterId: string }>;
  searchParams: Promise<{ novelSlug?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const animeId = parseInt(resolvedParams.id, 10);
  const chapterSlug = resolvedParams.chapterId;
  const novelSlug = resolvedSearchParams.novelSlug;

  if (isNaN(animeId) || !chapterSlug || !novelSlug) {
    return notFound();
  }

  // Fetch the novel metadata for header
  let novel = null;
  try {
    novel = await getNovelDetails(animeId);
  } catch (err) {
    console.error("Novel Details Error in Reader:", err);
  }

  // Fetch the chapter content
  let chapter = null;
  let error = null;
  try {
    chapter = await getChapterContent(novelSlug, chapterSlug);
    if (!chapter) throw new Error("Chapter content not found.");
  } catch (err: any) {
    console.error("Chapter Content API Error:", err);
    error = err.message || "Failed to load chapter content.";
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center pt-20 text-center px-4">
        <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
        <h1 className="text-2xl font-bold text-white mb-4">Error Loading Chapter</h1>
        <p className="text-slate-400 mb-8">{error}</p>
        <Link href={`/novel/${animeId}`} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors">
          Return to Novel
        </Link>
      </div>
    );
  }

  if (!chapter) {
    return <div className="min-h-screen bg-[#09090b] pt-32 text-center text-white">Loading...</div>;
  }

  const novelTitle = novel ? (novel.title_english || novel.title) : "Novel";

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#09090b] text-[#e5e5e5]">
        {/* Sticky Header */}
        <header className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between">
          <Link href={`/novel/${animeId}`} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium hidden sm:inline">Back to {novelTitle}</span>
            <span className="font-medium sm:hidden">Back</span>
          </Link>
          
          <div className="flex items-center gap-2 flex-1 justify-center px-4 overflow-hidden">
            <BookOpen className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <h1 className="text-sm sm:text-base font-bold truncate max-w-[200px] sm:max-w-md">
              {chapter.title}
            </h1>
          </div>
          
          <div className="w-10 sm:w-32 flex justify-end">
            {/* Placeholder for future reader settings (font size, theme) */}
          </div>
        </header>

        {/* Reader Content - Extracted to a client component for interactive controls (font size, etc.) */}
        <NovelReaderContent 
          chapter={chapter} 
          novelId={animeId} 
          novelSlug={novelSlug} 
        />
        
        {/* Navigation Footer */}
        <footer className="border-t border-white/5 py-8 mt-12 bg-black/20">
          <div className="container mx-auto px-4 flex items-center justify-between max-w-4xl">
            {chapter.prevChapter ? (
              <Link 
                href={`/novel/${animeId}/read/${chapter.prevChapter}?novelSlug=${novelSlug}`}
                className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="font-medium hidden sm:inline">Previous Chapter</span>
                <span className="font-medium sm:hidden">Prev</span>
              </Link>
            ) : (
              <div className="px-6 py-3 opacity-30 cursor-not-allowed flex items-center gap-2">
                <ChevronLeft className="w-5 h-5" />
                <span className="font-medium hidden sm:inline">Previous Chapter</span>
                <span className="font-medium sm:hidden">Prev</span>
              </div>
            )}
            
            <Link href={`/novel/${animeId}`} className="p-3 text-slate-500 hover:text-white transition-colors">
              <BookOpen className="w-6 h-6" />
            </Link>
            
            {chapter.nextChapter ? (
              <Link 
                href={`/novel/${animeId}/read/${chapter.nextChapter}?novelSlug=${novelSlug}`}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-colors"
              >
                <span className="font-medium hidden sm:inline">Next Chapter</span>
                <span className="font-medium sm:hidden">Next</span>
                <ChevronRight className="w-5 h-5" />
              </Link>
            ) : (
              <div className="px-6 py-3 opacity-30 cursor-not-allowed flex items-center gap-2">
                <span className="font-medium hidden sm:inline">Next Chapter</span>
                <span className="font-medium sm:hidden">Next</span>
                <ChevronRight className="w-5 h-5" />
              </div>
            )}
          </div>
        </footer>
      </div>
    </PageTransition>
  );
}
