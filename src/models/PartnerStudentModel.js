/**
 * Partner Student Model
 * Represents pre-approved college student records uploaded by College Admins / Employees
 */

import mongoose from "mongoose";

const PartnerStudentModel = {
  collegeAdminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    default: null,
  },
  addedByRole: {
    type: String,
    enum: ["Admin", "College Admin", "Employee"],
    default: "College Admin",
  },
  collegeName: {
    type: String,
    required: true,
    trim: true,
  },
  university: {
    type: String,
    trim: true,
    default: "",
  },

  // Student Academic Credentials
  registrationNumber: {
    type: String,
    required: true,
    trim: true,
  },
  rollNumber: {
    type: String,
    required: true,
    trim: true,
  },

  // Student Profile
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    default: "",
  },
  phone: {
    type: String,
    trim: true,
    default: "",
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other", ""],
    default: "",
  },
  parentName: {
    type: String,
    trim: true,
    default: "",
  },

  // Academic Info
  degree: {
    type: String,
    trim: true,
    default: "B.Tech",
  },
  department: {
    type: String,
    trim: true,
    default: "Computer Science",
  },
  semester: {
    type: String,
    trim: true,
    default: "6th",
  },
  session: {
    type: String,
    trim: true,
    default: "2023-2027",
  },

  // Enrollment tracking
  isEnrolled: {
    type: Boolean,
    default: false,
  },
  enrolledUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  enrolledInternshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Internship",
    default: null,
  },
  enrolledAt: {
    type: Date,
    default: null,
  },
};

export default PartnerStudentModel;
