import PageTransition from "@/components/layout/PageTransition";
import NovelReader from "./NovelReader";
import { getNovelDetails, getNovelChapters } from "@/lib/novel-api";

export default async function ReadChapterPage({ params }: { params: { id: string, chapterId: string } }) {
  let novel = null;
  let chapters = [];
  let content = "";
  
  try {
    novel = await getNovelDetails(parseInt(params.id, 10));
    if (novel) {
      chapters = await getNovelChapters(novel.title.romaji || novel.title.english);
    }
    const { getNovelChapterContent } = await import('@/lib/novel-api');
    content = await getNovelChapterContent(params.chapterId);
  } catch (err) {
    console.error("Error fetching reading data:", err);
  }

  if (!novel) {
    return <div className="min-h-screen pt-40 text-center text-white">Novel not found</div>;
  }

  const currentChapter = chapters.find((c: any) => c.id === params.chapterId) || {
    id: params.chapterId,
    title: `Chapter ${params.chapterId}`
  };

  return (
    <PageTransition>
      <div className="pb-20 pt-24 min-h-screen bg-[#09090b] px-4 sm:px-6">
        <NovelReader novel={novel} chapters={chapters} chapterId={params.chapterId} currentChapterTitle={currentChapter.title} initialContent={content} />
      </div>
    </PageTransition>
  );
}
