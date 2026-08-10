import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { PartnerStudentModel, AdminModel } from "@/models";
import { verifyAuth } from "@/lib/jwt";

export async function GET(request) {
  try {
    await connectDB();

    const authResult = verifyAuth(request, ["Admin", "College Admin", "Employee"]);
    if (!authResult.authenticated) {
      return Response.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user } = authResult;
    const url = new URL(request.url);
    const collegeParam = url.searchParams.get("college");
    const search = url.searchParams.get("search") || "";
    const isEnrolled = url.searchParams.get("isEnrolled");

    const PartnerStudent = createModel("PartnerStudent", PartnerStudentModel);
    const Admin = createModel("Admin", AdminModel);

    let query = {};

    // Role-based scoping
    if (user.role === "College Admin") {
      const adminDoc = await Admin.findById(user.id || user._id);
      if (adminDoc && adminDoc.CollegeName) {
        query.collegeName = { $regex: new RegExp("^" + adminDoc.CollegeName.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&") + "$", "i") };
      } else {
        query.collegeAdminId = user.id || user._id;
      }
    } else if (collegeParam) {
      query.collegeName = { $regex: new RegExp(collegeParam.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"), "i") };
    }

    if (isEnrolled !== null && isEnrolled !== undefined && isEnrolled !== "") {
      query.isEnrolled = isEnrolled === "true";
    }

    if (search.trim()) {
      const searchRegex = new RegExp(search.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"), "i");
      query.$or = [
        { fullName: searchRegex },
        { rollNumber: searchRegex },
        { registrationNumber: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { department: searchRegex },
      ];
    }

    const students = await PartnerStudent.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return Response.json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    console.error("Error fetching partner students:", error);
    return Response.json(
      { success: false, error: "Failed to fetch partner students roster", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const authResult = verifyAuth(request, ["Admin", "College Admin", "Employee"]);
    if (!authResult.authenticated) {
      return Response.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user } = authResult;
    const body = await request.json();

    const PartnerStudent = createModel("PartnerStudent", PartnerStudentModel);
    const Admin = createModel("Admin", AdminModel);

    // Get college details if user is College Admin
    let defaultCollegeName = "";
    let collegeAdminId = user.id || user._id;

    if (user.role === "College Admin") {
      const adminDoc = await Admin.findById(collegeAdminId);
      if (adminDoc) {
        defaultCollegeName = adminDoc.CollegeName || "";
      }
    }

    const recordsToInsert = Array.isArray(body) ? body : [body];

    if (recordsToInsert.length === 0) {
      return Response.json(
        { success: false, error: "No student data provided" },
        { status: 400 }
      );
    }

    const results = {
      added: 0,
      updated: 0,
      errors: [],
    };

    for (let i = 0; i < recordsToInsert.length; i++) {
      const record = recordsToInsert[i];

      const rollNumber = (record.rollNumber || record.rollNo || "").toString().trim();
      const registrationNumber = (record.registrationNumber || record.regNo || "").toString().trim();
      const fullName = (record.fullName || record.name || "").toString().trim();
      const collegeName = (record.collegeName || record.college || defaultCollegeName).toString().trim();

      if (!rollNumber || !registrationNumber || !fullName || !collegeName) {
        results.errors.push({
          index: i,
          record,
          error: "Missing required fields: rollNumber, registrationNumber, fullName, or collegeName",
        });
        continue;
      }

      const filter = {
        collegeName: { $regex: new RegExp("^" + collegeName.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&") + "$", "i") },
        $or: [{ registrationNumber }, { rollNumber }],
      };

      const updateData = {
        collegeAdminId: collegeAdminId,
        addedByRole: user.role,
        collegeName,
        university: (record.university || "").trim(),
        registrationNumber,
        rollNumber,
        fullName,
        email: (record.email || "").trim().toLowerCase(),
        phone: (record.phone || record.mobile || "").trim(),
        gender: record.gender || "",
        parentName: (record.parentName || "").trim(),
        degree: (record.degree || "B.Tech").trim(),
        department: (record.department || "Computer Science").trim(),
        semester: (record.semester || "6th").trim(),
        session: (record.session || "2023-2027").trim(),
      };

      const existing = await PartnerStudent.findOne(filter);

      if (existing) {
        await PartnerStudent.updateOne({ _id: existing._id }, { $set: updateData });
        results.updated++;
      } else {
        await PartnerStudent.create(updateData);
        results.added++;
      }
    }

    return Response.json({
      success: true,
      message: `Processed ${recordsToInsert.length} student records successfully.`,
      added: results.added,
      updated: results.updated,
      failed: results.errors.length,
      errors: results.errors,
    });
  } catch (error) {
    console.error("Error saving partner student records:", error);
    return Response.json(
      { success: false, error: "Failed to process student records", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await connectDB();

    const authResult = verifyAuth(request, ["Admin", "College Admin", "Employee"]);
    if (!authResult.authenticated) {
      return Response.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return Response.json(
        { success: false, error: "Student ID parameter is required" },
        { status: 400 }
      );
    }

    const PartnerStudent = createModel("PartnerStudent", PartnerStudentModel);
    const deleted = await PartnerStudent.findByIdAndDelete(id);

    if (!deleted) {
      return Response.json(
        { success: false, error: "Student record not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Student record deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting partner student record:", error);
    return Response.json(
      { success: false, error: "Failed to delete student record", details: error.message },
      { status: 500 }
    );
  }
}
