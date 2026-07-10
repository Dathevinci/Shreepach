"use client";

import { useEffect, useState, useRef } from "react";
import { useUser } from "@/hooks/useUser";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

export default function NovelReader({ novel, chapter }: { novel: any, chapter: any }) {
  const { user } = useUser();
  const [content, setContent] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  const currentIndex = novel.chapters.findIndex((c: any) => c.id === chapter.id);
  const prevChapter = currentIndex > 0 ? novel.chapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < novel.chapters.length - 1 ? novel.chapters[currentIndex + 1] : null;

  useEffect(() => {
    setContent(chapter.content);

    if (user?.id) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/novels/${novel.id}/bookmark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, chapterId: chapter.id })
      }).catch(console.error);
    }
  }, [user, novel.id, chapter.id, chapter.content]);

  return (
    <div className="container mx-auto max-w-3xl">
      <div className="mb-8 flex items-center justify-between">
        <Link href={`/novel/${novel.id}`} className="text-slate-400 hover:text-white flex items-center gap-2 transition">
          <ArrowLeft className="w-5 h-5" />
          Back to {novel.title}
        </Link>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-10 mb-8 shadow-2xl">
        <h1 className="text-2xl sm:text-4xl font-bold font-cinzel text-white mb-8 border-b border-white/10 pb-6 text-center">
          Chapter {chapter.chapterNum}: {chapter.title}
        </h1>
        
        <div 
          ref={contentRef}
          className="prose prose-invert prose-lg sm:prose-xl max-w-none font-garamond leading-relaxed text-slate-300"
          dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/><br/>') }}
        />
      </div>

      <div className="flex justify-between items-center pb-10">
        {prevChapter ? (
          <Link href={`/novel/${novel.id}/read/${prevChapter.id}`} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-indigo-600 transition text-white font-medium border border-white/10">
            <ChevronLeft className="w-5 h-5" /> Previous
          </Link>
        ) : <div />}
        
        {nextChapter ? (
          <Link href={`/novel/${novel.id}/read/${nextChapter.id}`} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-indigo-600 transition text-white font-medium border border-white/10">
            Next <ChevronRight className="w-5 h-5" />
          </Link>
        ) : <div />}
      </div>
    </div>
  );
}
