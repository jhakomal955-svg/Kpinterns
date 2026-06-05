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
import { AdminModel } from "@/models";

export async function GET(request) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const adminId = url.searchParams.get("id");

    const Admin = createModel("Admin", AdminModel);

    if (adminId) {
      // Get single admin by ID
      const admin = await Admin.findById(adminId).select("-password");

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
    const data = {
      name: rawData.name?.trim(),
      email: rawData.email?.trim().toLowerCase(),
      mobile: String(rawData.mobile || "").replace(/\D/g, ""),
      password: rawData.password,
      agreeTerms: rawData.agreeTerms,
      verified: rawData.verified !== undefined ? rawData.verified : false,
      role: rawData.role || "Admin",
      bio: rawData.bio?.trim() || "",
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

    // Check if admin with email or mobile already exists
    const existingAdmin = await Admin.findOne({
      $or: [{ email: data.email }, { mobile: data.mobile }],
    });

    if (existingAdmin) {
      return Response.json(
        { error: "Admin with this email or mobile already exists" },
        { status: 400 },
      );
    }

    // Create new admin
    const newAdmin = new Admin(data);
    await newAdmin.save();

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

    const url = new URL(request.url);
    const adminId = url.searchParams.get("id");

    if (!adminId) {
      return Response.json({ error: "Admin ID is required" }, { status: 400 });
    }

    const data = await request.json();
    const Admin = createModel("Admin", AdminModel);

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

    const url = new URL(request.url);
    const adminId = url.searchParams.get("id");

    if (!adminId) {
      return Response.json({ error: "Admin ID is required" }, { status: 400 });
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
