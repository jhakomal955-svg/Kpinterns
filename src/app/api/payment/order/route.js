import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { CourseModel, InternshipModel, AdminModel, UserModel } from "@/models";
import Razorpay from "razorpay";
import { getAuthUser } from "@/lib/jwt";

export async function POST(request) {
  try {
    await connectDB();

    const { type, itemId, university, college } = await request.json();

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
    if (lookupCollege) {
      const Admin = createModel("Admin", AdminModel);
      const escapedCollege = lookupCollege.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
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

    // If item is free, return early indicating no Razorpay order is needed
    if (price === 0) {
      return Response.json({
        success: true,
        orderId: null,
        amount: 0,
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
    };

    const order = await razorpay.orders.create(options);

    return Response.json({
      success: true,
      orderId: order.id,
      amount: price,
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
