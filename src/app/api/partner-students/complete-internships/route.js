import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { UserModel, InternshipModel, AdminModel, PartnerStudentModel } from "@/models";
import { verifyAuth } from "@/lib/jwt";
import { checkAndAutomateDocuments } from "@/lib/documentAutomation";

export async function POST(request) {
  try {
    await connectDB();

    // Authenticate Admin, Employee, or College Admin
    const authResult = verifyAuth(request, ["Admin", "Employee", "College Admin"]);
    if (!authResult.authenticated) {
      return Response.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user } = authResult;
    const body = await request.json();
    let { collegeName, collegeAdminId } = body;

    const Admin = createModel("Admin", AdminModel);
    const User = createModel("User", UserModel);
    const PartnerStudent = createModel("PartnerStudent", PartnerStudentModel);
    createModel("Internship", InternshipModel);

    let adminDoc = null;

    if (user.role === "College Admin") {
      adminDoc = await Admin.findById(user._id);
      if (!adminDoc) {
        return Response.json({ success: false, error: "College Admin profile not found" }, { status: 404 });
      }
      collegeName = adminDoc.CollegeName || collegeName;
      collegeAdminId = adminDoc._id.toString();
    } else if (collegeAdminId) {
      adminDoc = await Admin.findById(collegeAdminId);
      if (adminDoc && !collegeName) {
        collegeName = adminDoc.CollegeName || "";
      }
    }

    if (!collegeName || !collegeName.trim()) {
      return Response.json(
        { success: false, error: "College name is required to complete college batch internships." },
        { status: 400 }
      );
    }

    const trimmedCollege = collegeName.trim();
    const escapedCollege = trimmedCollege.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const collegeRegex = new RegExp("^\\s*" + escapedCollege + "\\s*$", "i");

    // Gather all linked user IDs from partner student roster
    const partnerStudents = await PartnerStudent.find({
      $or: [
        ...(collegeAdminId ? [{ collegeAdminId }] : []),
        { collegeName: { $regex: collegeRegex } },
      ],
      enrolledUserId: { $ne: null },
    }).select("enrolledUserId").lean();

    const linkedUserIds = partnerStudents.map((ps) => ps.enrolledUserId).filter(Boolean);

    // Find all users from this college
    const collegeUsers = await User.find({
      $or: [
        { college: { $regex: collegeRegex } },
        ...(adminDoc?.Usercreated?.length ? [{ _id: { $in: adminDoc.Usercreated } }] : []),
        ...(linkedUserIds.length ? [{ _id: { $in: linkedUserIds } }] : []),
      ],
    }).populate("ActiveInternship.internship");

    if (!collegeUsers || collegeUsers.length === 0) {
      return Response.json({
        success: true,
        message: `No enrolled students found for college: "${trimmedCollege}".`,
        totalStudents: 0,
        completedCount: 0,
        certificatesIssuedCount: 0,
        alreadyHadCertificateCount: 0,
      });
    }

    let completedCount = 0;
    let certificatesIssuedCount = 0;
    let alreadyHadCertificateCount = 0;
    let freeStudentsPendingPaymentCount = 0;
    const now = new Date();

    for (const student of collegeUsers) {
      if (!student.ActiveInternship || student.ActiveInternship.length === 0) {
        continue;
      }

      let userModified = false;
      let hasPaidInternshipNeedingCert = false;

      for (const item of student.ActiveInternship) {
        // Mark as completed and 100% progress
        if (item.internshipStatus !== "Completed" || item.progress !== 100) {
          item.internshipStatus = "Completed";
          item.progress = 100;
          userModified = true;
        }

        if (!item.endDate) {
          item.endDate = now;
          userModified = true;
        }

        // Auto-complete test if pending so test does not block future certification
        if (!item.testTaken) {
          item.testTaken = true;
          item.testScore = item.testScore ?? 90;
          item.testTakenAt = now;
          userModified = true;
        }

        const isFreeUser = (item.amount === 0 || item.amount === undefined || item.amount === null || item.amount <= 0);

        if (item.certificationUrl && typeof item.certificationUrl === "string" && item.certificationUrl.trim()) {
          alreadyHadCertificateCount++;
        } else if (!isFreeUser) {
          // Only paid students can receive certificates automatically
          hasPaidInternshipNeedingCert = true;
        } else {
          // Free students: certificate and attendance logbook stay locked until payment
          freeStudentsPendingPaymentCount++;
        }
      }

      if (userModified) {
        student.markModified("ActiveInternship");
        student.updatedAt = now;
        await student.save();
        completedCount++;
      } else {
        completedCount++;
      }

      // ONLY generate documents for paid students missing certificate!
      // For free students, without payment certificates will NOT generate!
      if (hasPaidInternshipNeedingCert) {
        try {
          const generated = await checkAndAutomateDocuments(student._id.toString());
          if (generated) {
            certificatesIssuedCount++;
          }
        } catch (docErr) {
          console.error(`[College Batch Complete] Error generating certificate for student ${student._id}:`, docErr);
        }
      }
    }

    let message = `Marked internship completed for ${completedCount} student(s).`;
    if (certificatesIssuedCount > 0) {
      message += ` Issued ${certificatesIssuedCount} certificate(s) for paid students.`;
    }
    if (alreadyHadCertificateCount > 0) {
      message += ` (${alreadyHadCertificateCount} already had certificates).`;
    }
    if (freeStudentsPendingPaymentCount > 0) {
      message += ` ${freeStudentsPendingPaymentCount} free student(s) will unlock certificates and log books upon completing their payment.`;
    }

    return Response.json({
      success: true,
      message,
      totalStudents: collegeUsers.length,
      completedCount,
      certificatesIssuedCount,
      alreadyHadCertificateCount,
      freeStudentsPendingPaymentCount,
    });
  } catch (error) {
    console.error("Error completing college internships:", error);
    return Response.json(
      { success: false, error: "Failed to mark college internships complete", details: error.message },
      { status: 500 }
    );
  }
}
