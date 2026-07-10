import PageTransition from "@/components/layout/PageTransition";
import Link from "next/link";
import { BookOpen } from "lucide-react";

export const revalidate = 60;

export default async function Home() {
  let novels = [];
  try {
    // Next 15 requires fetching via full URL, process.env.NEXT_PUBLIC_API_URL must be set
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/novels`, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      novels = data.data || [];
    }
  } catch (err) {
    console.error("Failed to fetch novels:", err);
  }

  return (
    <PageTransition>
      <div className="pb-20 pt-32 min-h-screen bg-black/40 backdrop-blur-sm px-4 sm:px-6">
        <div className="container mx-auto">
          <h1 className="text-4xl font-cinzel font-bold text-white mb-8 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-indigo-400" />
            Explore Novels
          </h1>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {novels.map((novel: any) => (
              <Link key={novel.id} href={`/novel/${novel.id}`} className="group relative block aspect-[2/3] rounded-xl overflow-hidden shadow-lg border border-white/10 hover:border-indigo-500/50 transition">
                <img 
                  src={novel.coverUrl} 
                  alt={novel.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-4">
                  <h3 className="text-white font-bold text-sm line-clamp-2">{novel.title}</h3>
                </div>
              </Link>
            ))}
          </div>

          {novels.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              No novels found in the database.
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
