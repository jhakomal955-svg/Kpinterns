import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { CouponModel } from "@/models";
import { verifyAuth } from "@/lib/jwt";

// DELETE: Delete coupon by ID (Admin and Employee)
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const auth = verifyAuth(request, ["Admin", "Employee"]);
    if (!auth.authenticated) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    if (!id) {
      return Response.json({ error: "Coupon ID is required" }, { status: 400 });
    }

    const Coupon = createModel("Coupon", CouponModel);
    const deletedCoupon = await Coupon.findByIdAndDelete(id);

    if (!deletedCoupon) {
      return Response.json({ error: "Coupon not found" }, { status: 404 });
    }

    return Response.json(
      { success: true, message: "Coupon deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return Response.json(
      { error: "Failed to delete coupon", details: error.message },
      { status: 500 }
    );
  }
}
