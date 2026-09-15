import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { PartnerStudentModel, AdminModel, UserModel, InternshipModel } from "@/models";
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
    const collegeAdminId = url.searchParams.get("collegeAdminId");
    const search = url.searchParams.get("search") || "";
    const isEnrolled = url.searchParams.get("isEnrolled");

    const PartnerStudent = createModel("PartnerStudent", PartnerStudentModel);
    const Admin = createModel("Admin", AdminModel);
    const User = createModel("User", UserModel);
    createModel("Internship", InternshipModel);

    let query = {};
    let targetCollegeName = "";
    let targetCollegeAdminId = null;
    let adminDoc = null;

    // Role-based scoping
    if (user.role === "College Admin") {
      adminDoc = await Admin.findById(user.id || user._id);
      if (adminDoc && adminDoc.CollegeName) {
        targetCollegeName = adminDoc.CollegeName.trim();
        targetCollegeAdminId = adminDoc._id;
        query.collegeName = { $regex: new RegExp("^" + targetCollegeName.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&") + "$", "i") };
      } else {
        query.collegeAdminId = user.id || user._id;
        targetCollegeAdminId = user.id || user._id;
      }
    } else {
      if (collegeAdminId) {
        adminDoc = await Admin.findById(collegeAdminId);
        if (adminDoc) {
          targetCollegeAdminId = adminDoc._id;
          targetCollegeName = adminDoc.CollegeName?.trim() || "";
        }
      }
      if (collegeParam && collegeParam.trim()) {
        targetCollegeName = collegeParam.trim();
      }

      if (targetCollegeName) {
        query.collegeName = { $regex: new RegExp("^\\s*" + targetCollegeName.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&") + "\\s*$", "i") };
      } else if (targetCollegeAdminId) {
        query.collegeAdminId = targetCollegeAdminId;
      }
    }

    if (isEnrolled !== null && isEnrolled !== undefined && isEnrolled !== "") {
      query.isEnrolled = isEnrolled === "true";
    }

    // 1. Fetch pre-approved partner student records
    const partnerStudents = await PartnerStudent.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // 2. Fetch all registered users from this college (including self-registered)
    let registeredUsers = [];
    if (targetCollegeName) {
      const escapedCollege = targetCollegeName.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      const userFilter = {
        $or: [
          { college: { $regex: new RegExp("^\\s*" + escapedCollege + "\\s*$", "i") } },
          ...(adminDoc?.Usercreated?.length ? [{ _id: { $in: adminDoc.Usercreated } }] : []),
        ],
      };
      registeredUsers = await User.find(userFilter)
        .populate("ActiveInternship.internship")
        .sort({ createdAt: -1 })
        .lean();
    }

    // Index matched user IDs to identify self-registered students
    const matchedUserIds = new Set();

    // 3. Enrich pre-approved partner students with live user data
    const enrichedPartnerStudents = partnerStudents.map((ps) => {
      const psReg = (ps.registrationNumber || "").trim().toLowerCase();
      const psRoll = (ps.rollNumber || "").trim().toLowerCase();
      const psEmail = (ps.email || "").trim().toLowerCase();
      const psEnrolledId = ps.enrolledUserId ? ps.enrolledUserId.toString() : null;

      const matchedUser = registeredUsers.find((u) => {
        if (psEnrolledId && u._id.toString() === psEnrolledId) return true;
        if (psReg && u.registrationNumber && u.registrationNumber.trim().toLowerCase() === psReg) return true;
        if (psRoll && u.rollNumber && u.rollNumber.trim().toLowerCase() === psRoll) return true;
        if (psEmail && u.email && u.email.trim().toLowerCase() === psEmail) return true;
        return false;
      });

      if (matchedUser) {
        matchedUserIds.add(matchedUser._id.toString());
        const activeInt = matchedUser.ActiveInternship?.[0];
        return {
          ...ps,
          enrolledUserId: matchedUser._id,
          isEnrolled: true,
          isSelfRegistered: false,
          source: "Pre-Approved Roster",
          internshipStatus: activeInt?.internshipStatus || "Active",
          progress: activeInt?.progress ?? 0,
          certificationUrl: activeInt?.certificationUrl || null,
          attendanceCertificateUrl: activeInt?.attendanceCertificateUrl || null,
          offerLetterUrl: activeInt?.offerLetterUrl || null,
          testScore: activeInt?.testScore ?? null,
          internshipTitle: activeInt?.internship?.title || activeInt?.internship?.position || "",
          ActiveInternship: matchedUser.ActiveInternship || [],
          user: {
            _id: matchedUser._id,
            fullName: matchedUser.fullName,
            email: matchedUser.email,
            phone: matchedUser.phone,
            gender: matchedUser.gender,
            parentName: matchedUser.parentName,
            degree: matchedUser.degree,
            department: matchedUser.department,
            semester: matchedUser.semester,
            session: matchedUser.session,
            college: matchedUser.college,
            university: matchedUser.university,
          },
        };
      }

      return {
        ...ps,
        isSelfRegistered: false,
        source: "Pre-Approved Roster",
      };
    });

    // 4. Any registered user not matching a pre-approved record is a Self-Registered student
    const selfRegisteredStudents = registeredUsers
      .filter((u) => !matchedUserIds.has(u._id.toString()))
      .map((u) => {
        const activeInt = u.ActiveInternship?.[0];
        return {
          _id: u._id,
          userId: u._id,
          collegeName: u.college || targetCollegeName,
          university: u.university || "",
          registrationNumber: u.registrationNumber || "",
          rollNumber: u.rollNumber || "",
          fullName: u.fullName || "",
          email: u.email || "",
          phone: u.phone || "",
          gender: u.gender || "",
          parentName: u.parentName || "",
          degree: u.degree || "",
          department: u.department || "",
          semester: u.semester || "",
          session: u.session || "",
          isEnrolled: true,
          enrolledUserId: u._id,
          isSelfRegistered: true,
          source: "Self-Registered",
          internshipStatus: activeInt?.internshipStatus || (u.ActiveInternship?.length > 0 ? "Active" : "Not Enrolled"),
          progress: activeInt?.progress ?? (u.ActiveInternship?.length > 0 ? 0 : null),
          certificationUrl: activeInt?.certificationUrl || null,
          attendanceCertificateUrl: activeInt?.attendanceCertificateUrl || null,
          offerLetterUrl: activeInt?.offerLetterUrl || null,
          testScore: activeInt?.testScore ?? null,
          internshipTitle: activeInt?.internship?.title || activeInt?.internship?.position || "",
          ActiveInternship: u.ActiveInternship || [],
          user: {
            _id: u._id,
            fullName: u.fullName,
            email: u.email,
            phone: u.phone,
            gender: u.gender,
            parentName: u.parentName,
            degree: u.degree,
            department: u.department,
            semester: u.semester,
            session: u.session,
            college: u.college,
            university: u.university,
          },
          createdAt: u.createdAt || new Date(),
        };
      });

    // 5. Combine both sets
    let allStudents = [...enrichedPartnerStudents, ...selfRegisteredStudents];

    // If isEnrolled filter is active
    if (isEnrolled !== null && isEnrolled !== undefined && isEnrolled !== "") {
      const reqEnrolled = isEnrolled === "true";
      allStudents = allStudents.filter((st) => !!st.isEnrolled === reqEnrolled);
    }

    // If search filter is active
    if (search.trim()) {
      const term = search.trim().toLowerCase();
      allStudents = allStudents.filter((st) => {
        return (
          st.fullName?.toLowerCase().includes(term) ||
          st.rollNumber?.toLowerCase().includes(term) ||
          st.registrationNumber?.toLowerCase().includes(term) ||
          st.email?.toLowerCase().includes(term) ||
          st.phone?.toLowerCase().includes(term) ||
          st.department?.toLowerCase().includes(term)
        );
      });
    }

    return Response.json({
      success: true,
      count: allStudents.length,
      preApprovedCount: enrichedPartnerStudents.length,
      selfRegisteredCount: selfRegisteredStudents.length,
      students: allStudents,
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
      const email = (record.email || "").toString().trim().toLowerCase();
      const phone = (record.phone || record.mobile || "").toString().trim();

      const updateData = {
        collegeAdminId: collegeAdminId,
        addedByRole: user.role,
        collegeName,
        university: (record.university || "").trim(),
        registrationNumber,
        rollNumber,
        fullName,
        email,
        phone,
        gender: record.gender || "",
        parentName: (record.parentName || "").trim(),
        degree: (record.degree || "").trim(),
        department: (record.department || "").trim(),
        semester: (record.semester || "").trim(),
        session: (record.session || "").trim(),
      };

      // Find existing by _id, or by registrationNumber, rollNumber, or email if provided
      let existing = null;
      if (record._id) {
        existing = await PartnerStudent.findById(record._id);
      }
      if (!existing && (registrationNumber || rollNumber || email || phone)) {
        const orConditions = [];
        if (registrationNumber) orConditions.push({ registrationNumber });
        if (rollNumber) orConditions.push({ rollNumber });
        if (email) orConditions.push({ email });
        if (phone) orConditions.push({ phone });

        const filter = {
          $or: orConditions,
        };
        if (collegeName) {
          filter.collegeName = { $regex: new RegExp("^" + collegeName.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&") + "$", "i") };
        }
        existing = await PartnerStudent.findOne(filter);
      }

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

export async function PUT(request) {
  return POST(request);
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
