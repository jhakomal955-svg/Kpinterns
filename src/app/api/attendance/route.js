import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { UserModel, InternshipModel, AttendanceModel } from "@/models";
import { verifyAuth } from "@/lib/jwt";
import { calculateEndDate, getDurationDays } from "@/lib/dateUtils";
import mongoose from "mongoose";

// Helper to calculate start-to-end elapsed calendar days (inclusive of start day)
function getElapsedDays(startDate, endDate) {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const end = endDate ? new Date(endDate) : null;
  if (end) end.setHours(0, 0, 0, 0);

  const referenceDate = (end && end < today) ? end : today;
  const diffTime = referenceDate.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays < 1 ? 1 : diffDays;
}

export async function GET(request) {
  try {
    await connectDB();

    const auth = verifyAuth(request, ["Admin", "User"]);
    if (!auth.authenticated) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const url = new URL(request.url);
    let userId = url.searchParams.get("userId");
    const internshipId = url.searchParams.get("internshipId");

    if (!internshipId) {
      return Response.json({ error: "Internship ID is required" }, { status: 400 });
    }

    // Regular users can only check their own attendance
    if (auth.user.role === "User") {
      userId = auth.user._id;
    } else if (!userId) {
      return Response.json({ error: "User ID is required for admin queries" }, { status: 400 });
    }

    const User = createModel("User", UserModel);
    const Attendance = createModel("Attendance", AttendanceModel);
    createModel("Internship", InternshipModel);

    const user = await User.findById(userId).populate("ActiveInternship.internship");
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const internshipItem = user.ActiveInternship.find(
      (i) => (i.internship?._id || i.internship).toString() === internshipId
    );

    if (!internshipItem) {
      return Response.json({ error: "User is not enrolled in this internship" }, { status: 404 });
    }

    // Lazy load/link attendance record if missing
    let attendanceDoc = null;
    if (internshipItem.attendance) {
      attendanceDoc = await Attendance.findById(internshipItem.attendance);
    }

    if (!attendanceDoc) {
      attendanceDoc = new Attendance({
        user: userId,
        internship: internshipId,
        records: [],
      });
      await attendanceDoc.save();

      internshipItem.attendance = attendanceDoc._id;
      user.markModified("ActiveInternship");
      await user.save();
    }

    // Calculate statistics with Sunday holidays according to that month's calendar
    const records = attendanceDoc.records || [];
    const recordMap = new Map();
    records.forEach(r => recordMap.set(r.date, r.status));

    const startDate = internshipItem.startDate || internshipItem.paymentDate || new Date();
    const duration = internshipItem.duration || internshipItem.internship?.duration || "4 Weeks";
    const expectedEnd = calculateEndDate(startDate, duration);
    const expectedDays = getDurationDays(duration);
    let endDate = expectedEnd;

    if (internshipItem.endDate) {
      const sDate = new Date(startDate);
      const eDate = new Date(internshipItem.endDate);
      sDate.setHours(0, 0, 0, 0);
      eDate.setHours(0, 0, 0, 0);
      const diff = Math.floor((eDate.getTime() - sDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      if (diff === expectedDays) {
        endDate = internshipItem.endDate;
      } else {
        internshipItem.endDate = expectedEnd;
        user.markModified("ActiveInternship");
        await user.save();
      }
    } else {
      internshipItem.endDate = expectedEnd;
      user.markModified("ActiveInternship");
      await user.save();
    }

    const totalCalendarDays = getElapsedDays(startDate, endDate);

    const start = new Date(startDate);
    start.setHours(12, 0, 0, 0);

    let workingDaysCount = 0;
    let holidayCount = 0;
    let presentCount = 0;
    let explicitAbsentCount = 0;
    let leaveCount = 0;
    let autoAbsentCount = 0;

    const curr = new Date(start);
    for (let d = 0; d < totalCalendarDays; d++) {
      const dateStr = curr.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
      const isSunday = curr.getDay() === 0;
      const rec = recordMap.get(dateStr);

      if (isSunday) {
        holidayCount++;
        if (rec === "Present") presentCount++;
        else if (rec === "Leave") leaveCount++;
      } else {
        workingDaysCount++;
        if (rec === "Present") presentCount++;
        else if (rec === "Leave") leaveCount++;
        else if (rec === "Absent") explicitAbsentCount++;
        else if (rec === "Holiday") holidayCount++;
        else autoAbsentCount++;
      }
      curr.setDate(curr.getDate() + 1);
    }

    const absentCount = explicitAbsentCount + autoAbsentCount;
    const denominator = workingDaysCount - leaveCount;
    const percentage = denominator > 0 ? Math.round((presentCount / denominator) * 100) : 100;

    return Response.json({
      success: true,
      data: {
        records,
        presentCount,
        absentCount,
        leaveCount,
        holidayCount,
        workingDaysCount,
        totalCalendarDays,
        percentage: Math.min(100, Math.max(0, percentage)),
        startDate,
        endDate,
      }
    });

  } catch (error) {
    console.error("GET Attendance API error:", error);
    return Response.json({ error: "Failed to fetch attendance data", details: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const auth = verifyAuth(request, ["Admin", "User"]);
    if (!auth.authenticated) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const { userId, internshipId, date, status } = await request.json();

    if (!userId || !internshipId) {
      return Response.json({ error: "Missing required fields: userId and internshipId" }, { status: 400 });
    }

    // Students can only mark their own attendance
    if (auth.user.role === "User" && auth.user._id !== userId) {
      return Response.json({ error: "Unauthorized operation" }, { status: 403 });
    }

    const todayKolkata = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }); // YYYY-MM-DD
    const targetDate = date || todayKolkata;
    const targetStatus = status || "Present";

    // Check if targetDate is a Sunday
    const [tYear, tMonth, tDay] = targetDate.split("-").map(Number);
    const targetDayOfWeek = new Date(Date.UTC(tYear, tMonth - 1, tDay)).getUTCDay();
    const isTargetSunday = targetDayOfWeek === 0;

    // Students can only mark today as "Present", but on Sundays, it is already a Holiday
    if (auth.user.role === "User") {
      if (targetDate !== todayKolkata) {
        return Response.json({ error: "Students can only mark attendance for today's date" }, { status: 400 });
      }
      if (isTargetSunday) {
        return Response.json({
          success: true,
          message: "Today is Sunday (Holiday). Attendance is not required on Sundays.",
          isHoliday: true,
        });
      }
      if (targetStatus !== "Present") {
        return Response.json({ error: "Students can only mark status as Present" }, { status: 400 });
      }
    }

    const User = createModel("User", UserModel);
    const Attendance = createModel("Attendance", AttendanceModel);

    const user = await User.findById(userId);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const internshipItem = user.ActiveInternship.find(
      (i) => (i.internship?._id || i.internship).toString() === internshipId
    );

    if (!internshipItem) {
      return Response.json({ error: "User is not enrolled in this internship" }, { status: 404 });
    }

    // Get or create attendance document
    let attendanceDoc = null;
    if (internshipItem.attendance) {
      attendanceDoc = await Attendance.findById(internshipItem.attendance);
    }

    if (!attendanceDoc) {
      attendanceDoc = new Attendance({
        user: userId,
        internship: internshipId,
        records: [],
      });
      await attendanceDoc.save();

      internshipItem.attendance = attendanceDoc._id;
      user.markModified("ActiveInternship");
      await user.save();
    }

    // Upsert the record for the target date
    const recordIndex = attendanceDoc.records.findIndex(r => r.date === targetDate);
    if (recordIndex > -1) {
      // Prevent student from overriding a Present record to something else (though client check handles it, API should too)
      if (auth.user.role === "User" && attendanceDoc.records[recordIndex].status === "Present") {
        return Response.json({ success: true, message: "Attendance already marked for today", data: attendanceDoc });
      }
      attendanceDoc.records[recordIndex].status = targetStatus;
    } else {
      attendanceDoc.records.push({ date: targetDate, status: targetStatus });
    }

    // Sort records chronologically
    attendanceDoc.records.sort((a, b) => new Date(a.date) - new Date(b.date));

    await attendanceDoc.save();

    return Response.json({
      success: true,
      message: "Attendance recorded successfully",
      data: attendanceDoc,
    });

  } catch (error) {
    console.error("POST Attendance API error:", error);
    return Response.json({ error: "Failed to record attendance", details: error.message }, { status: 500 });
  }
}
