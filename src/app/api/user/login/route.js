/**
 * User Login API Route
 * Verifies user credentials and returns token
 */

import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { UserModel, CourseModel, InternshipModel } from "@/models";

export async function POST(request) {
  try {
    await connectDB();

    const { emailOrPhone, password } = await request.json();

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

    // Simple password comparison (consistent with Admin auth)
    if (user.password !== password) {
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

    return Response.json(
      {
        success: true,
        message: "Login successful",
        data: userData,
        token: "user-token-" + user._id,
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
