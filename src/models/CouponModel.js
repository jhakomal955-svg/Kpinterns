import mongoose from "mongoose";

const CouponModel = {
  code: {
    type: String,
    required: [true, "Coupon code is required"],
    uppercase: true,
    trim: true,
    unique: true,
  },
  discountType: {
    type: String,
    enum: ["percentage", "fixed"],
    default: "percentage",
  },
  discountValue: {
    type: Number,
    required: [true, "Discount value is required"],
    min: [0, "Discount value cannot be negative"],
  },
  category: {
    type: String,
    enum: ["all", "course", "internship"],
    default: "all",
  },
  expiryDate: {
    type: Date,
    required: [true, "Expiry date is required"],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
  },
  createdByName: {
    type: String,
    default: "",
  },
  createdByRole: {
    type: String,
    default: "Admin",
  },
  usedCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
};

export default CouponModel;
