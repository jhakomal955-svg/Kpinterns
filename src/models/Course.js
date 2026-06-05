/**
 * Course Model
 * Represents an online/offline course with multimedia content
 */

const mongoose = require("mongoose");
const { department } = require("./UserModel");

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
  department:{
    type: String,
    required: true,
    enum: ["Bsc", "BTech", "BBA", "BCom", "BA", "BCA", "BScIT", "BScCS", "Other"],
  },
  domain: {
    type: String,
    required: true,
    validate: {
      validator: function(value) {
        // Find department value, checking both document save context and update query context
        let dept = this.department;
        if (!dept && typeof this.getUpdate === "function") {
          const update = this.getUpdate();
          dept = update.department || (update.$set && update.$set.department);
        }

        const techDepartments = ["BTech", "BCA", "BScIT", "BScCS"];
        const businessDepartments = ["BBA", "BCom"];

        const techDomains = [
          "Full Stack Development",
          "Frontend Development",
          "Backend Development",
          "Mobile App Development",
          "Data Science & Machine Learning",
          "DevOps & Cloud Computing",
          "Cybersecurity",
          "IoT & Embedded Systems",
          "Artificial Intelligence",
          "Blockchain Development",
          "Game Development",
          "Web3 & Cryptocurrency",
          "Other Tech"
        ];

        const businessDomains = [
          "Finance & Accounting",
          "Human Resources",
          "Marketing & Branding",
          "Sales & Business Development",
          "Management Consulting",
          "Supply Chain Management",
          "Operations Management",
          "Other Business"
        ];

        const artsGeneralDomains = [
          "Public Relations",
          "Event Management",
          "Journalism & Media",
          "Tourism & Hospitality",
          "Legal Services",
          "Content Writing",
          "Graphic Design",
          "Other"
        ];

        const allValidDomains = [...techDomains, ...businessDomains, ...artsGeneralDomains];

        // If department is not provided yet or is not in the list, check against all valid domains
        if (!dept) {
          return allValidDomains.includes(value);
        }

        if (techDepartments.includes(dept)) {
          return techDomains.includes(value);
        }
        if (businessDepartments.includes(dept)) {
          return businessDomains.includes(value);
        }
        // General BA, Bsc, or Other departments
        return artsGeneralDomains.includes(value);
      },
      message: "Selected domain is invalid for this department"
    }
  },
  difficultyLevel: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
    default: "Beginner",
  },

  // Instructor/Admin Information
  instructor:[{
    id:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"Admin",
    }
  }],

  // Course Content
  content:[
    {
      title:{
        type:String,
      },
      textContent:{
        type:String,
      },
      VideoUrl:{
        type:String
      },
      pdfurl:{
       type:String
      },
      imageurl:{
       type:String
      },
      externalink:{
        type:String
      }
    }
  ],

  updates:[{
    title:{
      type:String,
    },
    externalLink:{
      type:String
    }
  }],

  // Course Duration
  duration: {
    type: String,
    enum: ["1-week", "2-weeks", "1-month", "3-months", "6-months", "1-year"],
    default: "1-month",
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
