/**
 * User API Routes
 * Complete CRUD operations for User model
 * GET - Get all users or a specific user
 * POST - Create a new user
 * PUT - Update a user
 * DELETE - Delete a user
 */

import connectDB from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { createModel } from "@/lib/utils/schemaBuilder";
import { UserModel, CourseModel, InternshipModel, VerificationOtpModel, AttendanceModel, AdminModel } from "@/models";
import crypto from "crypto";
import { after } from "next/server";
import { sendAllotmentAndPaymentSlipEmail } from "@/lib/nodemailer";
import { verifyAuth, getAuthUser } from "@/lib/jwt";
import { checkAndAutomateDocuments } from "@/lib/documentAutomation";
import { generatePaymentReceipt } from "@/lib/pdfGenerator";
import { uploadBufferToCloudinary } from "@/lib/cloudinary";
import { syncUserProgressAndStatus } from "@/lib/progressSync";

function calculateEndDate(startDate, durationStr) {
  const date = new Date(startDate);
  switch (durationStr) {
    case "1-week":
      date.setDate(date.getDate() + 7);
      break;
    case "2-weeks":
      date.setDate(date.getDate() + 14);
      break;
    case "1-month":
      date.setMonth(date.getMonth() + 1);
      break;
    case "3-months":
      date.setMonth(date.getMonth() + 3);
      break;
    case "6-months":
      date.setMonth(date.getMonth() + 6);
      break;
    case "1-year":
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      date.setMonth(date.getMonth() + 1);
    }
  return date;
}

function calculateCourseEndDate(startDate, accessDuration) {
  if (!accessDuration || accessDuration === "lifetime") {
    return null;
  }
  const date = new Date(startDate);
  switch (accessDuration) {
    case "1-month":
      date.setMonth(date.getMonth() + 1);
      break;
    case "3-months":
      date.setMonth(date.getMonth() + 3);
      break;
    case "6-months":
      date.setMonth(date.getMonth() + 6);
      break;
    case "1-year":
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      return null;
  }
  return date;
}

