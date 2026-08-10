/**
 * Admin Forgot Password API Route
 * Handles requesting a reset OTP and verifying it to set a new password for administrators
 */

import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { AdminModel } from "@/models";
import { sendForgotPasswordOtpEmail } from "@/lib/nodemailer";
import { generateSecureOtp, hashOtp, verifyOtpHash, getClientIp, checkOtpRateLimit } from "@/lib/utils/otpHelper";
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
        { error: "Invalid email format. Correct email format example: admin@gmail.com" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const domain = normalizedEmail.split("@")[1];
    const tld = domain.split(".").pop().toLowerCase();
    const invalidTlds = ["con", "cmo", "gmal", "gmai", "yaho", "hotmial", "outlok", "cm", "coom", "comm"];
    if (invalidTlds.includes(tld)) {
      return Response.json(
        { error: `Invalid email domain extension (.${tld}). Please use a valid email address.` },
        { status: 400 }
      );
    }

    // Rate Limiting Protection (Max 3 send requests per 10 minutes per IP & Email)
    const clientIp = getClientIp(request);
    const emailRateLimit = await checkOtpRateLimit(`ratelimit:admin-forgot:email:${normalizedEmail}`, 3, 600);
    if (!emailRateLimit.allowed) {
      return Response.json(
        { error: `Too many password reset requests. Please wait ${emailRateLimit.retryAfterSeconds} seconds before trying again.` },
        { status: 429 }
      );
    }

    const ipRateLimit = await checkOtpRateLimit(`ratelimit:admin-forgot:ip:${clientIp}`, 3, 600);
    if (!ipRateLimit.allowed) {
      return Response.json(
        { error: `Too many requests from your connection. Please wait ${ipRateLimit.retryAfterSeconds} seconds before trying again.` },
        { status: 429 }
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
    const admin = await Admin.findOne({ email: normalizedEmail });

    // Anti-Account Enumeration: If admin is not found, return generic success message without leaking account absence
    if (!admin) {
      return Response.json(
        {
          success: true,
          message: "If an admin account with that email address exists, a password reset OTP has been sent.",
        },
        { status: 200 }
      );
    }

    // Generate secure 6-digit OTP and SHA-256 hash
    const rawOtp = generateSecureOtp();
    const hashedOtp = hashOtp(rawOtp);

    // Set hashed OTP, 10 minute expiry, and reset attempts counter
    admin.resetOtp = hashedOtp;
    admin.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    admin.resetOtpAttempts = 0;
    await admin.save();

    // Dispatch real email
    await sendForgotPasswordOtpEmail(admin.email, admin.name, rawOtp, "Admin");

    const responsePayload = {
      success: true,
      message: "If an admin account with that email address exists, a password reset OTP has been sent.",
    };

    if (process.env.NODE_ENV === "development") {
      responsePayload.otp = rawOtp;
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

    const normalizedEmail = email.trim().toLowerCase();
    const Admin = createModel("Admin", AdminModel);
    const admin = await Admin.findOne({ email: normalizedEmail });

    if (!admin) {
      return Response.json(
        { error: "Invalid request or admin account not found." },
        { status: 400 }
      );
    }

    // Check if OTP exists or has expired
    if (!admin.resetOtp || !admin.resetOtpExpiry || new Date(admin.resetOtpExpiry) < new Date()) {
      admin.resetOtp = null;
      admin.resetOtpExpiry = null;
      admin.resetOtpAttempts = 0;
      await admin.save();
      return Response.json(
        { error: "The OTP code has expired or is invalid. Please request a new code." },
        { status: 400 }
      );
    }

    // Check brute force failed attempt limits (max 3)
    const currentAttempts = admin.resetOtpAttempts || 0;
    if (currentAttempts >= 3) {
      admin.resetOtp = null;
      admin.resetOtpExpiry = null;
      admin.resetOtpAttempts = 0;
      await admin.save();
      return Response.json(
        { error: "Maximum OTP reset attempts (3) exceeded. Please request a new code." },
        { status: 400 }
      );
    }

    // Verify OTP using timing-safe SHA-256 hash comparison
    const isMatch = verifyOtpHash(otp.trim(), admin.resetOtp);

    if (!isMatch) {
      const updatedAttempts = currentAttempts + 1;
      
      if (updatedAttempts >= 3) {
        admin.resetOtp = null;
        admin.resetOtpExpiry = null;
        admin.resetOtpAttempts = 0;
        await admin.save();
        return Response.json(
          { error: "Invalid OTP code. Maximum verification attempts (3) reached. Please request a new code." },
          { status: 400 }
        );
      }

      admin.resetOtpAttempts = updatedAttempts;
      await admin.save();

      const remainingAttempts = 3 - updatedAttempts;
      return Response.json(
        { error: `Invalid OTP code. ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining.` },
        { status: 400 }
      );
    }

    // Update password
    admin.password = newPassword;
    admin.resetOtp = null;
    admin.resetOtpExpiry = null;
    admin.resetOtpAttempts = 0;
    await admin.save();

    return Response.json(
      {
        success: true,
        message: "Your admin password has been reset successfully. You can now login with your new credentials.",
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
