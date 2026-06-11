import mongoose from "mongoose";

const AdminModel = {
  // Personal Information
  name: {
    type: String,
    required: true,
    minlength: 3,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
    match: /^\d{10}$/,
  },

  // Security
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  resetOtp: {
    type: String,
    default: null,
  },
  resetOtpExpiry: {
    type: Date,
    default: null,
  },

  // Terms & Conditions
  agreeTerms: {
    type: Boolean,
    required: true,
    default: false,
  },
  role: {
    type: String,
    enum: ["Admin", "Instructor"],
    default: "Admin",
  },
  bio: {
    type: String,
    default: "",
  },
  coursesOffered: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
  internshipsOffered: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Internship",
    },
  ],
  // Verification Status
  verified: {
    type: Boolean,
    default: false,
    description: "Admin account verification status",
  },
};

export default AdminModel;