// Handler for GET, POST
export async function GET(request) {
  try {
    await connectDB();

    // Authenticate Admin, College Admin, or User
    const auth = verifyAuth(request, ["Admin", "College Admin", "User"]);
    if (!auth.authenticated) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    // Get query parameters
    const url = new URL(request.url);
    const userId = url.searchParams.get("id");

    // Enforce matching user ID if not Admin / College Admin
    if (auth.user.role === "User" && userId !== auth.user._id) {
      return Response.json({ error: "Access denied: cannot retrieve another user's profile information." }, { status: 403 });
    }

    // Ensure referenced models are registered for populate
    createModel("Course", CourseModel);
    createModel("Internship", InternshipModel);
    const Attendance = createModel("Attendance", AttendanceModel);
    const User = createModel("User", UserModel);
    const Admin = createModel("Admin", AdminModel);

    // If College Admin, retrieve their CollegeName
    let collegeNameFilter = null;
    if (auth.user.role === "College Admin") {
      const collegeAdminDoc = await Admin.findById(auth.user._id);
      if (!collegeAdminDoc || !collegeAdminDoc.CollegeName) {
        if (userId) {
          return Response.json({ error: "Access denied: your account is not associated with a college." }, { status: 403 });
        }
        return Response.json({ success: true, data: [], total: 0 }, { status: 200 });
      }
      collegeNameFilter = collegeAdminDoc.CollegeName.trim();
    }

    if (userId) {
      const user = await User.findById(userId);
      if (!user) {
        return Response.json({ error: "User not found" }, { status: 404 });
      }

      // Sync progress & status before checking/generating documents
      await syncUserProgressAndStatus(user);

      // Trigger automated document checks (heals any missed offer letters or certificates on profile view)
      try {
        await checkAndAutomateDocuments(userId);
      } catch (docError) {
        console.error("❌ Failed to run automated document checks on GET user profile:", docError);
      }

      // Refetch the latest user from the DB (with populated fields) to ensure we have any newly generated documents
      const freshUser = await User.findById(userId)
        .populate("ActiveCources.course")
        .populate("ActiveInternship.internship")
        .populate("ActiveInternship.attendance");

      if (!freshUser) {
        return Response.json({ error: "User not found" }, { status: 404 });
      }

      // If College Admin, verify the student belongs to their college
      if (collegeNameFilter) {
        const isSameCollege = freshUser.college?.toLowerCase().trim() === collegeNameFilter.toLowerCase();
        if (!isSameCollege) {
          return Response.json({ error: "Access denied: student does not belong to your college." }, { status: 403 });
        }
      }

      // Lazy link any missing Attendance docs on the freshUser
      let hasAttendanceChanges = false;
      for (const item of freshUser.ActiveInternship || []) {
        if (!item.attendance && item.internship) {
          const newAtt = new Attendance({
            user: freshUser._id,
            internship: item.internship._id || item.internship,
            records: []
          });
          await newAtt.save();
          item.attendance = newAtt._id;
          hasAttendanceChanges = true;
        }
      }
      if (hasAttendanceChanges) {
        freshUser.markModified("ActiveInternship");
        await freshUser.save();
      }

      const userObj = freshUser.toObject();
      userObj.internshipDomain = userObj.ActiveInternship?.[0]?.internship?.domain || userObj.ActiveInternship?.[0]?.internship?.category || "";
      userObj.mode = userObj.ActiveInternship?.[0]?.internship?.mode || "";

      return Response.json({ success: true, data: userObj }, { status: 200 });
    } else {
      // Block non-authorized users from listing all users
      if (auth.user.role !== "Admin" && auth.user.role !== "College Admin") {
        return Response.json({ error: "Access denied: insufficient permissions to list all users." }, { status: 403 });
      }

      // Query filter
      const query = {};
      if (collegeNameFilter) {
        query.college = { $regex: new RegExp("^" + collegeNameFilter + "$", "i") };
      }

      // Get users with populated courses & internships
      const users = await User.find(query)
        .populate("ActiveCources.course")
        .populate("ActiveInternship.internship")
        .populate("ActiveInternship.attendance");

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

    // Check if registered by a Cybercafe Partner
    let cybercafePartnerId = null;
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const decoded = getAuthUser(request);
      if (decoded && decoded.role === "Cybercafe Partner") {
        cybercafePartnerId = decoded._id;
      }
    }

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
      "rollNumber",
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

        const startDate = new Date();
        const accessDuration = matchedCourse.accessDuration || "lifetime";
        const endDate = calculateCourseEndDate(startDate, accessDuration);

        // Map selected course to ActiveCources reference on the User document
        data.ActiveCources = [
          {
            course: matchedCourse._id,
            courseStatus: "Active",
            progress: 0,
            paymentStatus: true,
            paymentDate: startDate,
            paymentId: paymentDetails?.razorpay_payment_id || null,
            amount: price,
            startDate: startDate,
            endDate: endDate,
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

        const startDate = new Date();
        const duration = matchedInternship.duration || "1-month";
        const endDate = calculateEndDate(startDate, duration);

        // Map selected domain & mode to ActiveInternship reference on the User document
        data.ActiveInternship = [
          {
            internship: matchedInternship._id,
            internshipStatus: "Active",
            progress: 0,
            paymentStatus: true,
            paymentDate: startDate,
            paymentId: paymentDetails?.razorpay_payment_id || null,
            amount: price,
            startDate: startDate,
            endDate: endDate,
          }
        ];
      }
    }

    // Create new user
    const newUser = new User(data);
    await newUser.save();

    // Store in cybercafe Usercreated field if created by a Cybercafe Partner
    if (cybercafePartnerId) {
      const Admin = createModel("Admin", AdminModel);
      await Admin.findByIdAndUpdate(cybercafePartnerId, {
        $addToSet: { Usercreated: newUser._id }
      });
    }

    // Defer slow operations to run in the background after response is sent
    after(async () => {
      try {
        // Delete the verified OTP record so it cannot be reused
        if (!isDashboardCreation) {
          await VerificationOtp.deleteOne({ email: normalizedEmail });
        }

        // Send the allotment and receipt email to the user (only for client-side registrations)
        if (!isDashboardCreation && resolvedType) {
          let receiptPdfBuffer = null;

          // Step 1: Generate PDF receipt
          try {
            receiptPdfBuffer = await generatePaymentReceipt(newUser.toObject(), {
              purchaseType: resolvedType,
              title: resolvedTitle,
              amount: resolvedPrice,
              paymentId: paymentDetails?.razorpay_payment_id || "N/A",
              orderId: paymentDetails?.razorpay_order_id || "N/A",
              date: new Date(),
            });
          } catch (pdfErr) {
            console.error("❌ Failed to generate payment receipt PDF:", pdfErr);
          }

          // Step 2: Upload PDF to Cloudinary and save URL on user document
          if (receiptPdfBuffer) {
            try {
              const filename = `payment_receipt_${newUser._id}_${Date.now()}`;
              const uploadResult = await uploadBufferToCloudinary(receiptPdfBuffer, {
                public_id: filename,
                folder: "kpinterns/receipts",
                resource_type: "auto",
              });
              const receiptCloudinaryUrl = uploadResult.secure_url;

              // Save URL directly on the user record in database to avoid in-memory model saves
              if (resolvedType === "internship" && newUser.ActiveInternship?.length > 0) {
                await User.updateOne(
                  { _id: newUser._id, "ActiveInternship.internship": newUser.ActiveInternship[newUser.ActiveInternship.length - 1].internship },
                  { $set: { "ActiveInternship.$.paymentreceipt": receiptCloudinaryUrl } }
                );
              } else if (resolvedType === "course" && newUser.ActiveCources?.length > 0) {
                await User.updateOne(
                  { _id: newUser._id, "ActiveCources.course": newUser.ActiveCources[newUser.ActiveCources.length - 1].course },
                  { $set: { "ActiveCources.$.paymentreceipt": receiptCloudinaryUrl } }
                );
              }
            } catch (uploadErr) {
              console.error("❌ Failed to upload receipt PDF to Cloudinary:", uploadErr);
            }
          }

          // Step 3: Send confirmation email (with PDF buffer as attachment)
          try {
            await sendAllotmentAndPaymentSlipEmail(normalizedEmail, data.fullName, {
              purchaseType: resolvedType,
              title: resolvedTitle,
              amount: resolvedPrice,
              paymentId: paymentDetails?.razorpay_payment_id || "N/A",
              orderId: paymentDetails?.razorpay_order_id || "N/A",
              date: new Date(),
              isNewRegistration: true,
              receiptPdfBuffer,
            });
          } catch (mailError) {
            console.error("❌ Failed to send registration allotment receipt email:", mailError);
          }
        }

        // Run automated document generation (e.g. generate and email offer letter for new internship enrollment)
        try {
          await checkAndAutomateDocuments(newUser._id.toString());
        } catch (docError) {
          console.error("❌ Failed to run automated document checks on registration:", docError);
        }
      } catch (bgError) {
        console.error("❌ Error running background registration jobs:", bgError);
      }
    });

    const userWithoutPassword = newUser.toObject();
    delete userWithoutPassword.password;

    return Response.json(
      { success: true, message: "User created successfully", data: userWithoutPassword },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating user:", error);

    // Handle MongoDB unique key constraints cleanly (duplicate registration/phone/email)
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0] || "field";
      let fieldLabel = duplicateField;
      if (duplicateField === "email") fieldLabel = "email address";
      if (duplicateField === "phone") fieldLabel = "phone number";
      if (duplicateField === "registrationNumber") fieldLabel = "registration number";
      
      return Response.json(
        { error: `User with this ${fieldLabel} already exists.` },
        { status: 400 }
      );
    }

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

    // Hash password if updated by admin
    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
    }

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

    // User updated

    // Sync progress & status based on any admin updates
    await syncUserProgressAndStatus(updatedUser);

    // Run automated document checks (e.g. checking completion status or new enrollments updated by admin)
    let finalUser = updatedUser;
    try {
      await checkAndAutomateDocuments(userId);
      // Refetch to return populated URLs and updated progress/status
      finalUser = await User.findById(userId)
        .populate("ActiveCources.course")
        .populate("ActiveInternship.internship")
        .populate("ActiveInternship.attendance");
    } catch (docError) {
      console.error("❌ Failed to run automated document checks on update:", docError);
    }

    return Response.json(
      {
        success: true,
        message: "User updated successfully",
        data: finalUser,
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

    // User deleted

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
