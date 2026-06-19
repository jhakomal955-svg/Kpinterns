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
    enum: ["Admin", "Instructor","College Admin","Cybercafe Partner"],
    default: "Admin",
  },
  UniversityName: {
    type: String,
    default: "",
  },
  CollegeName: {
    type: String,
    default: "",
  },
  bio: {
    type: String,
    default: "",
  },
  bankDetails:{
    name:{
      type:String,
      required:true,
    },
    accountNumber:{
      type:String,
      required:true,
    },
    ifscCode:{
      type:String,
      required:true,
    },
  },
  commissionPercentage:{
    type:Number,
    default:0,
  },
  paymentsDone:{
   type:Number,
   default:0
  },
  totalRevenue:{
    type:Number,
    default:0
  },
  employedate:{
    type:Date,
    default:Date.now,
  },
  Usercreated:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:"User",
    }
  ]
  ,
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
