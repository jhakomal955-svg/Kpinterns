/**
 * User Forgot Password API Route
 * Handles requesting a reset OTP and verifying it to set a new password
 */

import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { UserModel } from "@/models";

// POST: Request Reset OTP
export async function POST(request) {
  try {
    await connectDB();

    const { emailOrPhone, registrationNumber } = await request.json();

    if (!emailOrPhone || !registrationNumber) {
      return Response.json(
        { error: "Email/Phone and registration number are required" },
        { status: 400 }
      );
    }

    const User = createModel("User", UserModel);

    // Normalize input
    const normalizedEmailOrPhone = emailOrPhone.trim();
    const isOnlyDigits = /^\d+$/.test(normalizedEmailOrPhone.replace(/\D/g, ""));

    const query = {
      registrationNumber: registrationNumber.trim(),
      $or: [
        { email: normalizedEmailOrPhone.toLowerCase() },
      ]
    };

    if (isOnlyDigits) {
      query.$or.push({ phone: normalizedEmailOrPhone.replace(/\D/g, "") });
    } else {
      query.$or.push({ phone: normalizedEmailOrPhone });
    }

    const user = await User.findOne(query);

    if (!user) {
      return Response.json(
        { error: "User not found. Please verify your registration number and email/phone." },
        { status: 404 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP and 10 minute expiry
    user.resetOtp = otp;
    user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    console.log(`[FORGOT PASSWORD OTP - USER: ${user.email}] OTP: ${otp}`);

    // Return success response (leak OTP for mock development usage)
    return Response.json(
      {
        success: true,
        message: "A password reset OTP has been generated successfully.",
        otp, // In production, we'd send this via email/SMS and NOT return it in JSON
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error initiating user forgot-password:", error);
    return Response.json(
      { error: "Failed to initiate password reset", details: error.message },
      { status: 500 }
    );
  }
}

// PUT: Reset Password using OTP
export async function PUT(request) {
  try {
    await connectDB();

    const { emailOrPhone, otp, newPassword } = await request.json();

    if (!emailOrPhone || !otp || !newPassword) {
      return Response.json(
        { error: "All fields (Email/Phone, OTP, and New Password) are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return Response.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const User = createModel("User", UserModel);

    // Find user by email or phone
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

    const user = await User.findOne(query);

    if (!user) {
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verify OTP matches and has not expired
    if (!user.resetOtp || user.resetOtp !== otp.trim()) {
      return Response.json(
        { error: "Invalid OTP code. Please try again." },
        { status: 400 }
      );
    }

    if (!user.resetOtpExpiry || new Date(user.resetOtpExpiry) < new Date()) {
      return Response.json(
        { error: "The OTP code has expired. Please request a new code." },
        { status: 400 }
      );
    }

    // Update password (using plain-text to keep consistency with the current codebase)
    user.password = newPassword;
    user.resetOtp = null;
    user.resetOtpExpiry = null;
    await user.save();

    return Response.json(
      {
        success: true,
        message: "Your password has been reset successfully. You can now login with your new credentials.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error finalizing user forgot-password:", error);
    return Response.json(
      { error: "Failed to reset password", details: error.message },
      { status: 500 }
    );
  }
}
