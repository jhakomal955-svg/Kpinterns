/**
 * User Login API Route
 * Verifies user credentials and returns token
 */

import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { UserModel, CourseModel, InternshipModel } from "@/models";
import { signToken } from "@/lib/jwt";
import { verifyTurnstileToken } from "@/lib/turnstile";
import bcrypt from "bcryptjs";
import { syncUserProgressAndStatus } from "@/lib/progressSync";

export async function POST(request) {
  try {
    await connectDB();

    const { emailOrPhone, password, turnstileToken } = await request.json();

    // Verify Turnstile Token
    const isHuman = await verifyTurnstileToken(turnstileToken);
    if (!isHuman) {
      return Response.json(
        { error: "Human verification failed. Please try again." },
        { status: 400 },
      );
    }

    // Validate required fields
    if (!emailOrPhone || !password) {
      return Response.json(
        { error: "Email/Phone and password are required" },
        { status: 400 },
      );
    }

    const User = createModel("User", UserModel);

    // Find user by email or phone (case-insensitive for email, remove non-digits for phone if it's pure numbers)
    const normalizedEmailOrPhone = emailOrPhone.trim();
    const isOnlyDigits = /^\d+$/.test(normalizedEmailOrPhone.replace(/\D/g, ""));
    
    const query = {
      $or: [
        { email: normalizedEmailOrPhone.toLowerCase() },
      ]
    };

    if (isOnlyDigits) {
      query.$or.push({ phone: normalizedEmailOrPhone.replace(/\D/g, "") });
    } else {
      query.$or.push({ phone: normalizedEmailOrPhone });
    }

    createModel("Course", CourseModel);
    createModel("Internship", InternshipModel);

    const user = await User.findOne(query)
      .populate("ActiveCources.course")
      .populate("ActiveInternship.internship");

    if (!user) {
      return Response.json(
        { error: "User not found. Invalid email or phone number." },
        { status: 404 },
      );
    }

    // Sync progress & status before returning data
    await syncUserProgressAndStatus(user);

    // Determine if the password stored in DB is a bcrypt hash
    const isHashed = user.password && (user.password.startsWith("$2a$") || user.password.startsWith("$2b$") || user.password.startsWith("$2y$"));
    
    let isMatch = false;
    if (isHashed) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      // Old plain-text password comparison
      isMatch = (user.password === password);
      
      if (isMatch) {
        // Upgrade plain-text password to bcrypt hash on the fly
        user.password = password; // pre-save hook will automatically hash it when we save!
        await user.save();
        console.log(`🔒 Upgraded password to bcrypt for User: ${user.email}`);
      }
    }

    if (!isMatch) {
      return Response.json(
        { success: false, error: "Invalid password" },
        { status: 401 },
      );
    }

    // Return user data without password
    const userData = user.toObject();
    delete userData.password;

    userData.internshipDomain = userData.ActiveInternship?.[0]?.internship?.domain || userData.ActiveInternship?.[0]?.internship?.category || "";
    userData.mode = userData.ActiveInternship?.[0]?.internship?.mode || "";

    const token = signToken({
      _id: user._id.toString(),
      email: user.email,
      role: "User",
    });

    return Response.json(
      {
        success: true,
        message: "Login successful",
        data: userData,
        token: token,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error logging in user:", error);
    return Response.json(
      { error: "Failed to login", details: error.message },
      { status: 500 },
    );
  }
}
