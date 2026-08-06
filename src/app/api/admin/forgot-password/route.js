/**
 * Admin Forgot Password API Route
 * Handles requesting a reset OTP and verifying it to set a new password for administrators
 */

import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { AdminModel } from "@/models";
import { sendForgotPasswordOtpEmail } from "@/lib/nodemailer";

import dns from "dns";

const checkMxRecord = (domain) => {
  return new Promise((resolve) => {
    dns.promises
      .resolveMx(domain)
      .then((records) => resolve(records && records.length > 0))
      .catch(() => resolve(false));
  });
};

// POST: Request Reset OTP
export async function POST(request) {
  try {
    await connectDB();

    const { email } = await request.json();

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
      return Response.json(
        { error: "Invalid email format. Correct email format example: user@gmail.com" },
        { status: 400 }
      );
    }

    const domain = email.trim().split("@")[1];
    const tld = domain.split(".").pop().toLowerCase();
    const invalidTlds = ["con", "cmo", "gmal", "gmai", "yaho", "hotmial", "outlok", "cm", "coom", "comm"];
    if (invalidTlds.includes(tld)) {
      return Response.json(
        { error: `Invalid email domain extension (.${tld}). Please use a valid email address (e.g. user@gmail.com).` },
        { status: 400 }
      );
    }

    const hasMx = await checkMxRecord(domain);
    if (!hasMx) {
      return Response.json(
        { error: `The email domain "${domain}" does not exist or cannot receive emails.` },
        { status: 400 }
      );
    }

    const Admin = createModel("Admin", AdminModel);

    // Find admin by email directly
    const admin = await Admin.findOne({
      email: email.trim().toLowerCase()
    });

    if (!admin) {
      return Response.json(
        { error: "Admin with this email was not found." },
        { status: 404 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP and 10 minute expiry
    admin.resetOtp = otp;
    admin.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await admin.save();

    // Dispatch real email (or fallback to console print)
    const emailRes = await sendForgotPasswordOtpEmail(admin.email, admin.name, otp, "Admin");

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
    console.error("Error initiating admin forgot-password:", error);
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

    const Admin = createModel("Admin", AdminModel);

    const admin = await Admin.findOne({ email: email.trim().toLowerCase() });

    if (!admin) {
      return Response.json(
        { error: "Admin not found" },
        { status: 404 }
      );
    }

    // Verify OTP matches and has not expired
    if (!admin.resetOtp || admin.resetOtp !== otp.trim()) {
      return Response.json(
        { error: "Invalid OTP code. Please try again." },
        { status: 400 }
      );
    }

    if (!admin.resetOtpExpiry || new Date(admin.resetOtpExpiry) < new Date()) {
      return Response.json(
        { error: "The OTP code has expired. Please request a new code." },
        { status: 400 }
      );
    }

    // Update password (using plain-text to keep consistency with the current codebase)
    admin.password = newPassword;
    admin.resetOtp = null;
    admin.resetOtpExpiry = null;
    await admin.save();

    return Response.json(
      {
        success: true,
        message: "Your password has been reset successfully. You can now login with your new credentials.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error finalizing admin forgot-password:", error);
    return Response.json(
      { error: "Failed to reset password", details: error.message },
      { status: 500 }
    );
  }
}
