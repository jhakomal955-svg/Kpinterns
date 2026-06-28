"use client";

import { useEffect, useRef, useState } from "react";
import "plyr/dist/plyr.css";

/**
 * Reusable video player wrapper using Plyr.io
 * Skins YouTube and standard video links with a consistent premium UI,
 * hiding default branding, share options, and right-click menus.
 * Automatically checks if a YouTube video is currently broadcasting live,
 * enabling a pulsing "LIVE" badge and KpInterns Custom Live Chat panel dynamically.
 */
export default function VideoPlayer({ videoUrl }) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  
  // Custom Live Status & Chat states
  const [isLive, setIsLive] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const lastFetchedRef = useRef(null);
  const chatBottomRef = useRef(null);
  const chatIntervalRef = useRef(null);

  // Extract YouTube ID from various YouTube URL formats
  const getYouTubeId = (url) => {
    if (!url) return null;
    let videoId = null;
    try {
      const urlObj = new URL(url.trim());
      if (urlObj.hostname.includes("youtube.com") || urlObj.hostname.includes("youtu.be")) {
        if (urlObj.hostname.includes("youtu.be")) {
          const segment = urlObj.pathname.split("/").filter(Boolean)[0];
          if (segment) videoId = segment.split(/[?#]/)[0];
        } else if (urlObj.pathname.includes("/embed/")) {
          videoId = urlObj.pathname.split("/embed/")[1]?.split(/[?#]/)[0];
        } else if (urlObj.pathname.includes("/shorts/")) {
          videoId = urlObj.pathname.split("/shorts/")[1]?.split(/[?#]/)[0];
        } else if (urlObj.pathname.includes("/live/")) {
          videoId = urlObj.pathname.split("/live/")[1]?.split(/[?#]/)[0];
        } else {
          videoId = urlObj.searchParams.get("v");
        }
      }
    } catch (e) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|live\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      if (match && match[2] && match[2].length === 11) {
        videoId = match[2];
      }
    }
    return videoId && videoId.length === 11 ? videoId : null;
  };

  const videoId = getYouTubeId(videoUrl);

  // Load current user profile from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const admin = localStorage.getItem("adminData");
        if (admin) {
          setCurrentUser(JSON.parse(admin));
          return;
        }
        const user = localStorage.getItem("userData");
        if (user) {
          setCurrentUser(JSON.parse(user));
        }
      } catch (e) {
        console.error("Error loading user profile", e);
      }
    }
  }, []);

  // Monitor live status
  useEffect(() => {
    if (!videoId) {
      setIsLive(false);
      return;
    }

    const checkLiveStatus = async () => {
      try {
        const res = await fetch(`/api/live-status?videoId=${videoId}`).then(r => r.json());
        if (res.success) {
          setIsLive(res.isLive);
        }
      } catch (err) {
        console.error("Error checking live status", err);
      }
    };

    checkLiveStatus();
    const statusInterval = setInterval(checkLiveStatus, 30000); // Check live status every 30 seconds

    return () => clearInterval(statusInterval);
  }, [videoId]);

  // Manage Live Chat messages and polling
  useEffect(() => {
    if (chatIntervalRef.current) {
      clearInterval(chatIntervalRef.current);
      chatIntervalRef.current = null;
    }

    if (!isLive || !videoId) {
      setMessages([]);
      lastFetchedRef.current = null;
      return;
    }

    const fetchChatHistory = async () => {
      try {
        const res = await fetch(`/api/live-chat?videoId=${videoId}`).then(r => r.json());
        if (res.success && res.data) {
          setMessages(res.data);
          if (res.data.length > 0) {
            lastFetchedRef.current = res.data[res.data.length - 1].createdAt;
          }
          setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        }
      } catch (e) {
        console.error("Error fetching chat history", e);
      }
    };

    const pollNewMessages = async () => {
      if (!lastFetchedRef.current) return;
      try {
        const res = await fetch(
          `/api/live-chat?videoId=${videoId}&since=${encodeURIComponent(lastFetchedRef.current)}`
        ).then(r => r.json());
        if (res.success && res.data && res.data.length > 0) {
          setMessages(prev => {
            const filteredNew = res.data.filter(
              newMsg => !prev.some(msg => msg._id === newMsg._id)
            );
            if (filteredNew.length === 0) return prev;
            return [...prev, ...filteredNew];
          });
          lastFetchedRef.current = res.data[res.data.length - 1].createdAt;
          setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        }
      } catch (e) {
        console.error("Error polling chat messages", e);
      }
    };

    fetchChatHistory().then(() => {
      chatIntervalRef.current = setInterval(pollNewMessages, 3000); // Poll chat messages every 3 seconds
    });

    return () => {
      if (chatIntervalRef.current) {
        clearInterval(chatIntervalRef.current);
      }
    };
  }, [isLive, videoId]);

  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !videoId || sending) return;

    try {
      setSending(true);
      const token = localStorage.getItem("adminToken") || localStorage.getItem("userToken");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      };

      const res = await fetch("/api/live-chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          videoId,
          message: newMessage.trim()
        })
      }).then(r => r.json());

      if (res.success && res.data) {
        setMessages(prev => [...prev, res.data]);
        lastFetchedRef.current = res.data.createdAt;
        setNewMessage("");
        setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    } catch (err) {
      console.error("Error sending live chat message", err);
    } finally {
      setSending(false);
    }
  };

  // Instantiates Plyr player wrapper
  useEffect(() => {
    if (!containerRef.current) return;

    let isMounted = true;
    let playerInstance = null;

    // Dynamically import Plyr to prevent server-side ReferenceError
    import("plyr").then(({ default: Plyr }) => {
      if (!isMounted || !containerRef.current) return;

      // Clear previous elements
      containerRef.current.innerHTML = "";

      if (videoId) {
        // YouTube embed setup
        const playerDiv = document.createElement("div");
        playerDiv.dataset.plyrProvider = "youtube";
        playerDiv.dataset.plyrTarget = videoId;
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
          
          {/* Pulsing LIVE Overlay Badge */}
          {isLive && (
            <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1 bg-red-600/90 text-white text-[10px] font-black uppercase tracking-wider rounded-md shadow-md animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
              Live
            </div>
          )}
        </div>
      </div>

      {/* Live Chat Panel */}
      {isLive && videoId && (
        <div className="lg:w-80 w-full h-[500px] lg:h-auto lg:min-h-[500px] bg-bg-card border-2 border-border-main rounded-xl overflow-hidden shadow-sm flex flex-col shrink-0 animate-fade-in plyr-chat-panel">
          <div className="bg-bg-main px-4 py-3 border-b border-border-main flex items-center justify-between shrink-0">
            <span className="text-xs font-bold font-poppins text-text-main flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0"></span>
              Live Chat
            </span>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-bg-main/5 min-h-0">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-text-muted py-10">
                <span className="text-2xl mb-2">💬</span>
                <p className="text-[11px] font-medium text-text-muted">No messages yet. Join the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isSelf = msg.user === currentUser?._id;
                const isInstructor = msg.senderRole === "Instructor" || msg.senderRole === "Admin";
                return (
                  <div
                    key={msg._id}
                    className={`flex flex-col max-w-[85%] ${
                      isSelf ? "ml-auto items-end" : "mr-auto items-start"
                    }`}
                  >
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="text-[9px] font-bold text-text-main leading-none">
                        {msg.senderName}
                      </span>
                      {isInstructor && (
                        <span className="text-[7px] font-black uppercase tracking-wider px-1 rounded bg-amber-500/15 text-amber-600 border border-amber-500/20 leading-none">
                          Instructor
                        </span>
                      )}
                    </div>
                    <div
                      className={`px-3 py-1.5 rounded-xl text-[11px] leading-relaxed break-words whitespace-pre-wrap ${
                        isSelf
                          ? "bg-brand-primary text-white rounded-tr-none shadow-sm shadow-brand-primary/10"
                          : isInstructor
                          ? "bg-amber-500/10 border border-amber-500/20 text-text-main rounded-tl-none"
                          : "bg-bg-main border border-border-main text-text-main rounded-tl-none"
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-bg-card border-t border-border-main flex gap-2 items-center shrink-0"
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={currentUser ? "Say something..." : "Please log in to chat"}
              className="flex-1 bg-bg-main border-2 border-border-main rounded-lg px-3 py-1.5 text-[11px] text-text-main placeholder-text-muted focus:border-brand-primary outline-none transition"
              maxLength={500}
              disabled={sending || !currentUser}
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim() || !currentUser}
              className="px-3 py-1.5 bg-brand-primary hover:bg-brand-primary/95 disabled:bg-brand-primary/50 text-white font-bold text-[11px] rounded-lg shadow transition cursor-pointer flex items-center justify-center"
            >
              {sending ? (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <span>✈</span>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
