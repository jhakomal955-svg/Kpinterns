/**
 * Course Model
 * Represents an online/offline course with multimedia content
 */

const CourseModel = {
  // Basic Information
  title: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 200,
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
    description: "Course thumbnail/cover image URL",
  },
  category: {
    type: String,
    required: true,
    enum: [
      "Web Development",
      "Mobile Development",
      "Data Science",
      "Machine Learning",
      "Cloud Computing",
      "DevOps",
      "UI/UX Design",
      "Digital Marketing",
      "Business",
      "Other",
    ],
  },
  difficultyLevel: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
    default: "Beginner",
  },

  // Instructor/Admin Information
  instructor: {
    type: Object,
    default: {},
    required: false,
  },

  // Course Content
  content: {
    type: Object,
    default: {},
    required: false,
  },

  // Course Duration
  duration: {
    type: Object,
    default: {},
    required: false,
  },

  // Prerequisites
  prerequisites: [String],

  // Learning Outcomes
  learningOutcomes: [String],

  // Pricing & Access
  price: {
    type: Number,
    default: 0,
  },
  currency: {
    type: String,
    default: "INR",
  },
  isFree: {
    type: Boolean,
    default: false,
  },
  accessDuration: {
    type: String,
    enum: ["1-month", "3-months", "6-months", "1-year", "lifetime"],
    default: "lifetime",
  },

  // Engagement & Metrics
  enrollmentCount: {
    type: Number,
    default: 0,
  },
  completionCount: {
    type: Number,
    default: 0,
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      userId: { type: String },
      userName: { type: String },
      rating: { type: Number },
      comment: { type: String },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  // Status
  status: {
    type: String,
    enum: ["Draft", "Published", "Archived", "Unpublished"],
    default: "Draft",
  },
  isActive: {
    type: Boolean,
    default: true,
  },

  // Metadata
  tags: [String],
  language: {
    type: String,
    default: "English",
  },
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

module.exports = CourseModel;
