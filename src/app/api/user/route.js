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
import { UserModel, CourseModel, InternshipModel, VerificationOtpModel, AttendanceModel, AdminModel, PartnerStudentModel, LeadModel } from "@/models";
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
    case "1 Week":
      date.setDate(date.getDate() + 7);
      break;
    case "2-weeks":
    case "2 Weeks":
      date.setDate(date.getDate() + 14);
      break;
    case "4-week":
    case "4-weeks":
    case "4 Weeks":
      date.setDate(date.getDate() + 28);
      break;
    case "6-weeks":
    case "6 Weeks":
      date.setDate(date.getDate() + 42);
      break;
    case "8-weeks":
    case "8 Weeks":
      date.setDate(date.getDate() + 56);
      break;
    case "12-weeks":
    case "12 Weeks":
      date.setDate(date.getDate() + 84);
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
      date.setDate(date.getDate() + 14);
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

    // Authenticate Admin, Employee, College Admin, Instructor, or User
    const auth = verifyAuth(request, ["Admin", "Employee", "College Admin", "Instructor", "User"]);
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
        if (!item.attendance && item.internship && item.internshipStatus !== "Completed") {
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

      // Defer slow progress sync & document healing to the background
      after(async () => {
        try {
          const uDoc = await User.findById(userId);
          if (uDoc) {
            await syncUserProgressAndStatus(uDoc);
            await checkAndAutomateDocuments(userId);
          }
        } catch (bgError) {
          console.error("❌ Error running background sync/automation on GET user profile:", bgError);
        }
      });

      const userObj = freshUser.toObject();
      userObj.internshipDomain = userObj.ActiveInternship?.[0]?.internship?.domain || userObj.ActiveInternship?.[0]?.internship?.category || "";
      userObj.mode = userObj.ActiveInternship?.[0]?.internship?.mode || "";

      return Response.json({ success: true, data: userObj }, { status: 200 });
    } else {
      // Block non-authorized users from listing all users
      if (
        auth.user.role !== "Admin" &&
        auth.user.role !== "College Admin" &&
        auth.user.role !== "Instructor" &&
        auth.user.role !== "Employee"
      ) {
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

    // Normalize email
    const normalizedEmail = data.email?.trim().toLowerCase();
    
    // Check if user is being manually registered via Admin Dashboard
    const isDashboardCreation = data.isAdminCreation === true;
    let dashboardCreatorId = null;
    let dashboardCreatorRole = null;

    if (isDashboardCreation) {
      // Manually registering a user via dashboard is allowed for Admin and Employee
      const auth = verifyAuth(request, ["Admin", "Employee"]);
      if (!auth.authenticated) {
        return Response.json({ error: auth.error }, { status: auth.status });
      }
      dashboardCreatorId = auth.user._id;
      dashboardCreatorRole = auth.user.role;
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

    // Clean and validate Indian phone number format
    const cleanedPhone = String(data.phone || "").replace(/\D/g, "");
    let normalizedPhone = cleanedPhone;
    if (cleanedPhone.length === 12 && cleanedPhone.startsWith("91")) {
      normalizedPhone = cleanedPhone.substring(2);
    } else if (cleanedPhone.length === 11 && cleanedPhone.startsWith("0")) {
      normalizedPhone = cleanedPhone.substring(1);
    }

    if (!/^[6-9]\d{9}$/.test(normalizedPhone)) {
      return Response.json(
        { error: "Please enter a valid 10-digit Indian mobile number." },
        { status: 400 },
      );
    }
    data.phone = normalizedPhone;

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

        let price = matchedCourse.price || 0;

        // Apply custom rates if the user belongs to a verified College Admin college with rates > 0
        if (data.college) {
          const Admin = createModel("Admin", AdminModel);
          const escapedCollege = data.college.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
          const collegeAdmin = await Admin.findOne({
            role: "College Admin",
            verified: true,
            CollegeName: { $regex: new RegExp("^" + escapedCollege + "$", "i") }
          });
          if (collegeAdmin && typeof collegeAdmin.courseRate === "number" && collegeAdmin.courseRate >= 0) {
            price = collegeAdmin.courseRate;
          }
        }

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

        const actualPaidAmount = typeof paymentDetails?.amount === "number" ? paymentDetails.amount : price;
        const originalAmount = typeof paymentDetails?.originalAmount === "number" ? paymentDetails.originalAmount : price;
        const couponCode = paymentDetails?.couponCode || null;
        const discountAmount = typeof paymentDetails?.discountAmount === "number" ? paymentDetails.discountAmount : Math.max(0, originalAmount - actualPaidAmount);

        // Map selected course to ActiveCources reference on the User document
        data.ActiveCources = [
          {
            course: matchedCourse._id,
            courseStatus: "Active",
            progress: 0,
            paymentStatus: true,
            paymentDate: startDate,
            paymentId: paymentDetails?.razorpay_payment_id || null,
            amount: actualPaidAmount,
            originalAmount: originalAmount,
            couponCode: couponCode,
            discountAmount: discountAmount,
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

        let price = matchedInternship.RegistrationFee?.amount || 500;

        // Apply custom rates if the user belongs to a verified College Admin college with rates >= 0
        if (data.college) {
          const Admin = createModel("Admin", AdminModel);
          const escapedCollege = data.college.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
          const collegeAdmin = await Admin.findOne({
            role: "College Admin",
            verified: true,
            CollegeName: { $regex: new RegExp("^" + escapedCollege + "$", "i") }
          });
          if (collegeAdmin && typeof collegeAdmin.internshipRate === "number" && collegeAdmin.internshipRate >= 0) {
            price = collegeAdmin.internshipRate;
          }
        }

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
        const duration = matchedInternship.duration || "2 Weeks";
        const endDate = calculateEndDate(startDate, duration);

        const actualPaidAmount = typeof paymentDetails?.amount === "number" ? paymentDetails.amount : price;
        const defaultOriginalFee = matchedInternship.RegistrationFee?.amount !== undefined ? Number(matchedInternship.RegistrationFee.amount) : 500;
        const originalAmount = typeof paymentDetails?.originalAmount === "number" ? paymentDetails.originalAmount : (price > 0 ? price : defaultOriginalFee);
        const couponCode = paymentDetails?.couponCode || null;
        const discountAmount = typeof paymentDetails?.discountAmount === "number" ? paymentDetails.discountAmount : Math.max(0, originalAmount - actualPaidAmount);

        // Map selected domain & mode to ActiveInternship reference on the User document
        data.ActiveInternship = [
          {
            internship: matchedInternship._id,
            internshipStatus: "Active",
            progress: 0,
            paymentStatus: true,
            paymentDate: startDate,
            paymentId: paymentDetails?.razorpay_payment_id || null,
            amount: actualPaidAmount,
            originalAmount: originalAmount,
            couponCode: couponCode,
            discountAmount: discountAmount,
            startDate: startDate,
            endDate: endDate,
          }
        ];
      }
    }

    // Enforce partner college internship starting date OR user selected internship starting date
    if (data.ActiveInternship && data.ActiveInternship.length > 0) {
      let customStart = null;

      if (data.college) {
        const Admin = createModel("Admin", AdminModel);
        const escapedCollege = data.college.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
        const collegeAdmin = await Admin.findOne({
          role: "College Admin",
          verified: true,
          CollegeName: { $exists: true, $ne: "", $regex: new RegExp("^" + escapedCollege + "$", "i") }
        });
        if (collegeAdmin && collegeAdmin.internshipStartDate) {
          customStart = new Date(collegeAdmin.internshipStartDate);
        }
      }

      // If college is not a partner college or has no start date, check if user provided their custom internshipStartDate
      if (!customStart && data.internshipStartDate) {
        const parsed = new Date(data.internshipStartDate);
        if (!isNaN(parsed.getTime())) {
          customStart = parsed;
        }
      }

      if (customStart && !isNaN(customStart.getTime())) {
        const Internship = createModel("Internship", InternshipModel);
        for (const item of data.ActiveInternship) {
          item.startDate = customStart;
          let duration = "2 Weeks";
          if (item.internship) {
            const intDoc = await Internship.findById(item.internship);
            if (intDoc?.duration) duration = intDoc.duration;
          }
          item.endDate = calculateEndDate(customStart, duration);
        }
      }
    }

    // Generate and attach payment receipt during registration once payment is verified
    // IMPORTANT: If registration fee is 0 (college partner 0 rate or waived), do NOT generate receipt
    let receiptPdfBuffer = null;
    let receiptCloudinaryUrl = "";

    if (!isDashboardCreation && resolvedType) {
      const activeItem = resolvedType === "internship" ? data.ActiveInternship?.[0] : data.ActiveCources?.[0];
      const actualPaidAmount = activeItem?.amount ?? resolvedPrice;
      const origAmount = activeItem?.originalAmount ?? resolvedPrice;
      const appliedCouponCode = activeItem?.couponCode || null;
      const appliedDiscount = activeItem?.discountAmount ?? 0;

      if (actualPaidAmount > 0) {
        try {
          receiptPdfBuffer = await generatePaymentReceipt(data, {
            purchaseType: resolvedType,
            title: resolvedTitle,
            amount: actualPaidAmount,
            originalAmount: origAmount,
            couponCode: appliedCouponCode,
            discountAmount: appliedDiscount,
            paymentId: paymentDetails?.razorpay_payment_id || "N/A",
            orderId: paymentDetails?.razorpay_order_id || "N/A",
            date: new Date(),
          });

          if (receiptPdfBuffer) {
            const filename = `payment_receipt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
            const uploadResult = await uploadBufferToCloudinary(receiptPdfBuffer, {
              public_id: filename,
              folder: "kpinterns/receipts",
              resource_type: "auto",
            });
            receiptCloudinaryUrl = uploadResult?.secure_url || "";
          }
        } catch (receiptErr) {
          console.error("❌ Failed to generate/upload payment receipt during registration:", receiptErr);
        }

        if (receiptCloudinaryUrl) {
          if (resolvedType === "internship" && data.ActiveInternship?.length > 0) {
            data.ActiveInternship[0].paymentreceipt = receiptCloudinaryUrl;
          } else if (resolvedType === "course" && data.ActiveCources?.length > 0) {
            data.ActiveCources[0].paymentreceipt = receiptCloudinaryUrl;
          }
        }
      }
    }

    // Create new user
    const newUser = new User(data);
    await newUser.save();

    // Delete corresponding lead upon completed user registration
    try {
      const Lead = createModel("Lead", LeadModel);
      const leadQuery = [];
      if (newUser.email) leadQuery.push({ email: newUser.email.trim().toLowerCase() });
      if (newUser.phone) leadQuery.push({ phone: newUser.phone.trim() });
      if (leadQuery.length > 0) {
        await Lead.deleteMany({ $or: leadQuery });
      }
    } catch (leadErr) {
      console.error("Error deleting lead on user creation:", leadErr);
    }

    // Consume & invalidate verified OTP record after successful account creation (if exists)
    if (!isDashboardCreation) {
      try {
        const VerificationOtp = createModel("VerificationOtp", VerificationOtpModel);
        await VerificationOtp.deleteOne({ email: normalizedEmail });
      } catch (otpErr) {}
    }

    // Link PartnerStudent record if student exists in roster
    const cleanReg = (newUser.registrationNumber || "").trim();
    const cleanRoll = (newUser.rollNumber || "").trim();
    const cleanEmail = (newUser.email || "").trim().toLowerCase();

    if (cleanReg || cleanRoll || cleanEmail) {
      const PartnerStudent = createModel("PartnerStudent", PartnerStudentModel);
      const orConditions = [];
      if (cleanReg) orConditions.push({ registrationNumber: cleanReg });
      if (cleanRoll) orConditions.push({ rollNumber: cleanRoll });
      if (cleanEmail) orConditions.push({ email: cleanEmail });

      await PartnerStudent.findOneAndUpdate(
        { $or: orConditions },
        {
          enrolledUserId: newUser._id,
          enrolledInternshipId: data.ActiveInternship?.[0]?.internship,
        }
      );
    }

    // Store in creator's Usercreated field
    const finalCreatorId = dashboardCreatorId || cybercafePartnerId;
    if (finalCreatorId) {
      const Admin = createModel("Admin", AdminModel);
      const updateObj = {
        $addToSet: { Usercreated: newUser._id }
      };

      // If created by an Employee, and the user has an active internship, credit the fee to their totalRevenue
      if (dashboardCreatorRole === "Employee" && data.ActiveInternship && data.ActiveInternship.length > 0) {
        const feeAmount = data.ActiveInternship[0].amount || 0;
        if (feeAmount > 0) {
          updateObj.$inc = { totalRevenue: feeAmount };
        }
      }

      await Admin.findByIdAndUpdate(finalCreatorId, updateObj);
    }

    // Defer slow operations to run in the background after response is sent
    after(async () => {
      try {
        // Delete the verified OTP record so it cannot be reused
        if (!isDashboardCreation) {
          try {
            const VerificationOtp = createModel("VerificationOtp", VerificationOtpModel);
            await VerificationOtp.deleteOne({ email: normalizedEmail });
          } catch (otpErr) {}
        }

        // Send the allotment and receipt email to the user (only for client-side registrations)
        if (!isDashboardCreation && resolvedType) {
          const activeItem = resolvedType === "internship"
            ? (newUser.ActiveInternship?.[newUser.ActiveInternship.length - 1] || data.ActiveInternship?.[0])
            : (newUser.ActiveCources?.[newUser.ActiveCources.length - 1] || data.ActiveCources?.[0]);
          const actualPaidAmount = activeItem?.amount ?? resolvedPrice;
          const origAmount = activeItem?.originalAmount ?? resolvedPrice;
          const appliedCouponCode = activeItem?.couponCode || null;
          const appliedDiscount = activeItem?.discountAmount ?? 0;

          // Fallback: If receipt was not uploaded before user save, upload and update user now (only if paid amount > 0)
          if (!receiptCloudinaryUrl && actualPaidAmount > 0) {
            try {
              if (!receiptPdfBuffer) {
                receiptPdfBuffer = await generatePaymentReceipt(newUser.toObject(), {
                  purchaseType: resolvedType,
                  title: resolvedTitle,
                  amount: actualPaidAmount,
                  originalAmount: origAmount,
                  couponCode: appliedCouponCode,
                  discountAmount: appliedDiscount,
                  paymentId: paymentDetails?.razorpay_payment_id || "N/A",
                  orderId: paymentDetails?.razorpay_order_id || "N/A",
                  date: new Date(),
                });
              }

              if (receiptPdfBuffer) {
                const filename = `payment_receipt_${newUser._id}_${Date.now()}`;
                const uploadResult = await uploadBufferToCloudinary(receiptPdfBuffer, {
                  public_id: filename,
                  folder: "kpinterns/receipts",
                  resource_type: "auto",
                });
                receiptCloudinaryUrl = uploadResult?.secure_url || "";

                if (receiptCloudinaryUrl) {
                  if (resolvedType === "internship" && newUser.ActiveInternship?.length > 0) {
                    const subId = newUser.ActiveInternship[newUser.ActiveInternship.length - 1]._id;
                    await User.updateOne(
                      { _id: newUser._id, "ActiveInternship._id": subId },
                      { $set: { "ActiveInternship.$.paymentreceipt": receiptCloudinaryUrl } }
                    );
                  } else if (resolvedType === "course" && newUser.ActiveCources?.length > 0) {
                    const subId = newUser.ActiveCources[newUser.ActiveCources.length - 1]._id;
                    await User.updateOne(
                      { _id: newUser._id, "ActiveCources._id": subId },
                      { $set: { "ActiveCources.$.paymentreceipt": receiptCloudinaryUrl } }
                    );
                  }
                }
              }
            } catch (fallbackErr) {
              console.error("❌ Fallback receipt upload failed:", fallbackErr);
            }
          }

          // Step 3: Send confirmation email (only attach receipt PDF if paid > 0)
          try {
            await sendAllotmentAndPaymentSlipEmail(normalizedEmail, data.fullName, {
              purchaseType: resolvedType,
              title: resolvedTitle,
              amount: actualPaidAmount,
              originalAmount: origAmount,
              couponCode: appliedCouponCode,
              discountAmount: appliedDiscount,
              paymentId: paymentDetails?.razorpay_payment_id || "N/A",
              orderId: paymentDetails?.razorpay_order_id || "N/A",
              date: new Date(),
              isNewRegistration: true,
              receiptPdfBuffer: actualPaidAmount > 0 ? receiptPdfBuffer : null,
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

    // Authenticate Admin, Employee, or User
    const auth = verifyAuth(request, ["Admin", "Employee", "User"]);
    if (!auth.authenticated) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const url = new URL(request.url);
    const userId = url.searchParams.get("id");

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    // Regular users can only update their own profile and cannot modify enrollment status
    if (auth.user.role === "User") {
      if (userId !== auth.user._id) {
        return Response.json({ error: "Access denied: cannot edit another user's profile." }, { status: 403 });
      }
    }

    const data = await request.json();
    const User = createModel("User", UserModel);

    // Prevent regular users from self-enrolling or tampering with credentials/identity
    if (auth.user.role === "User") {
      delete data.ActiveInternship;
      delete data.ActiveCources;
      delete data.verified;
      delete data.password;
      delete data.email; // email is used for auth/JWT/login
      delete data.registrationNumber; // unique student registration identifier
      delete data.resetOtp;
      delete data.resetOtpExpiry;
      delete data.resetOtpAttempts;
    }

    // Hash password if updated by admin
    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
    }

    // Capitalize gender to match schema enum ["Male", "Female", "Other"]
    if (data.gender) {
      data.gender = data.gender.charAt(0).toUpperCase() + data.gender.slice(1).toLowerCase();
    }

    // Clean, validate, and check uniqueness if phone number is being updated
    if (data.phone) {
      const cleanedPhone = String(data.phone).replace(/\D/g, "");
      let normalizedPhone = cleanedPhone;
      if (cleanedPhone.length === 12 && cleanedPhone.startsWith("91")) {
        normalizedPhone = cleanedPhone.substring(2);
      } else if (cleanedPhone.length === 11 && cleanedPhone.startsWith("0")) {
        normalizedPhone = cleanedPhone.substring(1);
      }

      if (!/^[6-9]\d{9}$/.test(normalizedPhone)) {
        return Response.json(
          { error: "Please enter a valid 10-digit Indian mobile number." },
          { status: 400 }
        );
      }
      data.phone = normalizedPhone;

      const existingPhone = await User.findOne({ phone: normalizedPhone, _id: { $ne: userId } });
      if (existingPhone) {
        return Response.json(
          { error: "This phone number is already registered to another account." },
          { status: 400 }
        );
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(userId, data, {
      new: true,
      runValidators: true,
    })
    .populate("ActiveCources.course")
    .populate("ActiveInternship.internship")
    .populate("ActiveInternship.attendance");

    if (!updatedUser) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Defer slow progress sync & document automation checks to background
    after(async () => {
      try {
        const uDoc = await User.findById(userId);
        if (uDoc) {
          await syncUserProgressAndStatus(uDoc);
          await checkAndAutomateDocuments(userId);
        }
      } catch (bgError) {
        console.error("❌ Error running background sync/automation on user update:", bgError);
      }
    });

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
