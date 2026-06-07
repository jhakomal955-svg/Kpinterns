import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { UserModel, AdminModel, VerificationOtpModel } from "@/models";
import { sendOtpEmail } from "@/lib/nodemailer";

export async function POST(request) {
  try {
    await connectDB();

    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Compile models to make queries
    const User = createModel("User", UserModel);
    const Admin = createModel("Admin", AdminModel);
    const VerificationOtp = createModel("VerificationOtp", VerificationOtpModel);

    // 1. Check if email is already registered as a student user
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return Response.json(
        { success: false, error: "This email is already registered as a user." },
        { status: 400 }
      );
    }

    // 2. Check if email is already registered as an admin
    const existingAdmin = await Admin.findOne({ email: normalizedEmail });
    if (existingAdmin) {
      return Response.json(
        { success: false, error: "This email is already registered as an admin." },
        { status: 400 }
      );
    }

    // 3. Generate a secure 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // 4. Save/Update OTP record in DB
    await VerificationOtp.findOneAndUpdate(
      { email: normalizedEmail },
      {
        otp,
        verified: false,
        expiresAt,
        verifiedAt: null,
      },
      { upsert: true, new: true }
    );

    // 5. Send OTP Email
    const emailRes = await sendOtpEmail(normalizedEmail, otp);

    const responsePayload = {
      success: true,
      message: "A verification OTP has been sent to your email address.",
    };

    // For developer convenience, leak OTP in JSON response only during local development
    if (process.env.NODE_ENV === "development" || emailRes.mocked) {
      responsePayload.otp = otp;
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
