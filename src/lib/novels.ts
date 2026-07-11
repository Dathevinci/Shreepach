import type { Anime } from '@tutkli/jikan-ts';

const ANILIST_API = "https://graphql.anilist.co";
const NOVEL_API = process.env.NEXT_PUBLIC_NOVEL_API_URL || "http://localhost:3001";

// ═══════════════════════════════════════════════════════════
// HYBRID DATA FETCHING: AniList for Metadata, Local API for Chapters
// ═══════════════════════════════════════════════════════════

async function anilistQuery(query: string, variables: Record<string, any> = {}, revalidate = 86400): Promise<any> {
  const res = await fetch(ANILIST_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "User-Agent": "ShreepachTracker/1.0 (+https://dathevinci.vercel.app)",
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AniList API error: ${res.status} — ${text}`);
  }
  const json = await res.json();
  if (json.errors) throw new Error(`AniList GraphQL error: ${json.errors[0]?.message}`);
  return json.data;
}

// Map AniList response to the UI's Anime/Media interface (re-using it to minimize UI breakage)
function mapAniListNovel(media: any): Anime {
  if (!media) return media;
  const banner = media.bannerImage || media.coverImage?.extraLarge || media.coverImage?.large || "";
  return {
    mal_id: media.id, // Using AniList ID as the primary ID
    url: media.siteUrl || "",
    images: {
      jpg: {
        image_url: media.coverImage?.large || "",
        large_image_url: media.coverImage?.extraLarge || media.coverImage?.large || "",
        small_image_url: media.coverImage?.medium || "",
      },
      webp: { image_url: "", large_image_url: "", small_image_url: "" },
    },
    trailer: {
      youtube_id: null, url: null, embed_url: null,
      images: { maximum_image_url: banner, image_url: "", small_image_url: "", medium_image_url: "", large_image_url: banner },
    },
    title: media.title?.english || media.title?.romaji || media.title?.native || "Unknown",
    title_english: media.title?.english,
    title_japanese: media.title?.native,
    type: media.format || "NOVEL",
    episodes: media.chapters, // Map chapters to episodes for UI compatibility
    status: media.status,
    duration: "Read",
    score: media.averageScore ? media.averageScore / 10 : null,
    synopsis: (media.description || "").replace(/<[^>]*>?/gm, ""),
    season: null,
    year: media.startDate?.year,
    genres: (media.genres || []).map((g: string) => ({ mal_id: 0, type: "novel", name: g, url: "" })),
    studios: [],
    _anilistStatus: media.status,
    _malId: media.id,
  } as unknown as Anime;
}

const isSafeMedia = (media: any): boolean =>
  !!media && !media.isAdult && !(media.genres || []).some((g: string) => (g || "").toLowerCase() === "hentai");

const DASH_FRAGMENT = `
  id idMal
  title { romaji english native }
  coverImage { extraLarge large medium }
  bannerImage
  description(asHtml: false)
  format chapters status startDate { year }
  averageScore genres isAdult
  siteUrl
`;

export async function getDashboardNovels() {
  const query = `
    query {
      trending: Page(page: 1, perPage: 20) { media(sort: TRENDING_DESC, type: MANGA, format: NOVEL, isAdult: false) { ${DASH_FRAGMENT} } }
      popular: Page(page: 1, perPage: 20) { media(sort: POPULARITY_DESC, type: MANGA, format: NOVEL, isAdult: false) { ${DASH_FRAGMENT} } }
      topRated: Page(page: 1, perPage: 20) { media(sort: SCORE_DESC, type: MANGA, format: NOVEL, isAdult: false) { ${DASH_FRAGMENT} } }
    }
  `;

  const data = await anilistQuery(query, {}, 300);
  const map = (arr: any[]) => (arr || []).filter(isSafeMedia).map(mapAniListNovel);

  return {
    trending: { media: map(data.trending?.media) },
    popular: { media: map(data.popular?.media) },
    topRated: { media: map(data.topRated?.media) },
    isFallback: false,
  };
}

export async function getNovelDetails(id: number): Promise<Anime> {
  const query = `query ($id: Int) { Media(id: $id, type: MANGA, format: NOVEL) { ${DASH_FRAGMENT} } }`;
  const data = await anilistQuery(query, { id }, 300);
  if (data?.Media) return mapAniListNovel(data.Media);
  throw new Error("Novel not found on AniList");
}

export async function searchNovels(variables: any) {
  const gql = `
    query ($page: Int, $search: String, $sort: [MediaSort]) {
      Page(page: $page, perPage: 20) {
        pageInfo { total perPage currentPage lastPage hasNextPage }
        media(type: MANGA, format: NOVEL, isAdult: false, search: $search, sort: $sort) {
          ${DASH_FRAGMENT}
        }
      }
    }
  `;

  const v: any = { page: variables.page || 1 };
  if (variables.search) v.search = variables.search;
  
  v.sort = variables.sort?.length ? variables.sort : (variables.search ? ["SEARCH_MATCH"] : ["POPULARITY_DESC"]);

  try {
    const data = await anilistQuery(gql, v, 300);
    return {
      Page: {
        media: (data.Page?.media || []).filter(isSafeMedia).map(mapAniListNovel),
        pageInfo: data.Page?.pageInfo,
      },
    };
  } catch (err) {
    console.error("AniList search failed:", err);
    return { Page: { media: [], pageInfo: null } };
  }
}

// ═══════════════════════════════════════════════════════════
// Chapter Fetching via Local manga-novel-api (NovelFull Scraper)
// ═══════════════════════════════════════════════════════════

/**
 * Searches the local API using the novel's title to find its slug on NovelFull.
 */
export async function getNovelSlugFromTitle(title: string): Promise<string | null> {
  const query = encodeURIComponent(title);
  try {
    const res = await fetch(`${NOVEL_API}/api/novels/search?q=${query}&_t=1`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const json = await res.json();
    
    if (json && json.length > 0) {
      // Normalize a title into comparable words (lowercase, remove punctuation, filter short words)
      const normalize = (t: string) => 
        t.toLowerCase()
         .replace(/[^a-z0-9\s]/gi, ' ')  // strip all punctuation
         .split(/\s+/)
         .filter(w => w.length > 2);      // only words with 3+ chars
      
      const searchWords = normalize(title);
      if (searchWords.length === 0) return null;
      
      let bestMatch: { slug: string; score: number } | null = null;
      
      for (const result of json) {
        const resultWords = normalize(result.title);
        
        // Count how many search words appear in the result title
        const matchingWords = searchWords.filter(sw => 
          resultWords.some(rw => rw === sw || rw.includes(sw) || sw.includes(rw))
        );
        
        // Score = percentage of search words that matched
        const score = matchingWords.length / searchWords.length;
        
        // Also check if result title is contained in search or vice versa (handles exact substring matches)
        const searchLower = title.toLowerCase().replace(/[^a-z0-9\s]/gi, '').trim();
        const resultLower = result.title.toLowerCase().replace(/[^a-z0-9\s]/gi, '').trim();
        const isSubstring = searchLower.includes(resultLower) || resultLower.includes(searchLower);
        
        // Accept if: 40%+ words match, OR it's a substring match with at least 2 matching words
        const isGoodMatch = score >= 0.4 || (isSubstring && matchingWords.length >= 2);
        
        if (isGoodMatch && (!bestMatch || score > bestMatch.score)) {
          bestMatch = { slug: result.slug, score };
        }
      }
      
      return bestMatch?.slug || null;
    }
    return null;
  } catch (err: any) {
    console.error("Failed to fetch slug from manga-novel-api:", err);
    throw new Error("Cannot connect to Manga Novel API. Is it running?");
  }
}

export async function getNovelChapters(slug: string, page = 1) {
  try {
    const res = await fetch(`${NOVEL_API}/api/novels/${slug}/chapters?page=${page}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return await res.json(); // Expected format: { chapters: [...], page, totalPages }
  } catch (err) {
    console.error("Failed to fetch chapters from manga-novel-api:", err);
    return null;
  }
}

export async function getChapterContent(novelSlug: string, chapterSlug: string) {
  try {
    const res = await fetch(`${NOVEL_API}/api/novels/${novelSlug}/chapters/${chapterSlug}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return await res.json(); // Expected format: { title, content, prevChapter, nextChapter }
  } catch (err) {
    console.error("Failed to fetch chapter content:", err);
    return null;
  }
}
