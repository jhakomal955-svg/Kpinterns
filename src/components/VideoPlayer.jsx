"use client";

import { useEffect, useRef, useState } from "react";
import "plyr/dist/plyr.css";

/**
 * Reusable video player wrapper using Plyr.io
 * Skins YouTube and standard video links with a consistent premium UI,
 * hiding default branding, share options, and right-click menus.
 * Includes optional side-panel integration for YouTube Live Chat.
 */
export default function VideoPlayer({ videoUrl }) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const [showChat, setShowChat] = useState(false);

  // Extract YouTube ID from various YouTube URL formats
  const getYouTubeId = (url) => {
    if (!url) return null;
    let videoId = null;
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes("youtube.com") || urlObj.hostname.includes("youtu.be")) {
        if (urlObj.hostname.includes("youtu.be")) {
          videoId = urlObj.pathname.substring(1);
        } else if (urlObj.pathname.includes("/embed/")) {
          videoId = urlObj.pathname.split("/embed/")[1]?.split(/[?#]/)[0];
        } else if (urlObj.pathname.includes("/shorts/")) {
          videoId = urlObj.pathname.split("/shorts/")[1]?.split(/[?#]/)[0];
        } else {
          videoId = urlObj.searchParams.get("v");
        }
      }
    } catch (e) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      if (match && match[2].length === 11) {
        videoId = match[2];
      }
    }
    return videoId;
  };

  const videoId = getYouTubeId(videoUrl);

  useEffect(() => {
    if (!containerRef.current) return;

    let isMounted = true;
    let playerInstance = null;

    // Dynamically import Plyr to prevent server-side ReferenceError: document is not defined
    import("plyr").then(({ default: Plyr }) => {
      if (!isMounted || !containerRef.current) return;

      // Clear previous elements
      containerRef.current.innerHTML = "";

      if (videoId) {
        // YouTube embed setup
        const playerDiv = document.createElement("div");
        playerDiv.dataset.plyrProvider = "youtube";
        playerDiv.dataset.plyrEmbedId = videoId;
        containerRef.current.appendChild(playerDiv);

        playerInstance = new Plyr(playerDiv, {
          controls: [
            "play-large",
            "play",
            "progress",
            "current-time",
            "duration",
            "mute",
            "volume",
            "settings",
            "pip",
            "airplay",
            "fullscreen",
          ],
          settings: ["quality", "speed"],
          youtube: {
            noCookie: true,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            modestbranding: 1,
          },
          fullscreen: {
            enabled: true,
            fallback: true,
            container: ".plyr-fullscreen-wrapper",
          },
        });
      } else if (videoUrl) {
        // Direct media file setup (e.g. mp4)
        const videoEl = document.createElement("video");
        videoEl.src = videoUrl;
        videoEl.controls = true;
        videoEl.playsInline = true;
        containerRef.current.appendChild(videoEl);

        playerInstance = new Plyr(videoEl, {
          controls: [
            "play-large",
            "play",
            "progress",
            "current-time",
            "duration",
            "mute",
            "volume",
            "settings",
            "pip",
            "airplay",
            "fullscreen",
          ],
          settings: ["speed"],
          fullscreen: {
            enabled: true,
            fallback: true,
            container: ".plyr-fullscreen-wrapper",
          },
        });
      }

      playerRef.current = playerInstance;
    });

    return () => {
      isMounted = false;
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [videoId, videoUrl]);

  if (!videoUrl) {
    return (
      <div className="flex items-center justify-center bg-black aspect-video rounded-xl border border-border-main">
        <p className="text-text-muted text-sm">No video source provided</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full items-stretch plyr-fullscreen-wrapper">
      {/* Video Content Block */}
      <div className="flex-1 min-w-0 flex flex-col plyr-video-box">
        <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg border border-border-main bg-black plyr-custom-theme">
          <div ref={containerRef} className="w-full h-full" />
        </div>
        
        {/* Toggle Button for YouTube Videos */}
        {videoId && (
          <div className="mt-3 flex justify-end toggle-chat-btn">
            <button
              onClick={() => setShowChat(!showChat)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary hover:text-brand-primary/90 font-bold text-xs rounded-xl border border-brand-primary/20 transition cursor-pointer"
            >
              <span>💬</span>
              <span>{showChat ? "Hide Live Chat" : "Show Live Chat"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Live Chat Panel */}
      {showChat && videoId && (
        <div className="lg:w-80 w-full h-[350px] lg:h-auto bg-bg-card border-2 border-border-main rounded-xl overflow-hidden shadow-sm flex flex-col shrink-0 animate-fade-in plyr-chat-panel">
          <div className="bg-bg-main px-4 py-3 border-b border-border-main flex items-center justify-between">
            <span className="text-xs font-bold font-poppins text-text-main flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0"></span>
              Live Chat
            </span>
            <button
              onClick={() => setShowChat(false)}
              className="text-text-muted hover:text-text-main text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
          <iframe
            src={`https://www.youtube.com/live_chat?v=${videoId}&embed_domain=${
              typeof window !== "undefined" ? window.location.hostname : "localhost"
            }`}
            className="w-full flex-1 min-h-0"
            frameBorder="0"
          ></iframe>
        </div>
      )}
    </div>
  );
}
