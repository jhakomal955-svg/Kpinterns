/**
 * User Model
 * Represents a student/user account with academic and personal information
 */

import mongoose from "mongoose";

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
 rollNumber: {
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
  consent_letter:{
   type:String,
   default:""
  },

  // Internship Information
  ActiveInternship: [
    {
      internship: { type: mongoose.Schema.Types.ObjectId, ref: "Internship" },
      internshipStatus: { type: String, enum: ["Active", "Completed"], default: "Active" },
      progress: { type: Number, default: 0 },
      paymentStatus: { type: Boolean, default: false },
      paymentDate: { type: Date, default: Date.now },
      paymentId: { type: String },
      amount: { type: Number },
      paymentreceipt: { type: String },
      attendance: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attendance",
      },
      startDate: { type: Date,default:Date.now },
      endDate: { type: Date },
      offerLetterUrl: { type: String },
      certificationUrl: { type: String },
      attendanceCertificateUrl: { type: String },
      attendanceRate: { type: String },
      assignments: [
        {
          moduleId: { type: String, required: true },
          submittedText: { type: String },
          fileUrl: { type: String },
          submittedAt: { type: Date, default: Date.now },
          marks: { type: Number, default: null },
          feedback: { type: String },
          status: { type: String, enum: ["Submitted", "Graded"], default: "Submitted" },
        }
      ],
      completedModules: { type: [String], default: [] },
      testScore: { type: Number, default: null },
      testTaken: { type: Boolean, default: false },
      testTakenAt: { type: Date, default: null },
      testStartedAt: { type: Date, default: null },
    },
  ],

  ActiveCources: [
    {
      course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
      courseStatus: { type: String, enum: ["Active", "Completed"], default: "Active" },
      progress: { type: Number, default: 0 },
      paymentStatus: { type: Boolean, default: false },
      paymentDate: { type: Date, default: Date.now },
      paymentId: { type: String },
      paymentreceipt: { type: String },
      amount: { type: Number },
      startDate: { type: Date,default:Date.now },
      endDate: { type: Date },
      certificateUrl: { type: String },
      completedModules: { type: [String], default: [] },
    },
  ],
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

  verified: {
    type: Boolean,
    default: false,
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

export default UserModel;
