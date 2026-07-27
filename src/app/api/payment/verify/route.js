import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { UserModel, CourseModel, InternshipModel, AttendanceModel, AdminModel } from "@/models";
import crypto from "crypto";
import { after } from "next/server";
import { sendAllotmentAndPaymentSlipEmail } from "@/lib/nodemailer";
import { checkAndAutomateDocuments } from "@/lib/documentAutomation";
import { generatePaymentReceipt } from "@/lib/pdfGenerator";
import { uploadBufferToCloudinary } from "@/lib/cloudinary";
import { verifyAuth } from "@/lib/jwt";

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

export async function POST(request) {
  try {
    await connectDB();

    // Authenticate user
    const auth = verifyAuth(request, ["User", "Admin"]);
    if (!auth.authenticated) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      userId,
      type,
      itemId,
    } = await request.json();

    if (!userId || !type || !itemId) {
      return Response.json({ error: "Missing required enrollment fields" }, { status: 400 });
    }

    // A User role can only verify payments and enroll for their own userId
    if (auth.user.role === "User" && auth.user._id !== userId) {
      return Response.json({ error: "Access denied: unauthorized operation." }, { status: 403 });
    }

    let price = 0;
    let title = "";
    let course = null;
    let internship = null;

    // Resolve models
    const User = createModel("User", UserModel);
    const user = await User.findById(userId);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    if (type === "course") {
      const Course = createModel("Course", CourseModel);
      course = await Course.findById(itemId);
      if (!course) {
        return Response.json({ error: "Course not found" }, { status: 404 });
      }
      price = course.price || 0;
      title = course.title;
    } else if (type === "internship") {
      const Internship = createModel("Internship", InternshipModel);
      internship = await Internship.findById(itemId);
      if (!internship) {
        return Response.json({ error: "Internship not found" }, { status: 404 });
      }
      price = internship.RegistrationFee?.amount || 500;
      title = internship.title || internship.position || "Internship Program";
    } else {
      return Response.json({ error: "Invalid enrollment type" }, { status: 400 });
    }

    // Apply custom rates if the user belongs to a verified College Admin college with rates > 0
    if (user.college) {
      const Admin = createModel("Admin", AdminModel);
      const escapedCollege = user.college.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      const collegeAdmin = await Admin.findOne({
        role: "College Admin",
        verified: true,
        CollegeName: { $regex: new RegExp("^" + escapedCollege + "$", "i") }
      });

      if (collegeAdmin) {
        if (type === "course" && collegeAdmin.courseRate > 0) {
          price = collegeAdmin.courseRate;
        } else if (type === "internship" && collegeAdmin.internshipRate > 0) {
          price = collegeAdmin.internshipRate;
        }
      }
    }

    // Verify payment signature if price > 0
    if (price > 0) {
      if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        return Response.json({ error: "Payment details are required for paid courses/internships" }, { status: 400 });
      }

      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      if (!keySecret) {
        return Response.json({ error: "Razorpay server secret not configured" }, { status: 500 });
      }

      const generatedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (generatedSignature !== razorpay_signature) {
        return Response.json({ error: "Invalid payment signature verification failed" }, { status: 400 });
      }
    }

    // Enroll user in the course or internship
    if (type === "course") {
      // Check if already enrolled
      const isAlreadyEnrolled = (user.ActiveCources || []).some(
        (c) => (c.course?._id || c.course).toString() === itemId
      );

      if (!isAlreadyEnrolled) {
        const startDate = new Date();
        const accessDuration = course.accessDuration || "lifetime";
        const endDate = calculateCourseEndDate(startDate, accessDuration);

        user.ActiveCources = user.ActiveCources || [];
        user.ActiveCources.push({
          course: itemId,
          courseStatus: "Active",
          progress: 0,
          paymentStatus: true,
          paymentDate: startDate,
          paymentId: razorpay_payment_id || null,
          amount: price,
          startDate: startDate,
          endDate: endDate,
        });
      }
    } else if (type === "internship") {
      // Check if already enrolled
      const isAlreadyEnrolled = (user.ActiveInternship || []).some(
        (i) => (i.internship?._id || i.internship).toString() === itemId
      );

      if (!isAlreadyEnrolled) {
        let startDate = new Date();
        if (user.college) {
          const Admin = createModel("Admin", AdminModel);
          const escapedCollege = user.college.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
          const collegeAdmin = await Admin.findOne({
            role: "College Admin",
            verified: true,
            CollegeName: { $exists: true, $ne: "", $regex: new RegExp("^" + escapedCollege + "$", "i") }
          });
          if (collegeAdmin && collegeAdmin.internshipStartDate) {
            startDate = new Date(collegeAdmin.internshipStartDate);
          }
        }
        const duration = internship.duration || "2 Weeks";
        const endDate = calculateEndDate(startDate, duration);

        const Attendance = createModel("Attendance", AttendanceModel);
        const newAtt = new Attendance({
          user: userId,
          internship: itemId,
          records: [],
        });
        await newAtt.save();

        user.ActiveInternship = user.ActiveInternship || [];
        user.ActiveInternship.push({
          internship: itemId,
          internshipStatus: "Active",
          progress: 0,
          paymentStatus: true,
          paymentDate: startDate,
          paymentId: razorpay_payment_id || null,
          amount: price,
          startDate: startDate,
          endDate: endDate,
          attendance: newAtt._id,
        });
      }
    }

    user.updatedAt = new Date();
    await user.save();

    // Defer slow operations to run in the background after response is sent
    after(async () => {
      try {
        let receiptPdfBuffer = null;

        // Step 1: Generate PDF receipt
        try {
          receiptPdfBuffer = await generatePaymentReceipt(user.toObject(), {
            purchaseType: type,
            title,
            amount: price,
            paymentId: razorpay_payment_id || "N/A",
            orderId: razorpay_order_id || "N/A",
            date: new Date(),
          });
        } catch (pdfErr) {
          console.error("❌ Failed to generate payment receipt PDF:", pdfErr);
        }

        // Step 2: Upload to Cloudinary and save URL directly on user document
        if (receiptPdfBuffer) {
          try {
            const filename = `payment_receipt_${userId}_${Date.now()}`;
            const uploadResult = await uploadBufferToCloudinary(receiptPdfBuffer, {
              public_id: filename,
              folder: "kpinterns/receipts",
              resource_type: "auto",
            });
            const receiptCloudinaryUrl = uploadResult.secure_url;

            // Save URL directly on the user record in database to avoid concurrent state overwriting
            if (type === "internship" && user.ActiveInternship?.length > 0) {
              await User.updateOne(
                { _id: userId, "ActiveInternship.internship": itemId },
                { $set: { "ActiveInternship.$.paymentreceipt": receiptCloudinaryUrl } }
              );
            } else if (type === "course" && user.ActiveCources?.length > 0) {
              await User.updateOne(
                { _id: userId, "ActiveCources.course": itemId },
                { $set: { "ActiveCources.$.paymentreceipt": receiptCloudinaryUrl } }
              );
            }
          } catch (uploadErr) {
            console.error("❌ Failed to upload receipt PDF to Cloudinary:", uploadErr);
          }
        }

        // Step 3: Send confirmation email with PDF attached
        try {
          await sendAllotmentAndPaymentSlipEmail(user.email, user.fullName, {
            purchaseType: type,
            title: title,
            amount: price,
            paymentId: razorpay_payment_id || "N/A",
            orderId: razorpay_order_id || "N/A",
            date: new Date(),
            isNewRegistration: false,
            receiptPdfBuffer,
          });
        } catch (mailError) {
          console.error("❌ Failed to send course purchase receipt email:", mailError);
        }

        // Run automated document generation (e.g. generate and email offer letter for new internship enrollment)
        try {
          await checkAndAutomateDocuments(userId);
        } catch (docError) {
          console.error("❌ Failed to run automated document checks on payment verify:", docError);
        }
      } catch (bgError) {
        console.error("❌ Error running background checkout tasks:", bgError);
      }
    });

    // Populate user references so the client has full details
    createModel("Course", CourseModel);
    createModel("Internship", InternshipModel);
    createModel("Attendance", AttendanceModel);
    const populatedUser = await User.findById(userId)
      .populate("ActiveCources.course")
      .populate("ActiveInternship.internship")
      .populate("ActiveInternship.attendance");

    const userObj = populatedUser.toObject();
    delete userObj.password;

    return Response.json({
      success: true,
      message: "Successfully enrolled",
      data: userObj,
    }, { status: 200 });

  } catch (error) {
    console.error("Error verifying payment and enrolling:", error);
    return Response.json(
      { error: "Verification and enrollment failed", details: error.message },
      { status: 500 }
    );
  }
}
