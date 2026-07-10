import PageTransition from "@/components/layout/PageTransition";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { getTrendingNovels, getPopularNovels } from "@/lib/novel-api";

export const revalidate = 3600;

export default async function Home() {
  let trending = [];
  let popular = [];

  try {
    trending = await getTrendingNovels();
    popular = await getPopularNovels();
  } catch (err) {
    console.error("Failed to fetch novels:", err);
  }

  const renderNovelGrid = (novels: any[], title: string, icon: any) => (
    <div className="mb-12">
      <h2 className="text-2xl font-cinzel font-bold text-white mb-6 flex items-center gap-3">
        {icon}
        {title}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {novels.map((novel: any) => (
          <Link key={novel.id} href={`/novel/${novel.id}`} className="group relative block aspect-[2/3] rounded-xl overflow-hidden shadow-lg border border-white/10 hover:border-indigo-500/50 transition">
            <img 
              src={novel.coverImage?.extraLarge || novel.coverImage?.large} 
              alt={novel.title.userPreferred || novel.title.english} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-4">
              <h3 className="text-white font-bold text-sm line-clamp-2">{novel.title.userPreferred || novel.title.english}</h3>
            </div>
            
            {/* Quick stats on hover */}
            <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex justify-between text-xs font-medium text-white/90">
                {novel.averageScore && <span>⭐ {novel.averageScore}%</span>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <PageTransition>
      <div className="pb-20 pt-32 min-h-screen bg-black/40 backdrop-blur-sm px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="mb-12 text-center max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-4">
              Discover Light Novels
            </h1>
            <p className="text-slate-400 text-lg font-garamond">
              Explore the highest rated and trending novels, automatically fetched from AniList and synced with external reading sources.
            </p>
          </div>
          
          {trending.length > 0 && renderNovelGrid(trending, "Trending Now", <BookOpen className="w-6 h-6 text-indigo-400" />)}
          {popular.length > 0 && renderNovelGrid(popular, "All Time Popular", <BookOpen className="w-6 h-6 text-purple-400" />)}

          {trending.length === 0 && popular.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              No novels found. AniList API might be down.
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
