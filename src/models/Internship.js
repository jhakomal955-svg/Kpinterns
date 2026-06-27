/**
 * Internship Model
 * Represents an internship opportunity with multimedia content and company details
 */
import mongoose from "mongoose";

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
    enum: [
      "BTech",
      "Diploma",
      "BSc",
      "BA",
      "BCom",
    ],
  },

  department: {
    type: [String],
    required: true,
    enum: [
      // ── Engineering (B.Tech / Diploma) ─────────────────────────────
      "Computer Science & Engineering",
      "Mechanical Engineering",
      "Civil Engineering",
      "Electrical Engineering",
      "Electronics & Communication",
      "Chemical Engineering",
      // ── Pure & Applied Sciences (BSc) ──────────────────────────────
      "Physics",
      "Chemistry",
      "Mathematics",
      "Statistics",
      "Botany",
      "Zoology",
      "Microbiology",
      "Biotechnology",
      "Biochemistry",
      "Computer Science",   // BSc CS / BCA / BScIT / BScCS
      "Data Science",
      "Agriculture",
      "Nursing",
      "Forensic Science",
      // ── Arts & Humanities (BA) ──────────────────────────────────────
      "Humanities",
      "Social Sciences",
      "Languages",
      "Arts & Media",
      "Vocational/Applied",
      // ── Commerce & Business (BCom / BBA) ───────────────────────────
      "Accounting & Finance",
      "Business Administration",
      "Banking & Insurance",
      "Taxation",
      "Economics",
      "Sales & Marketing",
      "Computer Applications",
      // ── Education ───────────────────────────────────────────────────
      "General Teacher Training",
      // ── Law ─────────────────────────────────────────────────────────
      "Civil Law",
      "Criminal Law",
      "Corporate Law",
    ],
  },

  domain: {
    type: String,
    required: true,
    enum: [
      // ── Computer Science & Engineering ──────────────────────────────
      "Web Development",
      "Machine Learning",
      "Artificial Intelligence",
      "Data Science",
      "Cyber Security",
      "Cloud Computing",
      "Android Development",
      "Full Stack Development",
      "Frontend Development",
      "Backend Development",
      "Mobile App Development",
      "Data Science & Machine Learning",
      "Artificial Intelligence",
      "DevOps & Cloud Computing",
      "Cybersecurity",
      "Blockchain Development",
      "Web3 & Cryptocurrency",
      "Game Development",
      "IoT & Embedded Systems",
      "Software Testing & QA",
      "Database Administration",
      "UI/UX Design",
      "Other Tech",
      // ── Mechanical Engineering ───────────────────────────────────────
      "AutoCAD",
      "Car Designing",
      "IC Engine",
      "Hybrid Electric Vehicle",
      "SolidWorks",
      "Product Design & Development",
      "CAD/CAM Design",
      "Manufacturing & Production",
      "Automobile Engineering",
      "Thermal & HVAC Engineering",
      "Robotics & Automation",
      "Quality Control & Inspection",
      "Industrial Engineering",
      "Maintenance Engineering",
      "Energy & Power Systems",
      "3D Printing & Additive Manufacturing",
      "Project Management (Mechanical)",
      "Other Mechanical",
      // ── Civil Engineering ────────────────────────────────────────────
      "AutoCAD",
      "Construction Planning",
      "Revit Architecture",
      "SolidWorks",
      "3ds Max",
      "Industrial Training",
      "Structural Engineering",
      "Construction Management",
      "Urban Planning & Design",
      "Geotechnical Engineering",
      "Transportation Engineering",
      "Water Resources & Irrigation",
      "Environmental Engineering",
      "Surveying & GIS",
      "Building Information Modelling (BIM)",
      "Project Management (Civil)",
      "Other Civil",
      // ── Electrical Engineering ───────────────────────────────────────
      "Internet of Things (IoT)",
      "Robotics",
      "VLSI Design",
      "Embedded Systems",
      "Power Systems & Grid Engineering",
      "Renewable Energy & Solar",
      "Control Systems & Automation",
      "Electrical Machine Design",
      "High Voltage & Power Electronics",
      "PLC & SCADA Programming",
      "Instrumentation & Measurement",
      "EV & Battery Technology",
      "Electrical Project Management",
      "Other Electrical",
      // ── Electronics & Communication ──────────────────────────────────
      "Internet of Things (IoT)",
      "Robotics",
      "VLSI Design",
      "Embedded Systems",
      "Embedded Systems & IoT",
      "VLSI Design",
      "PCB Design & Prototyping",
      "Signal Processing",
      "Telecommunications & Networking",
      "RF & Microwave Engineering",
      "Consumer Electronics Testing",
      "Firmware Development",
      "Other Electronics",
      // ── Chemical Engineering ─────────────────────────────────────────
      "Process Engineering",
      "Petroleum & Refinery",
      "Pharmaceutical Manufacturing",
      "Polymer & Materials Science",
      "Food Technology",
      "Environmental & Safety Engineering",
      "Quality Assurance (Chemical)",
      "Research & Development (Chemical)",
      "Other Chemical",
      // ── Data Science ─────────────────────────────────────────────────
      "Data Analysis & Visualization",
      "Machine Learning Engineering",
      "Business Intelligence",
      "Data Engineering & Pipelines",
      "AI Research",
      "Statistical Modelling",
      "Other Data Science",
      // ── Biotechnology ────────────────────────────────────────────────
      "Molecular Biology Research",
      "Pharmaceutical Biotechnology",
      "Agricultural Biotechnology",
      "Bioinformatics",
      "Environmental Biotechnology",
      "Other Biotechnology",
      // ── Life Sciences (Micro / Biochem / Zoology / Botany) ───────────
      "Clinical Microbiology",
      "Food & Beverage Microbiology",
      "Research & Development (Micro)",
      "Quality Control (Lab)",
      "Clinical Research",
      "Pharmaceutical R&D",
      "Nutrition & Dietetics",
      "Wildlife Conservation",
      "Veterinary Support",
      "Plant Research",
      "Horticulture",
      "Pharmaceutical Botany",
      "Other Life Sciences",
      // ── Pure Sciences ────────────────────────────────────────────────
      "Research & Development",
      "Instrumentation",
      "Renewable Energy",
      "Analytical Chemistry",
      "Actuarial Science",
      "Quantitative Finance",
      "Market Research",
      "Other Sciences",
      // ── Agriculture ──────────────────────────────────────────────────
      "Agribusiness Management",
      "Agricultural Research",
      "Rural Development",
      "Other Agriculture",
      // ── Healthcare ───────────────────────────────────────────────────
      "Clinical Nursing",
      "Community Health",
      "Hospital Administration",
      "Other Healthcare",
      // ── Forensic ─────────────────────────────────────────────────────
      "Crime Investigation Support",
      "Lab Analysis",
      "Legal Services",
      "Other Forensic",
      // ── Commerce / Finance ───────────────────────────────────────────
      "Marketing",
      "Digital Marketing",
      "Business Analytics",
      "Finance",
      "Human Resource Management",
      "Stock Market",
      "Financial Analysis",
      "Accounting & Audit",
      "Taxation",
      "Investment Banking",
      "Financial Modelling",
      "Other Finance",
      "General Management",
      "Operations Management",
      "Project Management",
      "Entrepreneurship",
      "Other Business",
      "Banking Operations",
      "Insurance Sales & Advisory",
      "Risk Management",
      "Loan Processing",
      "GST & Indirect Taxation",
      "Direct Taxation",
      "Tax Audit & Compliance",
      "Economic Research & Policy",
      "Other Economics",
      "Digital Marketing",
      "Content Marketing",
      "Sales & Business Development",
      "Brand Management",
      "Social Media Marketing",
      "Other Marketing",
      // ── Arts / Humanities ────────────────────────────────────────────
      "Content Writing",
      "Journalism & Media",
      "Public Relations",
      "Event Management",
      "Social Work & NGO",
      "Other Humanities",
      "Public Policy Research",
      "Community Development",
      "Other Social Sciences",
      "Translation & Interpretation",
      "Teaching & Tutoring",
      "Other Languages",
      "Graphic Design",
      "Photography & Videography",
      "Animation & VFX",
      "Film Production",
      "Other Media",
      "Tourism & Hospitality",
      "Retail Management",
      "Other Vocational",
      "Machine Learning",
      "Data Science",
      "Cyber Security",
      "Cloud Computing",
      "Android Development",
      "Car Designing",
      "IC Engine",
      "Hybrid Electric Vehicle",
      "SolidWorks",
      "Construction Planning",
      "Revit Architecture",
      "3ds Max",
      "Industrial Training",
      "Robotics",
      "Embedded Systems",
      "Business Analytics",
      "Finance",
      "Human Resource Management",
      "Stock Market"
    ],
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
    enum: ["1-week", "2-weeks", "1-month", "3-months", "6-months", "1-year", "4-week", "4-weeks", "6-weeks", "8-weeks", "12-weeks"],
    default: "1-month",
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