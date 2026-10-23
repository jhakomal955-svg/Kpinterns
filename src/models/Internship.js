/**
 * Internship Model
 * Represents an internship opportunity with multimedia content and company details
 */
import mongoose from "mongoose";
import { DEGREE_LIST } from "../lib/data/degreeDepartments.js";

const ALL_DEGREES = Array.from(
  new Set([
    "Diploma",
    "B.Tech",
    "BTech",
    "BCA",
    "MCA",
    "BBA",
    "BA",
    "BSc",
    "BCom",
    "Education",
    "Law",
    ...(DEGREE_LIST || []),
  ])
);

const InternshipModel = {
  // Basic Information
  title: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 200,
    trim: true,
  },
  position: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    minlength: 20,
    maxlength: 2000,
    trim: true,
  },
  shortDescription: {
    type: String,
    maxlength: 500,
    trim: true,
  },
  thumbnail: {
    type: String,
    required: false,
    description: "Internship thumbnail/cover image URL",
  },

  // Admin/Creator Information
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },

  // Company Information
  company: {
    type: String,
    default: "Kpinterns",
    required: true,
  },

  // Internship Details
  degree: {
    type: [String],
    required: true,
    enum: ALL_DEGREES,
  },

  department: {
    type: [String],
    required: true,
  },

  domain: {
    type: String,
    required: true,
    trim: true,
  },

  internshipType: {
    type: String,
    enum: ["Full-Time", "Part-Time", "Summer", "Winter", "Project-Based"],
    required: true,
  },
  mode: {
    type: String,
    enum: ["Online", "Offline", "Hybrid"],
    default: "Hybrid",
  },

  // Duration & Timeline
  duration: {
    type: String,
    enum: ["2 Weeks", "4 Weeks", "6 Weeks", "8 Weeks", "12 Weeks", "16 Weeks", "24 Weeks"],
    default: "2 Weeks",
  },
 

  // Requirements
  requirements: [String],
  skills: [String],
  eligibility: {
    type: Object,
    default: {},
    required: false,
  },

  // Responsibilities
  responsibilities: [String],

  // Content & Resources
  instructor: [
    {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
      },
    },
  ],

  // Course Content
  content: [
    {
      title: {
        type: String,
        required: true,
      },
      textContent: {
        type: String,
      }, 
      VideoUrl: {
        type: String,
      },
      pdfurl: {
        type: String,
      },
      imageurl: {
        type: String,
      },
      externalink: {
        type: String,
      },
      assignmentTitle: {
        type: String,
      },
      assignmentDesc: {
        type: String,
      },
      assignmentFileUrl: {
        type: String,
      },
    },
  ],

  updates: [
    {
      title: {
        type: String,
        required: true,
      },
      externalLink: {
        type: String,
      },
    },
  ],
  RegistrationFee: {
    type: Object,
    default: {},
    required: false,
  },
  // Compensation & Benefits
  stipend: {
    type: Object,
    default: {},
    required: false,
  },
  benefits: [String],
  perks: [String],
  certificateOffered: {
    type: Boolean,
    default: true,
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviews: [
    {
      userId: String,
      userName: String,
      rating: Number,
      comment: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  // Test Section
  test: {
    status: {
      type: String,
      enum: ["Draft", "Published"],
      default: "Draft",
    },
    questions: [
      {
        questionText: { type: String, required: true },
        options: { type: [String], required: true },
        correctOptionIndex: { type: Number, required: true },
      }
    ]
  },
  intersnhipReport: {
    type: String,
    default: "",
  },
  // Status
  status: {
    type: String,
    enum: ["Draft", "Published", "Active", "Closed", "Archived"],
    default: "Draft",
  },
  isActive: {
    type: Boolean,
    default: true,
  },

  // Metadata
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  publishedAt: Date,
};

export default InternshipModel;