import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { CouponModel } from "@/models";

// POST: Validate coupon code for user during purchase
export async function POST(request) {
  try {
    await connectDB();

    const { code, type, originalPrice } = await request.json();

    if (!code || !code.trim()) {
      return Response.json(
        {
          valid: false,
          message: "coupon code is expired try another coupen code",
        },
        { status: 400 }
      );
    }

    const sanitizedCode = code.trim().toUpperCase();
    const Coupon = createModel("Coupon", CouponModel);

    // Find coupon by exact uppercase code
    const coupon = await Coupon.findOne({
      code: { $regex: new RegExp(`^${sanitizedCode}$`, "i") },
    });

    // If coupon doesn't exist or is deactivated
    if (!coupon || !coupon.isActive) {
      return Response.json(
        {
          valid: false,
          message: "coupon code is expired try another coupen code",
        },
        { status: 200 }
      );
    }

    // Check expiry date
    const now = new Date();
    const expiry = new Date(coupon.expiryDate);
    if (expiry <= now) {
      return Response.json(
        {
          valid: false,
          message: "coupon code is expired try another coupen code",
        },
        { status: 200 }
      );
    }

    // Check category match
    if (coupon.category !== "all" && type && coupon.category !== type) {
      return Response.json(
        {
          valid: false,
          message: `This coupon code is only valid for ${coupon.category}s.`,
        },
        { status: 200 }
      );
    }

    // Calculate discount amount
    const price = Number(originalPrice) || 0;
    let discountAmount = 0;

    if (coupon.discountType === "percentage") {
      discountAmount = (price * coupon.discountValue) / 100;
    } else if (coupon.discountType === "fixed") {
      discountAmount = coupon.discountValue;
    }

    // Ensure discount does not exceed original price
    discountAmount = Math.min(discountAmount, price);
    const finalPrice = Math.max(0, price - discountAmount);

    return Response.json(
      {
        success: true,
        valid: true,
        coupon: {
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          category: coupon.category,
          expiryDate: coupon.expiryDate,
        },
        discountAmount: Math.round(discountAmount * 100) / 100,
        finalPrice: Math.round(finalPrice * 100) / 100,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error validating coupon:", error);
    return Response.json(
      {
        valid: false,
        message: "coupon code is expired try another coupen code",
      },
      { status: 500 }
    );
  }
}
