/**
 * Internship Model
 * Represents an internship opportunity with multimedia content and company details
 */
const mongoose = require("mongoose");

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
    type: Object,
    default: {},
    required: false,
  },

  // Company Information
  company: {
    type: String,
    default: "Kpinterns",
    required: true,
  },

  // Internship Details
  department:{
    type: String,
    required: true,
    enum: ["Bsc", "BTech", "BBA", "BCom", "BA", "BCA", "BScIT", "BScCS", "Other"],
  },
  category: {
    type: String,
    required: true,
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
    enum: ["1-week", "2-weeks", "1-month", "3-months", "6-months", "1-year"],
    default: "1-month",
  },
  applicationDeadline: Date,

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
        required: true,
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

  // Applications & Tracking
  applications: [
    {
      userId: { type: String },
      userName: { type: String },
      userEmail: { type: String },
      applicationDate: {
        type: Date,
        default: Date.now,
      },
      status: {
        type: String,
        enum: ["Applied", "Shortlisted", "Interview", "Accepted", "Rejected"],
        default: "Applied",
      },
      resume: { type: String },
      coverLetter: { type: String },
      applicationText: { type: String },
    },
  ],
  totalApplications: {
    type: Number,
    default: 0,
  },
  selectedCandidates: [
    {
      userId: { type: String },
      userName: { type: String },
      selectedDate: { type: Date },
    },
  ],

  // Contact Information
  contactPerson: {
    name: String,
    email: String,
    phone: String,
    designation: String,
  },

  // Engagement & Metrics
  views: {
    type: Number,
    default: 0,
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

module.exports = InternshipModel;