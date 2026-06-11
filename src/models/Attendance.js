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
  },
  internship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Internship",
    required: true,
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
