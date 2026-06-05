/**
 * User Model
 * Represents a student/user account with academic and personal information
 */

const mongoose = require("mongoose");

const UserModel = {
  // Personal Information
  fullName: {
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
  phone: {
    type: String,
    required: true,
    unique: true,
    match: /^\d{10}$/,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: true,
  },
  parentName: {
    type: String,
    required: true,
    trim: true,
  },

  // Academic Information
  university: {
    type: String,
    required: true,
  },
  college: {
    type: String,
    required: true,
  },
  degree: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  semester: {
    type: String,
    required: true,
  },
  session: {
    type: String,
    required: true,
  },
  registrationNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },

  // Internship Information
  ActiveInternship: [
    {
      internship: { type: mongoose.Schema.Types.ObjectId, ref: "Internship" },
      internshipStatus: { type: String, enum: ["Active", "Completed"], default: "Active" },
      progress: { type: Number, default: 0 },
      paymentStatus: { type: Boolean, default: false },
      paymentDate: { type: Date, default: Date.now },
      amount: { type: Number },
      offerLetterUrl: { type: String },
      certificationUrl: { type: String },
    },
  ],

  ActiveCources: [
    {
      course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
      courseStatus: { type: String, enum: ["Active", "Completed"], default: "Active" },
      progress: { type: Number, default: 0 },
      paymentStatus: { type: Boolean, default: false },
      paymentDate: { type: Date, default: Date.now },
      amount: { type: Number },
      certificateUrl: { type: String },
    },
  ],

  // Emergency Contact
  emergencyName: {
    type: String,
    required: true,
    trim: true,
  },
  emergencyNumber: {
    type: String,
    required: true,
    match: /^\d{10}$/,
  },
  relationship: {
    type: String,
    required: true,
  },

  // Security
  password: {
    type: String,
    required: true,
    minlength: 6,
  },

  // Metadata
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
};

module.exports = UserModel;
