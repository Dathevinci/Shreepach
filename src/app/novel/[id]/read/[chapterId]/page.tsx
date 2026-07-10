import PageTransition from "@/components/layout/PageTransition";
import NovelReader from "./NovelReader";

export default async function ReadChapterPage({ params }: { params: { id: string, chapterId: string } }) {
  let chapter = null;
  let novel = null;
  
  try {
    const novelRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/novels/${params.id}`, { cache: "no-store" });
    if (novelRes.ok) {
      const data = await novelRes.json();
      novel = data.data;
    }

    const chapterRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/novels/${params.id}/chapter/${params.chapterId}`, { cache: "no-store" });
    if (chapterRes.ok) {
      const data = await chapterRes.json();
      chapter = data.data;
    }
  } catch (err) {
    console.error("Error fetching reading data:", err);
  }

  if (!chapter || !novel) {
    return <div className="min-h-screen pt-40 text-center text-white">Chapter not found</div>;
  }

  return (
    <PageTransition>
      <div className="pb-20 pt-24 min-h-screen bg-[#09090b] px-4 sm:px-6">
        <NovelReader novel={novel} chapter={chapter} />
      </div>
    </PageTransition>
  );
}
