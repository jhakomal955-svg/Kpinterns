/**
 * User API Routes
 * Complete CRUD operations for User model
 * GET - Get all users or a specific user
 * POST - Create a new user
 * PUT - Update a user
 * DELETE - Delete a user
 */

import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { UserModel } from "@/models";

// Handler for GET, POST
export async function GET(request) {
  try {
    await connectDB();

    // Get query parameters
    const url = new URL(request.url);
    const userId = url.searchParams.get("id");

    const User = createModel("User", UserModel);

    if (userId) {
      // Get single user by ID
      const user = await User.findById(userId);

      if (!user) {
        return Response.json({ error: "User not found" }, { status: 404 });
      }

      return Response.json({ success: true, data: user }, { status: 200 });
    } else {
      // Get all users
      const users = await User.find();

      return Response.json(
        { success: true, data: users, total: users.length },
        { status: 200 },
      );
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    return Response.json(
      { error: "Failed to fetch users", details: error.message },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const data = await request.json();

    // Validate required fields
    const requiredFields = [
      "fullName",
      "email",
      "phone",
      "gender",
      "parentName",
      "university",
      "college",
      "degree",
      "department",
      "subject",
      "semester",
      "session",
      "registrationNumber",
      "emergencyName",
      "emergencyNumber",
      "relationship",
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        return Response.json(
          { error: `${field} is required` },
          { status: 400 },
        );
      }
    }

    const User = createModel("User", UserModel);

    // Check if user with email or phone already exists
    const existingUser = await User.findOne({
      $or: [{ email: data.email }, { phone: data.phone }],
    });

    if (existingUser) {
      return Response.json(
        { error: "User with this email or phone already exists" },
        { status: 400 },
      );
    }

    // Create new user
    const newUser = new User(data);
    await newUser.save();

    console.log("✅ User created successfully:", newUser._id);

    return Response.json(
      { success: true, message: "User created successfully", data: newUser },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return Response.json(
      { error: "Failed to create user", details: error.message },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const userId = url.searchParams.get("id");

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    const data = await request.json();
    const User = createModel("User", UserModel);

    // Update user
    const updatedUser = await User.findByIdAndUpdate(userId, data, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    console.log("✅ User updated successfully:", userId);

    return Response.json(
      {
        success: true,
        message: "User updated successfully",
        data: updatedUser,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return Response.json(
      { error: "Failed to update user", details: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const userId = url.searchParams.get("id");

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    const User = createModel("User", UserModel);

    // Delete user
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    console.log("✅ User deleted successfully:", userId);

    return Response.json(
      {
        success: true,
        message: "User deleted successfully",
        data: deletedUser,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return Response.json(
      { error: "Failed to delete user", details: error.message },
      { status: 500 },
    );
  }
}
