import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { UserModel, AdminModel, VerificationOtpModel } from "@/models";
import { sendOtpEmail } from "@/lib/nodemailer";
import { generateSecureOtp, hashOtp, getClientIp, checkOtpRateLimit } from "@/lib/utils/otpHelper";
import dns from "dns";

const checkMxRecord = (domain) => {
  return new Promise((resolve) => {
    dns.promises
      .resolveMx(domain)
      .then((records) => resolve(records && records.length > 0))
      .catch(() => resolve(false));
  });
};

export async function POST(request) {
  try {
    await connectDB();

    const { email, purpose } = await request.json();

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
      return Response.json(
        { success: false, error: "Invalid email format. Correct email format example: user@gmail.com or student@university.edu" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const domain = normalizedEmail.split("@")[1];
    const tld = domain.split(".").pop();

    const invalidTlds = ["con", "cmo", "gmal", "gmai", "yaho", "hotmial", "outlok", "cm", "coom", "comm"];
    if (invalidTlds.includes(tld)) {
      return Response.json(
        { success: false, error: `Invalid email domain extension (.${tld}). Please enter a valid email address (e.g. user@gmail.com).` },
        { status: 400 }
      );
    }

    // Server-Side Rate Limiting (Provider Protection): Max 3 requests per 10 minutes per IP & Email
    const clientIp = getClientIp(request);
    
    const emailRateLimit = await checkOtpRateLimit(`ratelimit:otp:email:${normalizedEmail}`, 3, 600);
    if (!emailRateLimit.allowed) {
      return Response.json(
        {
          success: false,
          error: `Too many OTP requests for this email address. Please wait ${emailRateLimit.retryAfterSeconds} seconds before requesting a new code.`,
        },
        { status: 429 }
      );
    }

    const ipRateLimit = await checkOtpRateLimit(`ratelimit:otp:ip:${clientIp}`, 3, 600);
    if (!ipRateLimit.allowed) {
      return Response.json(
        {
          success: false,
          error: `Too many OTP requests from your connection. Please try again after ${ipRateLimit.retryAfterSeconds} seconds.`,
        },
        { status: 429 }
      );
    }

    const hasMx = await checkMxRecord(domain);
    if (!hasMx) {
      return Response.json(
        { success: false, error: `The email domain "${domain}" does not exist or cannot receive emails. Please check your email address.` },
        { status: 400 }
      );
    }

    // Compile models to make queries
    const User = createModel("User", UserModel);
    const Admin = createModel("Admin", AdminModel);
    const VerificationOtp = createModel("VerificationOtp", VerificationOtpModel);

    // 1. Check if email is already registered as a student user (skip if partner-student verification)
    if (purpose !== "partner-student" && purpose !== "login" && purpose !== "forgot-password") {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return Response.json(
          { success: false, error: "This email is already registered as a user." },
          { status: 400 }
        );
      }
    }

    // 2. Check if email is already registered as an admin
    if (purpose !== "partner-student") {
      const existingAdmin = await Admin.findOne({ email: normalizedEmail });
      if (existingAdmin) {
        return Response.json(
          { success: false, error: "This email is already registered as an admin." },
          { status: 400 }
        );
      }
    }

    // 3. Generate a cryptographically secure 6-digit OTP code and SHA-256 hash
    const rawOtp = generateSecureOtp();
    const hashedOtp = hashOtp(rawOtp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // 4. Save/Update HASHED OTP record in DB with reset attempts counter
    await VerificationOtp.findOneAndUpdate(
      { email: normalizedEmail },
      {
        otp: hashedOtp,
        attempts: 0,
        verified: false,
        expiresAt,
        verifiedAt: null,
      },
      { upsert: true, new: true }
    );

    // 5. Send raw OTP via Email
    await sendOtpEmail(normalizedEmail, rawOtp);

    const responsePayload = {
      success: true,
      message: "A verification OTP has been sent to your email address.",
    };

    // For developer convenience, leak OTP in JSON response strictly during local development
    if (process.env.NODE_ENV === "development") {
      responsePayload.otp = rawOtp;
    }

    return Response.json(responsePayload, { status: 200 });

  } catch (error) {
    console.error("❌ Error initiating email verification OTP:", error);
    return Response.json(
      { success: false, error: "Failed to send verification OTP", details: error.message },
      { status: 500 }
    );
  }
}
