import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { UserModel, PartnerStudentModel, InternshipModel, AdminModel, CouponModel, VerificationOtpModel } from "@/models";
import { signToken } from "@/lib/jwt";
import Razorpay from "razorpay";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      partnerStudentId,
      fullName,
      email,
      phone,
      gender,
      parentName,
      university,
      college,
      degree,
      department,
      rollNumber,
      semester,
      session,
      registrationNumber,
      internshipId,
      password,
      couponCode,
    } = body;

    if (
      !fullName?.trim() ||
      !email?.trim() ||
      !phone?.trim() ||
      !gender?.trim() ||
      !parentName?.trim() ||
      !university?.trim() ||
      !college?.trim() ||
      !degree?.trim() ||
      !department?.trim() ||
      !rollNumber?.trim() ||
      !registrationNumber?.trim() ||
      !semester?.trim() ||
      !session?.trim() ||
      !internshipId ||
      !password?.trim()
    ) {
      return Response.json(
        {
          success: false,
          error: "All user fields (Full Name, Email, Phone, Password, Gender, Parent Name, University, College, Degree, Department, Roll Number, Registration Number, Semester, and Academic Session) are required to complete final registration.",
        },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (typeof email !== "string" || !emailRegex.test(email.trim())) {
      return Response.json(
        { success: false, error: "Invalid email format. Please enter a valid email address (e.g. user@gmail.com)." },
        { status: 400 }
      );
    }

    // Indian Mobile Number validation (10 digits starting with 6, 7, 8, or 9)
    const cleanedPhone = String(phone || "").replace(/\D/g, "");
    let normalizedPhone = cleanedPhone;
    if (cleanedPhone.length === 12 && cleanedPhone.startsWith("91")) {
      normalizedPhone = cleanedPhone.substring(2);
    } else if (cleanedPhone.length === 11 && cleanedPhone.startsWith("0")) {
      normalizedPhone = cleanedPhone.substring(1);
    }

    if (!/^[6-9]\d{9}$/.test(normalizedPhone)) {
      return Response.json(
        { success: false, error: "Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9." },
        { status: 400 }
      );
    }

    // Verify Email OTP verification status
    const cleanEmailForOtp = email.trim().toLowerCase();
    const VerificationOtp = createModel("VerificationOtp", VerificationOtpModel);
    const verifiedOtpRecord = await VerificationOtp.findOne({
      email: cleanEmailForOtp,
      verified: true,
      verifiedAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) },
    });

    if (!verifiedOtpRecord) {
      return Response.json(
        { success: false, error: "Email address not verified. Please verify your email with the 6-digit OTP code before proceeding." },
        { status: 400 }
      );
    }

    const User = createModel("User", UserModel);
    const Internship = createModel("Internship", InternshipModel);
    const PartnerStudent = createModel("PartnerStudent", PartnerStudentModel);
    const Admin = createModel("Admin", AdminModel);

    // Verify Internship exists
    const internshipDoc = await Internship.findById(internshipId);
    if (!internshipDoc) {
      return Response.json(
        { success: false, error: "Selected internship program not found." },
        { status: 404 }
      );
    }

    // Determine price (Check if Partner College has custom rate in AdminModel)
    let price = internshipDoc.RegistrationFee?.amount || 500;

    const escapedCollege = college.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const collegeAdmin = await Admin.findOne({
      role: "College Admin",
      verified: true,
      CollegeName: { $regex: new RegExp("^" + escapedCollege + "$", "i") },
    });

    if (collegeAdmin && collegeAdmin.internshipRate > 0) {
      price = collegeAdmin.internshipRate;
    }

    // Apply Coupon Code discount if provided
    if (couponCode && typeof couponCode === "string" && couponCode.trim()) {
      const Coupon = createModel("Coupon", CouponModel);
      const coupon = await Coupon.findOne({
        code: { $regex: new RegExp(`^${couponCode.trim()}$`, "i") },
      });

      const now = new Date();
      if (coupon && coupon.isActive && new Date(coupon.expiryDate) > now) {
        let discountAmount = 0;
        if (coupon.discountType === "percentage") {
          discountAmount = (price * coupon.discountValue) / 100;
        } else if (coupon.discountType === "fixed") {
          discountAmount = coupon.discountValue;
        }
        price = Math.max(0, price - discountAmount);
      }
    }

    // Find existing user by registrationNumber, email, or phone
    const cleanRegNo = registrationNumber.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    let userDoc = await User.findOne({
      $or: [
        { registrationNumber: cleanRegNo },
        { email: cleanEmail },
        { phone: cleanPhone },
      ],
    });

    const userPassword = password && password.trim().length >= 6 ? password.trim() : "KpStudent@2026";

    // Handle Free enrollment (price === 0)
    if (price === 0) {
      if (!userDoc) {
        const hashedPassword = await bcrypt.hash(userPassword, 10);
        userDoc = new User({
          fullName: fullName.trim(),
          email: cleanEmail,
          phone: cleanPhone,
          gender: gender || "Other",
          parentName: parentName || "N/A",
          university: university || "Partner University",
          college: college.trim(),
          degree: degree || "B.Tech",
          department: department || "Computer Science",
          rollNumber: rollNumber.trim(),
          semester: semester || "6th",
          session: session || "2023-2027",
          registrationNumber: cleanRegNo,
          password: hashedPassword,
          verified: true,
        });
        await userDoc.save();
      }

      const token = signToken({
        _id: userDoc._id.toString(),
        email: userDoc.email,
        role: "student",
        name: userDoc.fullName,
      });

      // Update PartnerStudent record to mark enrolledUserId
      if (partnerStudentId) {
        await PartnerStudent.findByIdAndUpdate(partnerStudentId, {
          enrolledUserId: userDoc._id,
          enrolledInternshipId: internshipDoc._id,
        });
      } else {
        await PartnerStudent.findOneAndUpdate(
          {
            collegeName: { $regex: new RegExp("^" + escapedCollege + "$", "i") },
            $or: [{ registrationNumber: cleanRegNo }, { rollNumber: rollNumber.trim() }],
          },
          {
            enrolledUserId: userDoc._id,
            enrolledInternshipId: internshipDoc._id,
          }
        );
      }

      // Add to ActiveInternship if not already enrolled
      const isAlreadyEnrolled = (userDoc.ActiveInternship || []).some(
        (i) => (i.internship?._id || i.internship).toString() === internshipDoc._id.toString()
      );
      if (!isAlreadyEnrolled) {
        userDoc.ActiveInternship = userDoc.ActiveInternship || [];
        userDoc.ActiveInternship.push({
          internship: internshipDoc._id,
          internshipStatus: "Active",
          progress: 0,
          paymentStatus: true,
          paymentDate: new Date(),
          amount: 0,
        });
        await userDoc.save();
      }

      return Response.json(
        {
          success: true,
          user: userDoc,
          token,
          orderId: null,
          amount: 0,
          currency: "INR",
          message: "Free enrollment completed successfully.",
        },
        { status: 200 }
      );
    }

    // Razorpay Order Creation for Paid enrollment (price > 0)
    // STRICT MODE: Defer User creation in database until payment is verified via /api/payment/verify!
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return Response.json(
        { success: false, error: "Payment gateway credentials are not configured on the server." },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const options = {
      amount: Math.round(price * 100),
      currency: "INR",
      receipt: `rcpt_partner_${cleanRegNo}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    const studentPayload = {
      partnerStudentId,
      fullName: fullName.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      password: userPassword,
      gender: gender || "Other",
      parentName: parentName || "N/A",
      university: university || "Partner University",
      college: college.trim(),
      degree: degree || "B.Tech",
      department: department || "Computer Science",
      rollNumber: rollNumber.trim(),
      semester: semester || "6th",
      session: session || "2023-2027",
      registrationNumber: cleanRegNo,
    };

    return Response.json(
      {
        success: true,
        user: userDoc ? { _id: userDoc._id.toString(), email: userDoc.email } : null,
        studentPayload,
        orderId: order.id,
        amount: price,
        currency: "INR",
        key: keyId,
        title: internshipDoc.title,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in partner student fast-track registration:", error);
    return Response.json(
      { success: false, error: "Failed to fast-track student registration", details: error.message },
      { status: 500 }
    );
  }
}
