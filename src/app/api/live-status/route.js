/**
 * Live Status API Route
 * Checks if a YouTube video is currently a live broadcast
 * GET - returns { isLive: true | false }
 */

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const videoId = url.searchParams.get("videoId");

    if (!videoId || videoId.length !== 11) {
      return Response.json({ success: false, error: "Invalid or missing videoId" }, { status: 400 });
    }

    // Fetch the YouTube watch page
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
      next: { revalidate: 15 } // Cache check results for 15 seconds to avoid spamming YouTube
    });

    if (!res.ok) {
      return Response.json({ success: true, isLive: false });
    }

    const html = await res.text();
    
    // Check if the video is currently live
    // YouTube includes `"isLive":true` or `"isLiveBroadcast":true` in its initial player JSON in the HTML
    const isLive = html.includes('"isLive":true') || html.includes('"isLiveBroadcast":true');

    return Response.json({ success: true, isLive });
  } catch (error) {
    console.error("Error checking live status:", error);
    return Response.json({ success: false, isLive: false, error: error.message });
  }
}
