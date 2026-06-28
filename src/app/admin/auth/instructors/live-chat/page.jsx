"use client";

import { useState, useEffect, useRef } from "react";

export default function InstructorLiveChatPage() {
  const [adminData, setAdminData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [checkingStreams, setCheckingStreams] = useState(false);
  
  // Available items and detected live streams
  const [liveStreams, setLiveStreams] = useState([]);
  const [selectedStream, setSelectedStream] = useState(null);
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const lastFetchedRef = useRef(null);
  const chatBottomRef = useRef(null);
  const chatIntervalRef = useRef(null);

  // Helper to extract YouTube video ID
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

  // Load instructor data
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("adminData");
        if (stored) {
          setAdminData(JSON.parse(stored));
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error parsing adminData", err);
        setIsLoading(false);
      }
    }
  }, []);

  // Fetch courses and check which ones have active live stream URLs
  useEffect(() => {
    if (!adminData) return;

    const scanForLiveStreams = async () => {
      try {
        setCheckingStreams(true);
        const token = localStorage.getItem("adminToken");
        const headers = token ? { "Authorization": `Bearer ${token}` } : {};

        // Fetch courses and internships
        const [coursesRes, internshipsRes] = await Promise.all([
          fetch("/api/course", { headers }).then((r) => r.json()),
          fetch("/api/internship", { headers }).then((r) => r.json()),
        ]);

        const myCourses = coursesRes.success
          ? coursesRes.data.filter((c) =>
              c.instructor?.some((inst) => (inst.id?._id || inst.id) === adminData._id)
            )
          : [];

        const myInternships = internshipsRes.success
          ? internshipsRes.data.filter((c) =>
              c.instructor?.some((inst) => (inst.id?._id || inst.id) === adminData._id)
            )
          : [];

        // Collect all YouTube video links
        const streamCandidates = [];

        // Courses Content
        myCourses.forEach((course) => {
          course.content?.forEach((item) => {
            const url = item.VideoUrl || item.externalink;
            const yId = getYouTubeId(url);
            if (yId) {
              streamCandidates.push({
                videoId: yId,
                title: item.title || "Course Video",
                sourceName: course.title,
                type: "Course",
              });
            }
          });
        });

        // Internship Milestones
        myInternships.forEach((internship) => {
          internship.milestone?.forEach((milestone) => {
            const url = milestone.VideoUrl || milestone.externalink;
            const yId = getYouTubeId(url);
            if (yId) {
              streamCandidates.push({
                videoId: yId,
                title: milestone.title || "Milestone Lecture",
                sourceName: internship.title,
                type: "Internship",
              });
            }
          });
        });

        // Deduplicate candidates by videoId
        const uniqueCandidates = Array.from(
          new Map(streamCandidates.map((item) => [item.videoId, item])).values()
        );

        // Check live status for each candidate
        const activeStreams = [];
        for (const candidate of uniqueCandidates) {
          try {
            const statusRes = await fetch(`/api/live-status?videoId=${candidate.videoId}`).then((r) =>
              r.json()
            );
            if (statusRes.success && statusRes.isLive) {
              activeStreams.push(candidate);
            }
          } catch (e) {
            console.error("Error checking live status for candidate", candidate.videoId, e);
          }
        }

        setLiveStreams(activeStreams);
        
        // Auto select first stream if available and none selected
        if (activeStreams.length > 0 && !selectedStream) {
          setSelectedStream(activeStreams[0]);
        }
      } catch (err) {
        console.error("Error scanning for live streams:", err);
      } finally {
        setCheckingStreams(false);
        setIsLoading(false);
      }
    };

    scanForLiveStreams();
    
    // Periodically re-scan for live streams every 60 seconds
    const scanInterval = setInterval(scanForLiveStreams, 60000);
    return () => clearInterval(scanInterval);
  }, [adminData]);

  // Load chat history and establish polling when a stream is selected
  useEffect(() => {
    if (chatIntervalRef.current) {
      clearInterval(chatIntervalRef.current);
      chatIntervalRef.current = null;
    }

    if (!selectedStream) {
      setMessages([]);
      lastFetchedRef.current = null;
      return;
    }

    const fetchChatHistory = async () => {
      try {
        const res = await fetch(`/api/live-chat?videoId=${selectedStream.videoId}`).then((r) => r.json());
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
          `/api/live-chat?videoId=${selectedStream.videoId}&since=${encodeURIComponent(
            lastFetchedRef.current
          )}`
        ).then((r) => r.json());
        if (res.success && res.data && res.data.length > 0) {
          setMessages((prev) => {
            const filteredNew = res.data.filter(
              (newMsg) => !prev.some((msg) => msg._id === newMsg._id)
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
      chatIntervalRef.current = setInterval(pollNewMessages, 3000);
    });

    return () => {
      if (chatIntervalRef.current) {
        clearInterval(chatIntervalRef.current);
      }
    };
  }, [selectedStream]);

  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedStream || sending) return;

    try {
      setSending(true);
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/live-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          videoId: selectedStream.videoId,
          message: newMessage.trim(),
        }),
      }).then((r) => r.json());

      if (res.success && res.data) {
        setMessages((prev) => [...prev, res.data]);
        lastFetchedRef.current = res.data.createdAt;
        setNewMessage("");
        setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-text-muted text-sm font-medium">Scanning live streams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-h-[85vh] flex flex-col h-[75vh]">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-black text-text-main font-poppins">Live Chat Manager</h2>
          <p className="text-xs text-text-muted">
            Moderate and reply to students attending your live classes.
          </p>
        </div>
        {checkingStreams && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-primary/10 rounded-full text-[10px] text-brand-primary font-bold animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>
            Syncing Status...
          </div>
        )}
      </div>

      {liveStreams.length === 0 ? (
        <div className="bg-bg-card border-2 border-border-main rounded-2xl p-10 text-center flex-1 flex flex-col items-center justify-center shrink-0">
          <div className="w-16 h-16 mb-4 rounded-full bg-bg-main flex items-center justify-center text-3xl">
            📡
          </div>
          <h3 className="text-base font-bold text-text-main mb-1.5">No Active Live Streams</h3>
          <p className="text-xs text-text-muted max-w-sm leading-relaxed mb-4">
            We couldn't detect any live YouTube broadcasts linked to your courses or internships milestone lectures.
          </p>
          <div className="text-xs text-left p-4 bg-bg-main rounded-xl border border-border-main max-w-md space-y-2">
            <p className="font-bold text-text-main">To start live chatting:</p>
            <ol className="list-decimal list-inside space-y-1 text-text-muted">
              <li>Go live on YouTube Studio.</li>
              <li>Copy the live stream URL or video ID.</li>
              <li>Paste the URL inside any course content lecture or internship milestone link.</li>
              <li>This page will automatically detect the stream and load the chat room!</li>
            </ol>
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 items-stretch">
          {/* Left panel: Active streams list */}
          <div className="lg:w-72 w-full bg-bg-card border-2 border-border-main rounded-2xl p-4 flex flex-col gap-3 overflow-y-auto shrink-0 lg:max-h-full">
            <h3 className="text-xs font-black uppercase tracking-wider text-text-muted mb-1">
              Active Streams ({liveStreams.length})
            </h3>
            <div className="space-y-2">
              {liveStreams.map((stream) => {
                const isSelected = selectedStream?.videoId === stream.videoId;
                return (
                  <button
                    key={stream.videoId}
                    onClick={() => setSelectedStream(stream)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1.5 cursor-pointer ${
                      isSelected
                        ? "bg-brand-primary/10 border-brand-primary text-brand-primary"
                        : "bg-bg-main/50 border-border-main hover:bg-bg-main text-text-main hover:border-text-muted/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-brand-primary/15 text-brand-primary">
                        {stream.type}
                      </span>
                      <span className="flex items-center gap-1 text-[9px] font-black text-red-500 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        LIVE
                      </span>
                    </div>
                    <div className="text-xs font-bold font-poppins leading-tight truncate-2-lines">
                      {stream.title}
                    </div>
                    <div className="text-[10px] text-text-muted leading-none mt-1 truncate">
                      Source: {stream.sourceName}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right panel: Active chat window */}
          <div className="flex-1 bg-bg-card border-2 border-border-main rounded-2xl flex flex-col min-w-0 overflow-hidden relative">
            {selectedStream ? (
              <>
                {/* Chat Stream Header */}
                <div className="bg-bg-main px-5 py-4 border-b border-border-main flex items-center justify-between shrink-0">
                  <div className="min-w-0">
                    <div className="text-xs text-text-muted leading-tight truncate">
                      Chatting in: {selectedStream.sourceName}
                    </div>
                    <div className="text-sm font-black text-text-main font-poppins truncate leading-normal">
                      {selectedStream.title}
                    </div>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full font-bold uppercase shrink-0 animate-pulse">
                    Stream Connected
                  </span>
                </div>

                {/* Message Log */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0 bg-bg-main/10">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-text-muted py-10">
                      <span className="text-3xl mb-2">💬</span>
                      <p className="text-xs font-medium">No messages yet. Say hello to start the discussion!</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isSelf = msg.user === adminData?._id;
                      const isInstructor = msg.senderRole === "Instructor" || msg.senderRole === "Admin";
                      return (
                        <div
                          key={msg._id}
                          className={`flex flex-col max-w-[80%] ${
                            isSelf ? "ml-auto items-end" : "mr-auto items-start"
                          }`}
                        >
                          {/* Sender name & role badge */}
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] font-bold text-text-main">
                              {msg.senderName}
                            </span>
                            {isInstructor && (
                              <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 border border-amber-500/20">
                                Instructor
                              </span>
                            )}
                          </div>
                          {/* Message bubble */}
                          <div
                            className={`px-4 py-2.5 rounded-2xl text-xs font-medium leading-relaxed break-words whitespace-pre-wrap ${
                              isSelf
                                ? "bg-brand-primary text-white rounded-tr-none shadow-sm shadow-brand-primary/10"
                                : isInstructor
                                ? "bg-amber-500/10 border border-amber-500/20 text-text-main rounded-tl-none"
                                : "bg-bg-main border border-border-main text-text-main rounded-tl-none"
                            }`}
                          >
                            {msg.message}
                          </div>
                          {/* Timestamp */}
                          <span className="text-[9px] text-text-muted mt-1 px-1">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Input Bar */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-4 bg-bg-card border-t border-border-main flex gap-3 items-center shrink-0"
                >
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your reply here..."
                    className="flex-1 bg-bg-main border-2 border-border-main rounded-xl px-4 py-2.5 text-xs text-text-main placeholder-text-muted focus:border-brand-primary outline-none transition"
                    maxLength={500}
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="px-5 py-2.5 bg-brand-primary hover:bg-brand-primary/95 disabled:bg-brand-primary/50 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer flex items-center gap-1.5"
                  >
                    {sending ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <span>Send</span>
                        <span>✈</span>
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-center text-text-muted">
                <p className="text-xs">Select an active stream from the left panel to join the chat.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
