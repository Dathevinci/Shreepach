"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import Link from "next/link";
import { Play } from "lucide-react";

export default function ResumeReading({ novelId, chapters }: { novelId: string, chapters: any[] }) {
  const { user } = useUser();
  const [bookmark, setBookmark] = useState<any>(null);

  useEffect(() => {
    if (user?.id) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/novels/${novelId}/bookmark/${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            setBookmark(data.data);
          }
        })
        .catch(console.error);
    }
  }, [user, novelId]);

  let targetChapter = chapters[0];
  if (bookmark?.lastReadChapter) {
    const bookmarked = chapters.find((c: any) => c.id === bookmark.lastReadChapter);
    if (bookmarked) {
      targetChapter = bookmarked;
    }
  }

  if (!targetChapter) return null;

  return (
    <Link 
      href={`/novel/${novelId}/read/${targetChapter.id}`}
      className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-indigo-500/30 transition transform hover:-translate-y-1 mt-4"
    >
      <Play className="w-5 h-5" />
      {bookmark ? `Resume Reading` : 'Start Reading'}
    </Link>
  );
}
