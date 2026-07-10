async function t() {
  // Try different gogocdn domains
  const domains = [
    'ajax.gogo-load.com',
    'ajax.gogocdn.com', 
    'ajax.gogoapi.net',
  ];
  
  for (const domain of domains) {
    try {
      const url = `https://${domain}/ajax/load-list-episode?ep_start=0&ep_end=100&id=2897&default_ep=0&alias=black-torch`;
      const r = await fetch(url, { signal: AbortSignal.timeout(5000) });
      const text = await r.text();
      const hasEp = text.includes('episode');
      console.log(domain + ':', r.status, hasEp ? 'HAS EPISODES' : text.substring(0, 100));
    } catch(e) {
      console.log(domain + ':', e.message.substring(0, 60));
    }
  }
  
  // Also try an entirely different approach: use AniList to get streaming links
  // Many anime pages on AniList have streaming episode links
  // The user's app already uses _streamingEpisodes from AniList
  
  // Try another free anime API: kitsu
  try {
    const r = await fetch('https://kitsu.app/api/edge/anime?filter[text]=Black+Torch&page[limit]=3');
    const d = await r.json();
    console.log('\nKitsu search:', d.data?.length, 'results');
    if (d.data?.length > 0) {
      console.log('First:', d.data[0].attributes.canonicalTitle);
    }
  } catch(e) {
    console.log('Kitsu:', e.message);
  }
}
t();
