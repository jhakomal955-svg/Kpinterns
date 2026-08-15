/**
 * Live Chat API Routes
 * Handles custom live class chat functionality with Redis distributed caching for 5000 concurrent user scale
 */

import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { LiveChatMessageModel, UserModel, AdminModel } from "@/models";
import { verifyAuth } from "@/lib/jwt";
import { redisGet, redisSet } from "@/lib/redis";

const CACHE_TTL_SECONDS = 3; // 3 seconds Redis TTL

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const videoId = url.searchParams.get("videoId");
    const since = url.searchParams.get("since");

    if (!videoId) {
      return Response.json({ error: "Missing videoId parameter" }, { status: 400 });
    }

    const cacheKey = `livechat:${videoId}`;
    let cachedMessages = await redisGet(cacheKey);

    if (!cachedMessages) {
      await connectDB();
      const LiveChatMessage = createModel("LiveChatMessage", LiveChatMessageModel);

      // Retrieve last 100 messages using lean query to save memory
      cachedMessages = await LiveChatMessage.find({ videoId })
        .sort({ createdAt: 1 })
        .limit(100)
        .lean();

      // Cache in Redis asynchronously
      await redisSet(cacheKey, cachedMessages, CACHE_TTL_SECONDS);
    }

    let messages = cachedMessages || [];

    // Filter in-memory by 'since' timestamp if provided
    if (since) {
      const sinceDate = new Date(since);
      if (!isNaN(sinceDate.getTime())) {
        messages = messages.filter((msg) => new Date(msg.createdAt) > sinceDate);
      }
    }

    return Response.json(
      { success: true, data: messages },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=2, stale-while-revalidate=5",
        },
      }
    );
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

    // Query sender details
    if (auth.user.role === "User") {
      const user = await User.findById(auth.user._id).select("fullName").lean();
      if (user) {
        senderName = user.fullName || "Student";
      }
      senderModel = "User";
      senderRole = "User";
    } else {
      const admin = await Admin.findById(auth.user._id).select("name role").lean();
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

    const msgObj = chatMsg.toObject();

    // Invalidate/Update Redis cache immediately
    const cacheKey = `livechat:${videoId}`;
    const existing = (await redisGet(cacheKey)) || [];
    const updatedMessages = [...existing, msgObj].slice(-100);
    await redisSet(cacheKey, updatedMessages, CACHE_TTL_SECONDS);

    return Response.json({ success: true, data: msgObj }, { status: 201 });
  } catch (error) {
    console.error("Error sending live chat message:", error);
    return Response.json(
      { error: "Failed to send message", details: error.message },
      { status: 500 }
    );
  }
}
