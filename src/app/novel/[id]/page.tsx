import PageTransition from "@/components/layout/PageTransition";
import Link from "next/link";
import { BookOpen, List, ChevronRight } from "lucide-react";
import ResumeReading from "./ResumeReading";
import { getNovelDetails, getNovelChapters } from "@/lib/novel-api";

export default async function NovelDetails({ params }: { params: { id: string } }) {
  const novelId = parseInt(params.id, 10);
  if (isNaN(novelId)) return <div className="min-h-screen pt-40 text-center text-white">Invalid Novel ID</div>;

  let novel = null;
  let chapters = [];

  try {
    novel = await getNovelDetails(novelId);
    if (novel) {
      chapters = await getNovelChapters(novel.title.romaji || novel.title.english);
    }
  } catch (err) {
    console.error("Error fetching novel details:", err);
  }

  if (!novel) {
    return <div className="min-h-screen pt-40 text-center text-white">Novel not found</div>;
  }

  return (
    <PageTransition>
      <div className="pb-20 pt-32 min-h-screen bg-[#09090b] px-4 sm:px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3 shrink-0">
              <img 
                src={novel.coverImage?.extraLarge || novel.coverImage?.large} 
                alt={novel.title.userPreferred || novel.title.english} 
                className="w-full rounded-2xl shadow-2xl border border-white/10" 
              />
            </div>
            <div className="flex-1 text-white">
              <h1 className="text-4xl md:text-5xl font-cinzel font-bold mb-4">{novel.title.userPreferred || novel.title.english}</h1>
              <div 
                className="text-slate-400 mb-6 text-lg font-garamond"
                dangerouslySetInnerHTML={{ __html: novel.description || "No description available." }}
              />
              
              <div className="mb-8">
                <ResumeReading novelId={params.id} chapters={chapters} />
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                  <List className="w-6 h-6 text-indigo-400" />
                  Chapters
                </h2>
                <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                  {chapters.map((chapter: any, index: number) => (
                    <Link 
                      key={chapter.id} 
                      href={`/novel/${params.id}/read/${chapter.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-white/10 transition border border-transparent hover:border-white/10 group"
                    >
                      <span className="font-medium text-slate-200 group-hover:text-indigo-300 transition line-clamp-1 pr-4">
                        {chapter.title || `Chapter ${chapter.number || index + 1}`}
                      </span>
                      <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition transform group-hover:translate-x-1 shrink-0" />
                    </Link>
                  ))}
                  {chapters.length === 0 && (
                    <p className="text-slate-500 italic">No chapters available yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
