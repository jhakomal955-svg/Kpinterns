/**
 * MongoDB Connection
 * Handles connection to MongoDB database
 */

import mongoose from "mongoose";
import { UserModel, AdminModel, ContactModel, CourseModel, InternshipModel, VerificationOtpModel, AttendanceModel, LiveChatMessageModel } from "../models/index.js";
import { createModel } from "./utils/schemaBuilder.js";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local",
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 30,
      minPoolSize: 5,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 15000,
      retryWrites: true,
      w: "majority",
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        // Register all models centrally to prevent MissingSchemaError on populated references (e.g. Admin)
        createModel("User", UserModel);
        createModel("Admin", AdminModel);
        createModel("Contact", ContactModel);
        createModel("Course", CourseModel);
        createModel("Internship", InternshipModel);
        createModel("VerificationOtp", VerificationOtpModel);
        createModel("Attendance", AttendanceModel);
        createModel("LiveChatMessage", LiveChatMessageModel);

        return mongoose;
      })
      .catch((error) => {
        console.error("❌ MongoDB connection error:", error);
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectDB;
