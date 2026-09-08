import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { CourseModel, InternshipModel, AdminModel, UserModel, CouponModel } from "@/models";
import Razorpay from "razorpay";
import { getAuthUser } from "@/lib/jwt";

export async function POST(request) {
  try {
    await connectDB();

    const { type, itemId, university, college, couponCode, purpose } = await request.json();

    if (!type || !itemId) {
      return Response.json({ error: "Type and Item ID are required" }, { status: 400 });
    }

    let price = 0;
    let title = "";

    if (type === "course") {
      const Course = createModel("Course", CourseModel);
      const course = await Course.findById(itemId);
      if (!course) {
        return Response.json({ error: "Course not found" }, { status: 404 });
      }
      price = course.price || 0;
      title = course.title;
    } else if (type === "internship") {
      const Internship = createModel("Internship", InternshipModel);
      const internship = await Internship.findById(itemId);
      if (!internship) {
        return Response.json({ error: "Internship not found" }, { status: 404 });
      }
      price = internship.RegistrationFee?.amount || 500;
      title = internship.title;
    } else {
      return Response.json({ error: "Invalid purchase type" }, { status: 400 });
    }

    // Resolve college name if not directly supplied (e.g. from user profile)
    let lookupCollege = college;
    if (!lookupCollege) {
      const decoded = getAuthUser(request);
      if (decoded && decoded._id) {
        const User = createModel("User", UserModel);
        const user = await User.findById(decoded._id);
        if (user) {
          lookupCollege = user.college;
        }
      }
    }

    // Apply custom rates if the college has a verified College Admin setup with rates > 0
    // Bypass if purpose is completion_fee, where original internship fee is required before generating documents
    if (lookupCollege && purpose !== "completion_fee") {
      const Admin = createModel("Admin", AdminModel);
      const escapedCollege = lookupCollege.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      const collegeAdmin = await Admin.findOne({
        role: "College Admin",
        verified: true,
        CollegeName: { $regex: new RegExp("^" + escapedCollege + "$", "i") }
      });

      if (collegeAdmin) {
        if (type === "course" && typeof collegeAdmin.courseRate === "number" && collegeAdmin.courseRate >= 0) {
          price = collegeAdmin.courseRate;
        } else if (type === "internship" && typeof collegeAdmin.internshipRate === "number" && collegeAdmin.internshipRate >= 0) {
          price = collegeAdmin.internshipRate;
        }
      }
    }

    // Record original price before any coupon discounts
    const originalAmount = price;
    let appliedCouponCode = null;
    let discountAmount = 0;

    // Apply Coupon Code discount if provided
    if (couponCode && typeof couponCode === "string" && couponCode.trim()) {
      const sanitizedCode = couponCode.trim().toUpperCase();
      const Coupon = createModel("Coupon", CouponModel);
      const coupon = await Coupon.findOne({
        code: { $regex: new RegExp(`^${sanitizedCode}$`, "i") },
      });

      const now = new Date();
      if (!coupon || !coupon.isActive || new Date(coupon.expiryDate) <= now) {
        return Response.json(
          { error: "coupon code is expired try another coupen code" },
          { status: 400 }
        );
      }

      if (coupon.category !== "all" && coupon.category !== type) {
        return Response.json(
          { error: `This coupon code is only valid for ${coupon.category}s.` },
          { status: 400 }
        );
      }

      if (coupon.discountType === "percentage") {
        discountAmount = Math.round(((originalAmount * coupon.discountValue) / 100) * 100) / 100;
      } else if (coupon.discountType === "fixed") {
        discountAmount = coupon.discountValue;
      }

      // Ensure discount doesn't exceed original fee
      discountAmount = Math.min(originalAmount, discountAmount);
      price = Math.max(0, originalAmount - discountAmount);
      appliedCouponCode = sanitizedCode;

      // Increment coupon used count
      coupon.usedCount = (coupon.usedCount || 0) + 1;
      await coupon.save();
    }


    // If item is free, return early indicating no Razorpay order is needed
    if (price === 0) {
      return Response.json({
        success: true,
        orderId: null,
        amount: 0,
        originalAmount,
        couponCode: appliedCouponCode,
        discountAmount,
        currency: "INR",
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        title,
      }, { status: 200 });
    }

    // Initialize Razorpay
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error("Razorpay keys are missing from environment configuration");
      return Response.json({ error: "Razorpay credentials are not configured on server" }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const options = {
      amount: Math.round(price * 100), // amount in paisa (subunits)
      currency: "INR",
      receipt: `rcpt_${type === "internship" ? "int" : "crs"}_${itemId.slice(-6)}_${Date.now()}`,
      notes: {
        type,
        itemId,
        originalAmount: String(originalAmount),
        couponCode: appliedCouponCode || "",
        discountAmount: String(discountAmount),
        finalAmount: String(price),
        purpose: purpose || "enrollment",
      },
    };

    const order = await razorpay.orders.create(options);

    return Response.json({
      success: true,
      orderId: order.id,
      amount: price,
      originalAmount,
      couponCode: appliedCouponCode,
      discountAmount,
      currency: "INR",
      key: keyId,
      title,
    }, { status: 200 });

  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return Response.json(
      { error: "Failed to create payment order", details: error.message },
      { status: 500 }
    );
  }
}
