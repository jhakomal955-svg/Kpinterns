/**
 * Admin Login API Route
 * Verifies admin credentials and returns token
 */

import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { AdminModel } from "@/models";
import { signToken } from "@/lib/jwt";
import { verifyTurnstileToken } from "@/lib/turnstile";
import bcrypt from "bcryptjs";

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

    const Admin = createModel("Admin", AdminModel);

    // Find admin by email or phone
    const admin = await Admin.findOne({
      $or: [
        { email: emailOrPhone.toLowerCase() },
        { mobile: emailOrPhone.replace(/\D/g, "") },
      ],
    });

    if (!admin) {
      return Response.json(
        { error: "Admin not found. Invalid email or phone." },
        { status: 404 },
      );
    }

    // Determine if the password stored in DB is a bcrypt hash
    const isHashed = admin.password && (admin.password.startsWith("$2a$") || admin.password.startsWith("$2b$") || admin.password.startsWith("$2y$"));
    
    let isMatch = false;
    if (isHashed) {
      isMatch = await bcrypt.compare(password, admin.password);
    } else {
      // Old plain-text password comparison
      isMatch = (admin.password === password);
      
      if (isMatch) {
        // Upgrade plain-text password to bcrypt hash on the fly
        admin.password = password; // pre-save hook will automatically hash it when we save!
        await admin.save();
        console.log(`🔒 Upgraded password to bcrypt for Admin: ${admin.email}`);
      }
    }

    if (!isMatch) {
      return Response.json(
        { success: false, error: "Invalid password" },
        { status: 401 },
      );
    }

    if (!admin.verified) {
      const adminData = admin.toObject();
      delete adminData.password;

      return Response.json(
        {
          success: false,
          error:
            "Your profile is not verified yet. Once verified, you will be able to login.",
          data: adminData,
        },
        { status: 403 },
      );
    }

    // Return admin data without password
    const adminData = admin.toObject();
    delete adminData.password;

    const token = signToken({
      _id: admin._id.toString(),
      email: admin.email,
      role: admin.role, // 'Admin' or 'Instructor'
    });

    return Response.json(
      {
        success: true,
        message: "Login successful",
        data: adminData,
        token: token,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error logging in admin:", error);
    return Response.json(
      { error: "Failed to login", details: error.message },
      { status: 500 },
    );
  }
}
