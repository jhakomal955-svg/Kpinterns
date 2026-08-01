import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { CouponModel, AdminModel } from "@/models";
import { verifyAuth } from "@/lib/jwt";

// GET: Fetch all coupons (Admin and Employee)
export async function GET(request) {
  try {
    await connectDB();

    const auth = verifyAuth(request, ["Admin", "Employee"]);
    if (!auth.authenticated) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const Coupon = createModel("Coupon", CouponModel);
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });

    return Response.json({ success: true, coupons }, { status: 200 });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return Response.json(
      { error: "Failed to fetch coupons", details: error.message },
      { status: 500 }
    );
  }
}

// POST: Create a new coupon (Admin and Employee)
export async function POST(request) {
  try {
    await connectDB();

    const auth = verifyAuth(request, ["Admin", "Employee"]);
    if (!auth.authenticated) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const { code, discountType, discountValue, category, expiryDate } =
      await request.json();

    if (!code || !code.trim()) {
      return Response.json(
        { error: "Coupon code is required" },
        { status: 400 }
      );
    }

    if (discountValue === undefined || Number(discountValue) < 0) {
      return Response.json(
        { error: "Valid discount value is required" },
        { status: 400 }
      );
    }

    if (discountType === "percentage" && Number(discountValue) > 100) {
      return Response.json(
        { error: "Percentage discount cannot exceed 100%" },
        { status: 400 }
      );
    }

    if (!expiryDate) {
      return Response.json(
        { error: "Expiry date is required" },
        { status: 400 }
      );
    }

    const expiryTime = new Date(expiryDate).getTime();
    if (isNaN(expiryTime) || expiryTime <= Date.now()) {
      return Response.json(
        { error: "Expiry date must be in the future" },
        { status: 400 }
      );
    }

    const sanitizedCode = code.trim().toUpperCase();

    const Coupon = createModel("Coupon", CouponModel);

    // Check if code already exists
    const existing = await Coupon.findOne({
      code: { $regex: new RegExp(`^${sanitizedCode}$`, "i") },
    });

    if (existing) {
      return Response.json(
        { error: `Coupon code "${sanitizedCode}" already exists` },
        { status: 400 }
      );
    }

    // Get creator details
    let createdByName = auth.user.email || "";
    const Admin = createModel("Admin", AdminModel);
    const creator = await Admin.findById(auth.user._id);
    if (creator) {
      createdByName = creator.name || creator.email;
    }

    const newCoupon = await Coupon.create({
      code: sanitizedCode,
      discountType: discountType || "percentage",
      discountValue: Number(discountValue),
      category: category || "all",
      expiryDate: new Date(expiryDate),
      isActive: true,
      createdBy: auth.user._id,
      createdByName,
      createdByRole: auth.user.role || "Admin",
    });

    return Response.json(
      {
        success: true,
        message: "Coupon created successfully",
        coupon: newCoupon,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating coupon:", error);
    return Response.json(
      { error: "Failed to create coupon", details: error.message },
      { status: 500 }
    );
  }
}
