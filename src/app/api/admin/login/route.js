/**
 * Admin Login API Route
 * Verifies admin credentials and returns token
 */

import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { AdminModel } from "@/models";

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

    // Simple password comparison (in production, use bcrypt)
    if (admin.password !== password) {
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

    return Response.json(
      {
        success: true,
        message: "Login successful",
        data: adminData,
        token: "admin-token-" + admin._id,
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
