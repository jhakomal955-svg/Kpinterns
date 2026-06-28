/**
 * LiveChatMessage Model
 * Represents a chat message in a live YouTube class
 */

import mongoose from "mongoose";

const LiveChatMessageModel = {
  videoId: {
    type: String,
    required: true,
    index: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "senderModel",
    required: true,
  },
  senderModel: {
    type: String,
    required: true,
    enum: ["User", "Admin"],
  },
  senderName: {
    type: String,
    required: true,
  },
  senderRole: {
    type: String,
    required: true,
    enum: ["User", "Admin", "Instructor"],
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: { expires: 86400 }, // Auto-delete message after 24 hours (TTL)
  },
};

export default LiveChatMessageModel;
