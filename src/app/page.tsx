import { getDashboardNovels } from "@/lib/novels";

import AnimeCarousel from "@/components/anime/AnimeCarousel";
import HeroBannerCarousel from "@/components/anime/HeroBannerCarousel";
import { AlertTriangle } from "lucide-react";
import PageTransition from "@/components/layout/PageTransition";
import ContinueWatchingCarousel from "@/components/anime/ContinueWatchingCarousel";

// Revalidate the dashboard frequently so a transient API outage can't leave a
// stale "empty feed" cached for long — it recovers within ~1 minute.
export const revalidate = 60;

export default async function Home() {
  let data = null;
  try {
    data = await getDashboardNovels();
  } catch (err) {
    console.error("Dashboard API Error:", err);
  }

  if (!data) {
    return (
      <div className="min-h-screen pt-40 pb-20 px-4 flex flex-col items-center justify-center bg-[#09090b] text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-6 animate-pulse" />
        <h1 className="text-3xl font-black text-white mb-4">Database Offline</h1>
        <p className="text-slate-400 max-w-md mx-auto text-lg">
          The primary API is currently experiencing severe stability issues.
        </p>
        <p className="text-slate-500 max-w-md mx-auto mt-4">
          We are actively monitoring the situation and your service will automatically resume the moment their servers are back online. Thank you for your patience!
        </p>
      </div>
    );
  }

  // Shuffle the trending novels for the hero banner so it changes every time
  const shuffledTrending = [...data.trending.media].sort(() => 0.5 - Math.random());
  const heroAnimes = shuffledTrending.slice(0, 5);

  return (
    <PageTransition>
      <div className="pb-20 min-h-screen bg-black/40 backdrop-blur-sm">
      {data.isFallback && (
        <div className="relative z-30 bg-amber-500/10 border-b border-amber-500/20 text-amber-300 text-xs sm:text-sm font-medium text-center py-2 px-4">
          AniList is currently unavailable — showing backup data.
        </div>
      )}
      {/* Cinematic Dashboard Hero */}
      <HeroBannerCarousel animes={heroAnimes} />

      {/* Carousels */}
      <div className="relative z-20 space-y-4 pt-2">
        <ContinueWatchingCarousel />
        
        {(() => {
          const seen = new Set<number>();
          
          const filterUnique = (animes: any[]) => {
            return animes.filter(a => {
              if (seen.has(a.mal_id)) return false;
              seen.add(a.mal_id);
              return true;
            });
          };

          const trending = filterUnique(data.trending?.media || []);
          const popular = filterUnique(data.popular?.media || []);
          const topRated = filterUnique(data.topRated?.media || []);

          return (
            <>
              {trending.length > 0 && <AnimeCarousel title="Trending Novels" animes={trending} seeAllLink="/explore?sort=trending" />}
              {popular.length > 0 && <AnimeCarousel title="Popular Novels" animes={popular} seeAllLink="/explore?sort=popularity" />}
              {topRated.length > 0 && <AnimeCarousel title="Top Rated Novels" animes={topRated} seeAllLink="/explore?sort=score" />}
            </>
          );
        })()}
      </div>
    </div>
    </PageTransition>
  );
}
