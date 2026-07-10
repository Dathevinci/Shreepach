import PageTransition from "@/components/layout/PageTransition";
import NovelReader from "./NovelReader";
import { getNovelDetails, getNovelChapters } from "@/lib/novel-api";

export default async function ReadChapterPage({ params }: { params: Promise<{ id: string, chapterId: string }> }) {
  const resolvedParams = await params;
  let novel = null;
  let chapters = [];
  let content = "";
  
  try {
    novel = await getNovelDetails(parseInt(resolvedParams.id, 10));
    if (novel) {
      chapters = await getNovelChapters(novel.title.romaji || novel.title.english);
    }
    const { getNovelChapterContent } = await import('@/lib/novel-api');
    content = await getNovelChapterContent(resolvedParams.chapterId);
  } catch (err) {
    console.error("Error fetching reading data:", err);
  }

  if (!novel) {
    return <div className="min-h-screen pt-40 text-center text-white">Novel not found</div>;
  }

  const currentChapter = chapters.find((c: any) => c.id === resolvedParams.chapterId) || {
    id: resolvedParams.chapterId,
    title: `Chapter ${resolvedParams.chapterId}`
  };

  return (
    <PageTransition>
      <div className="pb-20 pt-24 min-h-screen bg-[#09090b] px-4 sm:px-6">
        <NovelReader novel={novel} chapters={chapters} chapterId={resolvedParams.chapterId} currentChapterTitle={currentChapter.title} initialContent={content} />
      </div>
    </PageTransition>
  );
}
