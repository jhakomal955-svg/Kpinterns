/**
 * Attendance Model
 * Tracks attendance records for a user enrolled in a specific internship
 */

import mongoose from "mongoose";

const AttendanceModel = {
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  internship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Internship",
    required: true,
    index: true,
  },
  records: [
    {
      date: {
        type: String, // Format: YYYY-MM-DD
        required: true,
      },
      status: {
        type: String,
        enum: ["Present", "Absent", "Leave"],
        default: "Present",
      },
    },
  ],
};

export default AttendanceModel;
