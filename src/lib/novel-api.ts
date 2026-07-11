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

const BACKEND_API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function getNovelChapters(title: string) {
  try {
    const res = await fetch(`${BACKEND_API}/novels?title=${encodeURIComponent(title)}`);
    if (!res.ok) throw new Error("Failed to fetch from backend");
    
    const json = await res.json();
    if (json.success && json.data && json.data.length > 0) {
      // Find exact match or use first match
      const novel = json.data.find((n: any) => n.title.toLowerCase() === title.toLowerCase()) || json.data[0];
      return novel.chapters || [];
    }
    
    return []; // No chapters found in DB
  } catch (err) {
    console.error("Backend fetch failed:", err);
    return [];
  }
}

export async function getNovelChapterContent(chapterId: string) {
  try {
    const res = await fetch(`${BACKEND_API}/novels/any/chapter/${chapterId}`);
    if (!res.ok) throw new Error("Failed to fetch chapter from backend");
    
    const json = await res.json();
    if (json.success && json.data) {
      return json.data.content;
    }
    
    return "Chapter content not found in database.";
  } catch (err) {
    console.error("Backend chapter fetch failed:", err);
    return "Failed to load chapter content due to server error.";
  }
}
