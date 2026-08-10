import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { PartnerStudentModel, AdminModel } from "@/models";

export async function GET(request) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const queryStr = (url.searchParams.get("query") || url.searchParams.get("regNo") || url.searchParams.get("rollNo") || "").trim();

    if (!queryStr) {
      return Response.json(
        { success: false, error: "Please provide a valid Roll Number or Registration Number to search." },
        { status: 400 }
      );
    }

    const PartnerStudent = createModel("PartnerStudent", PartnerStudentModel);
    const Admin = createModel("Admin", AdminModel);

    // Search by exact match (case-insensitive) on registrationNumber or rollNumber
    const searchRegex = new RegExp("^" + queryStr.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&") + "$", "i");

    const studentRecord = await PartnerStudent.findOne({
      $or: [
        { registrationNumber: searchRegex },
        { rollNumber: searchRegex },
      ],
    }).lean();

    if (!studentRecord) {
      return Response.json(
        {
          success: true,
          found: false,
          message: "No registered college student record found matching this Roll Number or Registration Number.",
        },
        { status: 200 }
      );
    }

    // Look up college rates if available
    let internshipRate = 0;
    let courseRate = 0;

    if (studentRecord.collegeName) {
      const escapedCollege = studentRecord.collegeName.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      const collegeAdmin = await Admin.findOne({
        role: "College Admin",
        verified: true,
        CollegeName: { $regex: new RegExp("^" + escapedCollege + "$", "i") },
      });

      if (collegeAdmin) {
        internshipRate = collegeAdmin.internshipRate || 0;
        courseRate = collegeAdmin.courseRate || 0;
      }
    }

    return Response.json(
      {
        success: true,
        found: true,
        student: studentRecord,
        collegeRates: {
          internshipRate,
          courseRate,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in partner student search API:", error);
    return Response.json(
      { success: false, error: "Failed to search partner student details", details: error.message },
      { status: 500 }
    );
  }
}
