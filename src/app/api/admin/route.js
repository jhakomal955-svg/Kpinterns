/**
 * Admin API Routes
 * Complete CRUD operations for Admin model
 * GET - Get all admins or a specific admin
 * POST - Create a new admin
 * PUT - Update an admin
 * DELETE - Delete an admin
 */

import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { AdminModel, VerificationOtpModel, UserModel, CourseModel, InternshipModel, AttendanceModel } from "@/models";
import { verifyAuth } from "@/lib/jwt";

export async function GET(request) {
  try {
    await connectDB();

    // Authenticate Admin, Instructor, College Admin, or Cybercafe Partner
    const auth = verifyAuth(request, ["Admin", "Instructor", "College Admin", "Cybercafe Partner"]);
    if (!auth.authenticated) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const url = new URL(request.url);
    const adminId = url.searchParams.get("id");

    const Admin = createModel("Admin", AdminModel);

    if (adminId) {
      // Role-based check: College Admin and Cybercafe Partner should only fetch their own details
      if ((auth.user.role === "College Admin" || auth.user.role === "Cybercafe Partner") && auth.user._id !== adminId) {
        return Response.json({ error: "Access denied: insufficient permissions to view other admin profiles." }, { status: 403 });
      }

      // Ensure referenced models are registered for populate
      createModel("User", UserModel);
      createModel("Course", CourseModel);
      createModel("Internship", InternshipModel);
      createModel("Attendance", AttendanceModel);

      // Get single admin by ID
      const admin = await Admin.findById(adminId)
        .populate({
          path: "Usercreated",
          populate: [
            { path: "ActiveCources.course" },
            { path: "ActiveInternship.internship" },
            { path: "ActiveInternship.attendance" }
          ]
        })
        .select("-password");

      if (!admin) {
        return Response.json({ error: "Admin not found" }, { status: 404 });
      }

      return Response.json({ success: true, data: admin }, { status: 200 });
    } else {
      // Get all admins (exclude passwords)
      const admins = await Admin.find().select("-password");

      return Response.json(
        { success: true, data: admins, total: admins.length },
        { status: 200 },
      );
    }
  } catch (error) {
    console.error("Error fetching admins:", error);
    return Response.json(
      { error: "Failed to fetch admins", details: error.message },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const rawData = await request.json();
    const cleanEmail = rawData.email?.trim().toLowerCase();

    // Check if registration originates from the admin dashboard (bypasses OTP verification)
    const isDashboardCreation = rawData.isAdminCreation === true;

    // If it is dashboard creation, only authenticated Admins are allowed to do this
    if (isDashboardCreation) {
      const auth = verifyAuth(request, ["Admin"]);
      if (!auth.authenticated) {
        return Response.json({ error: auth.error }, { status: auth.status });
      }
    }

    const VerificationOtp = createModel("VerificationOtp", VerificationOtpModel);

    if (!isDashboardCreation) {
      // Verify OTP first before any processing or DB checks
      const verifiedOtpRecord = await VerificationOtp.findOne({
        email: cleanEmail,
        verified: true,
        verifiedAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) } // verified within the last 30 minutes
      });

      if (!verifiedOtpRecord) {
        return Response.json(
          { error: "Email address not verified. Please verify your email with OTP first." },
          { status: 400 }
        );
      }
    }
    const data = {
      name: rawData.name?.trim(),
      email: rawData.email?.trim().toLowerCase(),
      mobile: String(rawData.mobile || "").replace(/\D/g, ""),
      password: rawData.password,
      agreeTerms: rawData.agreeTerms,
      verified: isDashboardCreation ? (rawData.verified === true) : false,
      role: rawData.role || "Admin",
      bio: rawData.bio?.trim() || "",
      UniversityName: rawData.role === "College Admin" ? (rawData.UniversityName || "") : "",
      CollegeName: rawData.role === "College Admin" ? (rawData.CollegeName || "") : "",
    };

    // Validate required fields
    const requiredFields = ["name", "email", "mobile", "password"];

    for (const field of requiredFields) {
      if (!data[field]) {
        return Response.json(
          { error: `${field} is required` },
          { status: 400 },
        );
      }
    }

    if (!data.mobile || data.mobile.length !== 10) {
      return Response.json(
        { error: "Please enter a valid 10-digit mobile number." },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return Response.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const Admin = createModel("Admin", AdminModel);

    // Check if email already exists
    const existingEmail = await Admin.findOne({ email: data.email });
    if (existingEmail) {
      return Response.json(
        { error: "Admin with this email already exists" },
        { status: 400 },
      );
    }

    // Check if mobile number already exists
    const existingMobile = await Admin.findOne({ mobile: data.mobile });
    if (existingMobile) {
      return Response.json(
        { error: "Admin with this mobile number already exists" },
        { status: 400 },
      );
    }

    // Create new admin
    const newAdmin = new Admin(data);
    await newAdmin.save();

    // Delete the verified OTP record so it cannot be reused
    if (!isDashboardCreation) {
      await VerificationOtp.deleteOne({ email: cleanEmail });
    }

    console.log("✅ Admin created successfully:", newAdmin._id);

    // Return without password
    const adminData = newAdmin.toObject();
    delete adminData.password;

    return Response.json(
      { success: true, message: "Admin created successfully", data: adminData },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating admin:", error);
    return Response.json(
      { error: "Failed to create admin", details: error.message },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    await connectDB();

    // Authenticate Admin, Instructor, College Admin, or Cybercafe Partner
    const auth = verifyAuth(request, ["Admin", "Instructor", "College Admin", "Cybercafe Partner"]);
    if (!auth.authenticated) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const url = new URL(request.url);
    const adminId = url.searchParams.get("id");

    if (!adminId) {
      return Response.json({ error: "Admin ID is required" }, { status: 400 });
    }

    // Role-based validation: Non-Admins can only edit their own profile
    if (auth.user.role !== "Admin" && auth.user._id !== adminId) {
      return Response.json(
        { error: `Access denied: ${auth.user.role}s can only edit their own profile.` },
        { status: 403 }
      );
    }

    const data = await request.json();
    const Admin = createModel("Admin", AdminModel);

    // Only Admins can modify verification status and roles
    if (auth.user.role !== "Admin") {
      delete data.verified;
      delete data.role;
    }

    // Update admin
    const updatedAdmin = await Admin.findByIdAndUpdate(adminId, data, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedAdmin) {
      return Response.json({ error: "Admin not found" }, { status: 404 });
    }

    console.log("✅ Admin updated successfully:", adminId);

    return Response.json(
      {
        success: true,
        message: "Admin updated successfully",
        data: updatedAdmin,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating admin:", error);
    return Response.json(
      { error: "Failed to update admin", details: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    await connectDB();

    // Authenticate Admin
    const auth = verifyAuth(request, ["Admin"]);
    if (!auth.authenticated) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const url = new URL(request.url);
    const adminId = url.searchParams.get("id");

    if (!adminId) {
      return Response.json({ error: "Admin ID is required" }, { status: 400 });
    }

    // Prevent deleting oneself
    if (auth.user._id === adminId) {
      return Response.json({ error: "Cannot delete your own admin account." }, { status: 400 });
    }

    const Admin = createModel("Admin", AdminModel);

    // Delete admin
    const deletedAdmin = await Admin.findByIdAndDelete(adminId);

    if (!deletedAdmin) {
      return Response.json({ error: "Admin not found" }, { status: 404 });
    }

    console.log("✅ Admin deleted successfully:", adminId);

    return Response.json(
      { success: true, message: "Admin deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting admin:", error);
    return Response.json(
      { error: "Failed to delete admin", details: error.message },
      { status: 500 },
    );
  }
}
