/**
 * Lead Model
 * Represents partial/abandoned registration leads for admin and employee follow-ups
 */

import mongoose from "mongoose";

const LeadModel = {
  // Personal Information
  fullName: {
    type: String,
    trim: true,
    default: "",
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

  // Academic Information
  university: {
    type: String,
    default: "",
  },
  college: {
    type: String,
    default: "",
  },
  degree: {
    type: String,
    default: "",
  },
  department: {
    type: String,
    default: "",
  },
  rollNumber: {
    type: String,
    default: "",
  },
  semester: {
    type: String,
    default: "",
  },
  session: {
    type: String,
    default: "",
  },
  registrationNumber: {
    type: String,
    default: "",
  },

  // Purchase/Internship Preference
  purchaseType: {
    type: String,
    enum: ["internship", "course", ""],
    default: "internship",
  },
  internshipId: {
    type: String,
    default: "",
  },
  internshipDomain: {
    type: String,
    default: "",
  },
  mode: {
    type: String,
    default: "",
  },

  // Registration Progress Tracking
  lastStepCompleted: {
    type: Number,
    default: 1,
  },

  // Lead Lifecycle & Follow-up Management
  status: {
    type: String,
    enum: ["New", "Contacted", "Follow-up", "Converted", "Lost"],
    default: "New",
  },
  source: {
    type: String,
    default: "Registration Form",
  },
  assignedEmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    default: null,
  },
  assignedEmployeeName: {
    type: String,
    default: "",
  },

  notes: [
    {
      comment: { type: String, required: true },
      addedBy: { type: String, required: true },
      addedByRole: { type: String, default: "Employee" },
      createdAt: { type: Date, default: Date.now },
    },
  ],

  lastActivityAt: {
    type: Date,
    default: Date.now,
  },
};

export default LeadModel;
