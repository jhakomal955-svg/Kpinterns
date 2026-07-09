/**
 * Live Chat API Routes
 * Handles custom live class chat functionality
 * GET - Retrieve chat history for a videoId (since a given timestamp)
 * POST - Post a new message in live chat (Requires authentication)
 */

import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { LiveChatMessageModel, UserModel, AdminModel } from "@/models";
import { verifyAuth } from "@/lib/jwt";

// Global memory cache for live chat to prevent database query spamming under high-frequency polling
let chatCache = global.chatCache;
if (!chatCache) {
  chatCache = global.chatCache = new Map(); // videoId -> { messages: [], lastFetched: timestamp }
}

const CACHE_TTL_MS = 2000; // 2 seconds cache TTL

export async function GET(request) {
  try {
    await connectDB();

    const LiveChatMessage = createModel("LiveChatMessage", LiveChatMessageModel);

    const url = new URL(request.url);
    const videoId = url.searchParams.get("videoId");
    const since = url.searchParams.get("since");

    if (!videoId) {
      return Response.json({ error: "Missing videoId parameter" }, { status: 400 });
    }

    // Check cache first
    let cachedData = chatCache.get(videoId);
    const now = Date.now();

    if (!cachedData || (now - cachedData.lastFetched > CACHE_TTL_MS)) {
      // Retrieve last 100 messages in chronological order from DB
      const dbMessages = await LiveChatMessage.find({ videoId })
        .sort({ createdAt: 1 })
        .limit(100);

      cachedData = {
        messages: dbMessages,
        lastFetched: now
      };
      chatCache.set(videoId, cachedData);
    }

    let messages = cachedData.messages;

    // If 'since' date is provided, filter in-memory instead of querying DB
    if (since) {
      const sinceDate = new Date(since);
      if (!isNaN(sinceDate.getTime())) {
        messages = messages.filter(msg => new Date(msg.createdAt) > sinceDate);
      }
    }

    return Response.json({ success: true, data: messages }, { status: 200 });
  } catch (error) {
    console.error("Error fetching live chat messages:", error);
    return Response.json(
      { error: "Failed to fetch chat messages", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    // Authenticate the user/instructor/admin
    const auth = verifyAuth(request, ["User", "Admin", "Instructor", "College Admin"]);
    if (!auth.authenticated) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const { videoId, message } = await request.json();

    if (!videoId || videoId.length !== 11) {
      return Response.json({ error: "Invalid videoId parameter" }, { status: 400 });
    }

    if (!message || message.trim() === "") {
      return Response.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    if (message.length > 500) {
      return Response.json({ error: "Message cannot exceed 500 characters" }, { status: 400 });
    }

    // Instantiate models
    const User = createModel("User", UserModel);
    const Admin = createModel("Admin", AdminModel);
    const LiveChatMessage = createModel("LiveChatMessage", LiveChatMessageModel);

    let senderName = "Anonymous";
    let senderRole = auth.user.role;
    let senderModel = "User";

    // Query sender details based on their authentication role
    if (auth.user.role === "User") {
      const user = await User.findById(auth.user._id);
      if (user) {
        senderName = user.fullName || "Student";
      }
      senderModel = "User";
      senderRole = "User";
    } else {
      const admin = await Admin.findById(auth.user._id);
      if (admin) {
        senderName = admin.name || "Instructor";
        senderRole = admin.role || "Instructor";
      }
      senderModel = "Admin";
    }

    // Create the message
    const chatMsg = await LiveChatMessage.create({
      videoId,
      user: auth.user._id,
      senderModel,
      senderName,
      senderRole,
      message: message.trim(),
    });

    // Update the cache immediately to include the new message
    const cachedData = chatCache.get(videoId);
    if (cachedData) {
      const updatedMessages = [...cachedData.messages, chatMsg].slice(-100);
      chatCache.set(videoId, {
        messages: updatedMessages,
        lastFetched: Date.now()
      });
    } else {
      chatCache.set(videoId, {
        messages: [chatMsg],
        lastFetched: Date.now()
      });
    }

    return Response.json({ success: true, data: chatMsg }, { status: 201 });
  } catch (error) {
    console.error("Error sending live chat message:", error);
    return Response.json(
      { error: "Failed to send message", details: error.message },
      { status: 500 }
    );
  }
}
