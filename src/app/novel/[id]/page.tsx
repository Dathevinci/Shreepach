import PageTransition from "@/components/layout/PageTransition";
import Link from "next/link";
import { BookOpen, List, ChevronRight } from "lucide-react";
import ResumeReading from "./ResumeReading";

export default async function NovelDetails({ params }: { params: { id: string } }) {
  let novel = null;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/novels/${params.id}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      novel = data.data;
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
              <img src={novel.coverUrl} alt={novel.title} className="w-full rounded-2xl shadow-2xl border border-white/10" />
            </div>
            <div className="flex-1 text-white">
              <h1 className="text-4xl md:text-5xl font-cinzel font-bold mb-4">{novel.title}</h1>
              <p className="text-slate-400 mb-6 text-lg">{novel.description}</p>
              
              <div className="mb-8">
                <ResumeReading novel={novel} />
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                  <List className="w-6 h-6 text-indigo-400" />
                  Chapters
                </h2>
                <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                  {novel.chapters.map((chapter: any) => (
                    <Link 
                      key={chapter.id} 
                      href={`/novel/${novel.id}/read/${chapter.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-white/10 transition border border-transparent hover:border-white/10 group"
                    >
                      <span className="font-medium text-slate-200 group-hover:text-indigo-300 transition">
                        Chapter {chapter.chapterNum}: {chapter.title}
                      </span>
                      <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition transform group-hover:translate-x-1" />
                    </Link>
                  ))}
                  {novel.chapters.length === 0 && (
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
