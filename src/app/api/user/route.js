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
import { UserModel, CourseModel, InternshipModel, VerificationOtpModel } from "@/models";
import crypto from "crypto";
import { sendAllotmentAndPaymentSlipEmail } from "@/lib/nodemailer";
import { verifyAuth } from "@/lib/jwt";

// Handler for GET, POST
export async function GET(request) {
  try {
    await connectDB();

    // Authenticate Admin or User
    const auth = verifyAuth(request, ["Admin", "User"]);
    if (!auth.authenticated) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    // Get query parameters
    const url = new URL(request.url);
    const userId = url.searchParams.get("id");

    // Enforce matching user ID if not Admin
    if (auth.user.role === "User" && userId !== auth.user._id) {
      return Response.json({ error: "Access denied: cannot retrieve another user's profile information." }, { status: 403 });
    }

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
      // Block non-Admin users from listing all users
      if (auth.user.role !== "Admin") {
        return Response.json({ error: "Access denied: insufficient permissions to list all users." }, { status: 403 });
      }

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

    // Verify OTP first before any processing or DB checks
    const normalizedEmail = data.email?.trim().toLowerCase();
    const VerificationOtp = createModel("VerificationOtp", VerificationOtpModel);
    
    // Check if user is being manually registered via Admin Dashboard
    const isDashboardCreation = data.isAdminCreation === true;

    if (isDashboardCreation) {
      // Manually registering a user via dashboard is restricted to Admin
      const auth = verifyAuth(request, ["Admin"]);
      if (!auth.authenticated) {
        return Response.json({ error: auth.error }, { status: auth.status });
      }
    } else {
      const verifiedOtpRecord = await VerificationOtp.findOne({
        email: normalizedEmail,
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

    // Mark user as verified since email was verified
    data.verified = true;

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

    // Check if email already exists
    const existingEmail = await User.findOne({ email: data.email });
    if (existingEmail) {
      return Response.json(
        { error: "User with this email already exists" },
        { status: 400 },
      );
    }

    // Check if phone number already exists
    const existingPhone = await User.findOne({ phone: data.phone });
    if (existingPhone) {
      return Response.json(
        { error: "User with this phone number already exists" },
        { status: 400 },
      );
    }

    // Check if registration number already exists
    const existingReg = await User.findOne({ registrationNumber: data.registrationNumber });
    if (existingReg) {
      return Response.json(
        { error: "User with this registration number already exists" },
        { status: 400 },
      );
    }


    // Handle Course or Internship selection and verification
    const paymentDetails = data.paymentDetails;
    let resolvedTitle = "";
    let resolvedType = "";
    let resolvedPrice = 0;

    if (!isDashboardCreation) {
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
        resolvedTitle = matchedCourse.title;
        resolvedType = "course";
        resolvedPrice = price;

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
            paymentId: paymentDetails?.razorpay_payment_id || null,
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
        resolvedTitle = matchedInternship.title || matchedInternship.position || data.internshipDomain;
        resolvedType = "internship";
        resolvedPrice = price;

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
            paymentId: paymentDetails?.razorpay_payment_id || null,
            amount: price,
          }
        ];
      }
    }

    // Create new user
    const newUser = new User(data);
    await newUser.save();

    // Delete the verified OTP record so it cannot be reused
    if (!isDashboardCreation) {
      await VerificationOtp.deleteOne({ email: normalizedEmail });
    }

    // Send the allotment and receipt email to the user (only for client-side registrations)
    if (!isDashboardCreation && resolvedType) {
      try {
        await sendAllotmentAndPaymentSlipEmail(normalizedEmail, data.fullName, {
          purchaseType: resolvedType,
          title: resolvedTitle,
          amount: resolvedPrice,
          paymentId: paymentDetails?.razorpay_payment_id || "N/A",
          orderId: paymentDetails?.razorpay_order_id || "N/A",
          date: new Date(),
          isNewRegistration: true,
        });
      } catch (mailError) {
        console.error("❌ Failed to send registration allotment receipt email:", mailError);
      }
    }

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

    // Authenticate Admin or User
    const auth = verifyAuth(request, ["Admin", "User"]);
    if (!auth.authenticated) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const url = new URL(request.url);
    const userId = url.searchParams.get("id");

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    // Regular users can only update their own profile
    if (auth.user.role === "User" && userId !== auth.user._id) {
      return Response.json({ error: "Access denied: cannot edit another user's profile." }, { status: 403 });
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

    // Authenticate Admin only
    const auth = verifyAuth(request, ["Admin"]);
    if (!auth.authenticated) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

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
