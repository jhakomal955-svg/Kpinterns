import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { VerificationOtpModel } from "@/models";
import { verifyOtpHash } from "@/lib/utils/otpHelper";

export async function POST(request) {
  try {
    await connectDB();

    const { email, otp } = await request.json();

    if (!email || !otp) {
      return Response.json(
        { success: false, error: "Email and OTP code are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    const VerificationOtp = createModel("VerificationOtp", VerificationOtpModel);

    // Find active OTP record for the email
    const record = await VerificationOtp.findOne({ email: normalizedEmail });

    if (!record) {
      return Response.json(
        { success: false, error: "No OTP request found for this email. Please request a new code." },
        { status: 400 }
      );
    }

    // Check expiry
    if (new Date(record.expiresAt) < new Date()) {
      await VerificationOtp.deleteOne({ email: normalizedEmail });
      return Response.json(
        { success: false, error: "The OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Brute-force lockout check (max 3 failed attempts)
    const currentAttempts = record.attempts || 0;
    if (currentAttempts >= 3) {
      await VerificationOtp.deleteOne({ email: normalizedEmail });
      return Response.json(
        { success: false, error: "Maximum verification attempts exceeded. Please request a new OTP code." },
        { status: 400 }
      );
    }

    // Verify OTP match using secure SHA-256 hash comparison
    const isMatch = verifyOtpHash(cleanOtp, record.otp);

    if (!isMatch) {
      const updatedAttempts = currentAttempts + 1;
      
      if (updatedAttempts >= 3) {
        await VerificationOtp.deleteOne({ email: normalizedEmail });
        return Response.json(
          { success: false, error: "Invalid OTP code. Maximum verification attempts (3) reached. Please request a new code." },
          { status: 400 }
        );
      }

      record.attempts = updatedAttempts;
      await record.save();

      const remainingAttempts = 3 - updatedAttempts;
      return Response.json(
        { success: false, error: `Invalid OTP code. ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining.` },
        { status: 400 }
      );
    }

    // Mark as verified
    record.verified = true;
    record.verifiedAt = new Date();
    record.attempts = 0;
    await record.save();

    return Response.json(
      { success: true, message: "Email address verified successfully!" },
      { status: 200 }
    );

  } catch (error) {
    console.error("❌ Error verifying OTP:", error);
    return Response.json(
      { success: false, error: "Verification failed", details: error.message },
      { status: 500 }
    );
  }
}
