// In-memory cache for live status to prevent YouTube rate-limiting
let liveStatusCache = global.liveStatusCache;
if (!liveStatusCache) {
  liveStatusCache = global.liveStatusCache = new Map(); // videoId -> { isLive: boolean, lastChecked: timestamp }
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

async function scrapeYouTubeLiveStatus(videoId) {
  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      }
    });

    if (!res.ok) return false;

    const html = await res.text();
    return html.includes('"isLive":true') || html.includes('"isLiveBroadcast":true');
  } catch (err) {
    console.error("❌ Failed scraping live status:", err);
    return false;
  }
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const videoId = url.searchParams.get("videoId");

    if (!videoId || videoId.length !== 11) {
      return Response.json({ success: false, error: "Invalid or missing videoId" }, { status: 400 });
    }

    const now = Date.now();
    const cached = liveStatusCache.get(videoId);

    // Serve from cache if fresh
    if (cached && (now - cached.lastChecked < CACHE_TTL_MS)) {
      return Response.json({ success: true, isLive: cached.isLive, cached: true });
    }

    let isLive = false;
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (apiKey) {
      try {
        const apiRes = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`
        );
        if (apiRes.ok) {
          const data = await apiRes.json();
          const item = data.items?.[0];
          isLive = item?.snippet?.liveBroadcastContent === "live";
        } else {
          console.warn("⚠️ YouTube API failed. Falling back to scraping.");
          isLive = await scrapeYouTubeLiveStatus(videoId);
        }
      } catch (apiErr) {
        console.error("❌ YouTube API error:", apiErr);
        isLive = await scrapeYouTubeLiveStatus(videoId);
      }
    } else {
      isLive = await scrapeYouTubeLiveStatus(videoId);
    }

    // Cache the result
    liveStatusCache.set(videoId, {
      isLive,
      lastChecked: now
    });

    return Response.json({ success: true, isLive });
  } catch (error) {
    console.error("Error checking live status:", error);
    return Response.json({ success: false, isLive: false, error: error.message });
  }
}
