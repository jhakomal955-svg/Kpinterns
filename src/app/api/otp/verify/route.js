import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { VerificationOtpModel } from "@/models";

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

    // Check OTP match
    if (record.otp !== cleanOtp) {
      return Response.json(
        { success: false, error: "Invalid OTP code. Please try again." },
        { status: 400 }
      );
    }

    // Check expiry
    if (new Date(record.expiresAt) < new Date()) {
      return Response.json(
        { success: false, error: "The OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Mark as verified
    record.verified = true;
    record.verifiedAt = new Date();
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
