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
import { UserModel, CourseModel, InternshipModel } from "@/models";
import crypto from "crypto";

// Handler for GET, POST
export async function GET(request) {
  try {
    await connectDB();

    // Get query parameters
    const url = new URL(request.url);
    const userId = url.searchParams.get("id");

    // Ensure referenced models are registered for populate
    createModel("Course", CourseModel);
    createModel("Internship", InternshipModel);
    const User = createModel("User", UserModel);

    if (userId) {
      // Get single user by ID with populated courses & internships
      const user = await User.findById(userId)
        .populate("ActiveCources.course")
        .populate("ActiveInternship.internship");

      if (!user) {
        return Response.json({ error: "User not found" }, { status: 404 });
      }

      const userObj = user.toObject();
      userObj.internshipDomain = userObj.ActiveInternship?.[0]?.internship?.domain || userObj.ActiveInternship?.[0]?.internship?.category || "";
      userObj.mode = userObj.ActiveInternship?.[0]?.internship?.mode || "";

      return Response.json({ success: true, data: userObj }, { status: 200 });
    } else {
      // Get all users with populated courses & internships
      const users = await User.find()
        .populate("ActiveCources.course")
        .populate("ActiveInternship.internship");

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

    // Auto-fill subject from department if not provided
    if (!data.subject && data.department) {
      data.subject = data.department;
    }

    // Capitalize gender to match schema enum ["Male", "Female", "Other"]
    if (data.gender) {
      data.gender = data.gender.charAt(0).toUpperCase() + data.gender.slice(1).toLowerCase();
    }

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

    // Handle Course or Internship selection and verification
    const paymentDetails = data.paymentDetails;
    const courseId = data.courseId || (paymentDetails?.type === "course" ? paymentDetails.itemId : null);
    const internshipId = data.internshipId || (paymentDetails?.type === "internship" ? paymentDetails.itemId : null);

    if (courseId) {
      const Course = createModel("Course", CourseModel);
      const matchedCourse = await Course.findById(courseId);
      if (!matchedCourse) {
        return Response.json(
          { error: "Selected course is not available for registration" },
          { status: 400 }
        );
      }

      const price = matchedCourse.price || 0;

      // Verify payment if price > 0
      if (price > 0) {
        if (!paymentDetails?.razorpay_payment_id || !paymentDetails?.razorpay_order_id || !paymentDetails?.razorpay_signature) {
          return Response.json(
            { error: "Payment verification details are required to enroll in this course" },
            { status: 400 }
          );
        }

        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        if (!keySecret) {
          return Response.json({ error: "Razorpay server secret not configured" }, { status: 500 });
        }

        const generatedSignature = crypto
          .createHmac("sha256", keySecret)
          .update(`${paymentDetails.razorpay_order_id}|${paymentDetails.razorpay_payment_id}`)
          .digest("hex");

        if (generatedSignature !== paymentDetails.razorpay_signature) {
          return Response.json({ error: "Invalid payment signature verification failed" }, { status: 400 });
        }
      }

      // Map selected course to ActiveCources reference on the User document
      data.ActiveCources = [
        {
          course: matchedCourse._id,
          courseStatus: "Active",
          progress: 0,
          paymentStatus: true,
          paymentDate: new Date(),
          amount: price,
        }
      ];

    } else {
      // Default / Internship registration
      const Internship = createModel("Internship", InternshipModel);
      let matchedInternship = null;

      if (internshipId) {
        matchedInternship = await Internship.findById(internshipId);
      } else if (data.internshipDomain) {
        matchedInternship = await Internship.findOne({
          $or: [{ domain: data.internshipDomain }, { category: data.internshipDomain }],
          status: { $in: ["Active", "Published"] }
        });
      }

      if (!matchedInternship) {
        return Response.json(
          { error: "Selected internship domain is not currently available for registration" },
          { status: 400 }
        );
      }

      const price = matchedInternship.RegistrationFee?.amount || 500;

      // Verify payment if price > 0
      if (price > 0) {
        if (!paymentDetails?.razorpay_payment_id || !paymentDetails?.razorpay_order_id || !paymentDetails?.razorpay_signature) {
          return Response.json(
            { error: "Payment verification details are required to register for this internship" },
            { status: 400 }
          );
        }

        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        if (!keySecret) {
          return Response.json({ error: "Razorpay server secret not configured" }, { status: 500 });
        }

        const generatedSignature = crypto
          .createHmac("sha256", keySecret)
          .update(`${paymentDetails.razorpay_order_id}|${paymentDetails.razorpay_payment_id}`)
          .digest("hex");

        if (generatedSignature !== paymentDetails.razorpay_signature) {
          return Response.json({ error: "Invalid payment signature verification failed" }, { status: 400 });
        }
      }

      // Map selected domain & mode to ActiveInternship reference on the User document
      data.ActiveInternship = [
        {
          internship: matchedInternship._id,
          internshipStatus: "Active",
          progress: 0,
          paymentStatus: true,
          paymentDate: new Date(),
          amount: price,
        }
      ];
    }

    // Create new user
    const newUser = new User(data);
    await newUser.save();

    console.log("✅ User created successfully:", newUser._id);

    const userWithoutPassword = newUser.toObject();
    delete userWithoutPassword.password;

    return Response.json(
      { success: true, message: "User created successfully", data: userWithoutPassword },
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

    // Capitalize gender to match schema enum ["Male", "Female", "Other"]
    if (data.gender) {
      data.gender = data.gender.charAt(0).toUpperCase() + data.gender.slice(1).toLowerCase();
    }

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
