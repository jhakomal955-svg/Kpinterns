/**
 * User Forgot Password API Route
 * Handles requesting a reset OTP and verifying it to set a new password
 */

import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { UserModel } from "@/models";
import { sendForgotPasswordOtpEmail } from "@/lib/nodemailer";

// POST: Request Reset OTP
export async function POST(request) {
  try {
    await connectDB();

    const { email } = await request.json();

    if (!email) {
      return Response.json(
        { error: "Email address is required" },
        { status: 400 }
      );
    }

    const User = createModel("User", UserModel);

    // Find user by email directly
    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return Response.json(
        { error: "User with this email address was not found." },
        { status: 404 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP and 10 minute expiry
    user.resetOtp = otp;
    user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Dispatch real email (or fallback to console print)
    const emailRes = await sendForgotPasswordOtpEmail(user.email, user.fullName, otp, "User");

    const responsePayload = {
      success: true,
      message: "A password reset OTP has been sent to your registered email address.",
    };

    // Keep otp in response payload only during local mock development
    if (process.env.NODE_ENV === "development" || emailRes.mocked) {
      responsePayload.otp = otp;
    }

    return Response.json(responsePayload, { status: 200 });
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

    const { email, otp, newPassword } = await request.json();

    if (!email || !otp || !newPassword) {
      return Response.json(
        { error: "All fields (Email, OTP, and New Password) are required" },
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

    // Find user by email directly
    const user = await User.findOne({ email: email.trim().toLowerCase() });

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
