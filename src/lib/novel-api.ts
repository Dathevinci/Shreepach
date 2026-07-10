const ANILIST_API = "https://graphql.anilist.co";
const CONSUMET_API = "https://consumet-api-clone.vercel.app";

// Helper to query AniList for NOVELS
async function anilistNovelQuery(query: string, variables: Record<string, any> = {}, revalidate = 3600) {
  const res = await fetch(ANILIST_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate },
  });
  if (!res.ok) throw new Error("Failed to fetch from AniList");
  const json = await res.json();
  if (json.errors) throw new Error(`AniList Error: ${json.errors[0]?.message}`);
  return json.data;
}

export async function getTrendingNovels(page = 1, perPage = 18) {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: MANGA, format: NOVEL, sort: TRENDING_DESC) {
          id
          title { romaji english userPreferred }
          description
          coverImage { extraLarge large color }
          genres
          averageScore
        }
      }
    }
  `;
  const data = await anilistNovelQuery(query, { page, perPage });
  return data?.Page?.media || [];
}

export async function getPopularNovels(page = 1, perPage = 18) {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: MANGA, format: NOVEL, sort: POPULARITY_DESC) {
          id
          title { romaji english userPreferred }
          description
          coverImage { extraLarge large color }
          genres
          averageScore
        }
      }
    }
  `;
  const data = await anilistNovelQuery(query, { page, perPage });
  return data?.Page?.media || [];
}

export async function getNovelDetails(id: number) {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: MANGA, format: NOVEL) {
        id
        title { romaji english userPreferred }
        description
        coverImage { extraLarge large color }
        bannerImage
        genres
        status
        averageScore
        staff { edges { node { name { full } } role } }
      }
    }
  `;
  const data = await anilistNovelQuery(query, { id });
  return data?.Media;
}

// -------------------------------------------------------------
// AUTO-SCRAPING API FOR CHAPTERS
// -------------------------------------------------------------

export async function getNovelChapters(title: string) {
  try {
    // Attempt to search Consumet for the novel to get chapter list
    // The Consumet public instances are often rate-limited or down, 
    // so we handle errors gracefully.
    const searchRes = await fetch(`${CONSUMET_API}/light-novels/readlightnovels/search?keyword=${encodeURIComponent(title)}`);
    if (!searchRes.ok) throw new Error("Consumet search failed");
    
    const searchData = await searchRes.json();
    if (!searchData || searchData.length === 0) throw new Error("Novel not found in scraper");
    
    const novelId = searchData[0].id;
    
    const infoRes = await fetch(`${CONSUMET_API}/light-novels/readlightnovels/info?id=${novelId}`);
    if (!infoRes.ok) throw new Error("Consumet info failed");
    
    const infoData = await infoRes.json();
    return infoData.chapters || [];
  } catch (err) {
    console.error("Auto-scraper failed:", err);
    // Fallback: Generate dummy chapters for the UI so the site is still usable
    // if the scraping API goes down (which is very common for novel APIs).
    return Array.from({ length: 20 }, (_, i) => ({
      id: `chapter-${i + 1}`,
      title: `Chapter ${i + 1}`,
      chapterNum: i + 1,
    }));
  }
}

export async function getNovelChapterContent(chapterId: string) {
  try {
    // If it's our fallback dummy chapter, return dummy content
    if (chapterId.startsWith("chapter-")) {
      return `This is auto-generated fallback content because the scraping API is currently experiencing a Cloudflare block or downtime.\n\nYou are reading ${chapterId.replace('-', ' ')}.\n\nImagine an epic story taking place here! The hero draws their sword, the magic surges through the air, and the destiny of the world is decided in this very moment.`;
    }

    const res = await fetch(`${CONSUMET_API}/light-novels/readlightnovels/read?chapterId=${chapterId}`);
    if (!res.ok) throw new Error("Consumet read failed");
    
    const data = await res.json();
    return data.text || data.content || "No content found.";
  } catch (err) {
    console.error("Auto-scraper content failed:", err);
    return "Failed to load chapter content due to upstream API error.";
  }
}
