/**
 * Admin API Routes
 * Complete CRUD operations for Admin model
 * GET - Get all admins or a specific admin
 * POST - Create a new admin
 * PUT - Update an admin
 * DELETE - Delete an admin
 */

import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { AdminModel, VerificationOtpModel, UserModel, CourseModel, InternshipModel, AttendanceModel } from "@/models";
import { verifyAuth } from "@/lib/jwt";
import { after } from "next/server";

function calculateEndDate(startDate, durationStr) {
  const date = new Date(startDate);
  switch (durationStr) {
    case "1-week":
    case "1 Week":
      date.setDate(date.getDate() + 7);
      break;
    case "2-weeks":
    case "2 Weeks":
      date.setDate(date.getDate() + 14);
      break;
    case "4-week":
    case "4-weeks":
    case "4 Weeks":
      date.setDate(date.getDate() + 28);
      break;
    case "6-weeks":
    case "6 Weeks":
      date.setDate(date.getDate() + 42);
      break;
    case "8-weeks":
    case "8 Weeks":
      date.setDate(date.getDate() + 56);
      break;
    case "12-weeks":
    case "12 Weeks":
      date.setDate(date.getDate() + 84);
      break;
    case "1-month":
      date.setMonth(date.getMonth() + 1);
      break;
    case "3-months":
      date.setMonth(date.getMonth() + 3);
      break;
    case "6-months":
      date.setMonth(date.getMonth() + 6);
      break;
    case "1-year":
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      date.setDate(date.getDate() + 14);
  }
  return date;
}

export async function GET(request) {
  try {
    await connectDB();

    // Authenticate Admin, Employee, Instructor, College Admin, or Cybercafe Partner
    const auth = verifyAuth(request, ["Admin", "Employee", "Instructor", "College Admin", "Cybercafe Partner"]);
    if (!auth.authenticated) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const url = new URL(request.url);
    const adminId = url.searchParams.get("id");

    const Admin = createModel("Admin", AdminModel);

    if (adminId) {
      // Role-based check: College Admin and Cybercafe Partner should only fetch their own details
      if ((auth.user.role === "College Admin" || auth.user.role === "Cybercafe Partner") && auth.user._id !== adminId) {
        return Response.json({ error: "Access denied: insufficient permissions to view other admin profiles." }, { status: 403 });
      }

      // Ensure referenced models are registered for populate
      createModel("User", UserModel);
      createModel("Course", CourseModel);
      createModel("Internship", InternshipModel);
      createModel("Attendance", AttendanceModel);

      // Get single admin by ID
      const admin = await Admin.findById(adminId)
        .populate({
          path: "Usercreated",
          populate: [
            { path: "ActiveCources.course" },
            { path: "ActiveInternship.internship" },
            { path: "ActiveInternship.attendance" }
          ]
        })
        .select("-password");

      if (!admin) {
        return Response.json({ error: "Admin not found" }, { status: 404 });
      }

      return Response.json({ success: true, data: admin }, { status: 200 });
    } else {
      // Get all admins (exclude passwords)
      const admins = await Admin.find().select("-password");

      return Response.json(
        { success: true, data: admins, total: admins.length },
        { status: 200 },
      );
    }
  } catch (error) {
    console.error("Error fetching admins:", error);
    return Response.json(
      { error: "Failed to fetch admins", details: error.message },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const rawData = await request.json();
    const cleanEmail = rawData.email?.trim().toLowerCase();

    // Check if registration originates from the admin dashboard (bypasses OTP verification)
    const isDashboardCreation = rawData.isAdminCreation === true;

    // If it is dashboard creation, authenticated Admins and Employees are allowed to do this
    if (isDashboardCreation) {
      const auth = verifyAuth(request, ["Admin", "Employee"]);
      if (!auth.authenticated) {
        return Response.json({ error: auth.error }, { status: auth.status });
      }
    }

    const VerificationOtp = createModel("VerificationOtp", VerificationOtpModel);

    if (!isDashboardCreation) {
      // Verify OTP first before any processing or DB checks
      const verifiedOtpRecord = await VerificationOtp.findOne({
        email: cleanEmail,
        verified: true,
        verifiedAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) } // verified within the last 30 minutes
      });

      if (!verifiedOtpRecord) {
        return Response.json(
          { error: "Email address not verified. Please verify your email with OTP first." },
          { status: 400 }
        );
      }
    }
    const cleanedMobile = String(rawData.mobile || "").replace(/\D/g, "");
    let normalizedMobile = cleanedMobile;
    if (cleanedMobile.length === 12 && cleanedMobile.startsWith("91")) {
      normalizedMobile = cleanedMobile.substring(2);
    } else if (cleanedMobile.length === 11 && cleanedMobile.startsWith("0")) {
      normalizedMobile = cleanedMobile.substring(1);
    }

    const data = {
      name: rawData.name?.trim(),
      email: rawData.email?.trim().toLowerCase(),
      mobile: normalizedMobile,
      password: rawData.password,
      agreeTerms: rawData.agreeTerms,
      verified: isDashboardCreation ? (rawData.verified === true) : false,
      role: rawData.role || "Admin",
      bio: rawData.bio?.trim() || "",
      UniversityName: rawData.role === "College Admin" ? (rawData.UniversityName || "") : "",
      CollegeName: rawData.role === "College Admin" ? (rawData.CollegeName || "") : "",
      internshipStartDate: rawData.internshipStartDate ? new Date(rawData.internshipStartDate) : null,
      bankDetails: {
        name: rawData.bankDetails?.name?.trim(),
        accountNumber: rawData.bankDetails?.accountNumber?.trim(),
        ifscCode: rawData.bankDetails?.ifscCode?.trim(),
      },
    };

    // Validate bank details
    if (
      !data.bankDetails ||
      !data.bankDetails.name ||
      !data.bankDetails.accountNumber ||
      !data.bankDetails.ifscCode
    ) {
      return Response.json(
        { error: "Bank Details (Holder Name, Account Number, and IFSC Code) are required." },
        { status: 400 }
      );
    }

    // Validate required fields
    const requiredFields = ["name", "email", "mobile", "password"];

    for (const field of requiredFields) {
      if (!data[field]) {
        return Response.json(
          { error: `${field} is required` },
          { status: 400 },
        );
      }
    }

    if (!data.mobile || !/^[6-9]\d{9}$/.test(data.mobile)) {
      return Response.json(
        { error: "Please enter a valid 10-digit Indian mobile number." },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return Response.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const Admin = createModel("Admin", AdminModel);

    // Check if email already exists
    const existingEmail = await Admin.findOne({ email: data.email });
    if (existingEmail) {
      return Response.json(
        { error: "Admin with this email already exists" },
        { status: 400 },
      );
    }

    // Check if mobile number already exists
    const existingMobile = await Admin.findOne({ mobile: data.mobile });
    if (existingMobile) {
      return Response.json(
        { error: "Admin with this mobile number already exists" },
        { status: 400 },
      );
    }

    // Create new admin
    const newAdmin = new Admin(data);
    await newAdmin.save();

    // Delete the verified OTP record so it cannot be reused (if present)
    if (!isDashboardCreation) {
      try {
        const VerificationOtp = createModel("VerificationOtp", VerificationOtpModel);
        await VerificationOtp.deleteOne({ email: cleanEmail });
      } catch (otpErr) {}
    }

    // Admin created

    // Return without password
    const adminData = newAdmin.toObject();
    delete adminData.password;

    return Response.json(
      { success: true, message: "Admin created successfully", data: adminData },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating admin:", error);
    return Response.json(
      { error: "Failed to create admin", details: error.message },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    await connectDB();

    // Authenticate Admin, Employee, Instructor, College Admin, or Cybercafe Partner
    const auth = verifyAuth(request, ["Admin", "Employee", "Instructor", "College Admin", "Cybercafe Partner"]);
    if (!auth.authenticated) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const url = new URL(request.url);
    const adminId = url.searchParams.get("id");

    if (!adminId) {
      return Response.json({ error: "Admin ID is required" }, { status: 400 });
    }

    // Role-based validation: Non-Admins and Non-Employees can only edit their own profile
    if (auth.user.role !== "Admin" && auth.user.role !== "Employee" && auth.user._id !== adminId) {
      return Response.json(
        { error: `Access denied: ${auth.user.role}s can only edit their own profile.` },
        { status: 403 }
      );
    }

    const data = await request.json();
    const Admin = createModel("Admin", AdminModel);

    // Only Admins can modify verification status, roles, and financial/restricted details
    if (auth.user.role !== "Admin") {
      delete data.verified;
      delete data.role;
      delete data.commissionPercentage;
      delete data.paymentsDone;
      delete data.totalRevenue;
      delete data.employedate;
    }

    // Validate bank details if present in the update
    if (data.bankDetails) {
      if (
        data.bankDetails.name === "" ||
        data.bankDetails.accountNumber === "" ||
        data.bankDetails.ifscCode === ""
      ) {
        return Response.json(
          { error: "Bank Details (Name, Account Number, and IFSC Code) cannot be empty." },
          { status: 400 }
        );
      }
    }

    if (data.internshipStartDate !== undefined) {
      data.internshipStartDate = data.internshipStartDate && data.internshipStartDate !== ""
        ? new Date(data.internshipStartDate)
        : null;
    }

    // Update admin
    const updatedAdmin = await Admin.findByIdAndUpdate(adminId, data, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedAdmin) {
      return Response.json({ error: "Admin not found" }, { status: 404 });
    }

    // Sync student internship start and end dates if College Admin's internshipStartDate is set
    if (updatedAdmin.role === "College Admin" && updatedAdmin.CollegeName?.trim() && updatedAdmin.internshipStartDate) {
      after(async () => {
        try {
          const User = createModel("User", UserModel);
          createModel("Internship", InternshipModel);
          const escapedCollege = updatedAdmin.CollegeName.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
          const students = await User.find({
            college: { $exists: true, $ne: "", $regex: new RegExp("^" + escapedCollege + "$", "i") }
          }).populate("ActiveInternship.internship");

          const newStartDate = new Date(updatedAdmin.internshipStartDate);
          for (const student of students) {
            if (student.ActiveInternship && student.ActiveInternship.length > 0) {
              let updated = false;
              for (const item of student.ActiveInternship) {
                item.startDate = newStartDate;
                const duration = item.internship?.duration || "2 Weeks";
                item.endDate = calculateEndDate(newStartDate, duration);
                updated = true;
              }
              if (updated) {
                student.markModified("ActiveInternship");
                await student.save();
              }
            }
          }
        } catch (syncErr) {
          console.error("❌ Error syncing student internship dates after college admin update:", syncErr);
        }
      });
    }

    return Response.json(
      {
        success: true,
        message: "Admin updated successfully",
        data: updatedAdmin,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating admin:", error);
    return Response.json(
      { error: "Failed to update admin", details: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    await connectDB();

    // Authenticate Admin
    const auth = verifyAuth(request, ["Admin"]);
    if (!auth.authenticated) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const url = new URL(request.url);
    const adminId = url.searchParams.get("id");

    if (!adminId) {
      return Response.json({ error: "Admin ID is required" }, { status: 400 });
    }

    // Prevent deleting oneself
    if (auth.user._id === adminId) {
      return Response.json({ error: "Cannot delete your own admin account." }, { status: 400 });
    }

    const Admin = createModel("Admin", AdminModel);

    // Delete admin
    const deletedAdmin = await Admin.findByIdAndDelete(adminId);

    if (!deletedAdmin) {
      return Response.json({ error: "Admin not found" }, { status: 404 });
    }

    // Admin deleted

    return Response.json(
      { success: true, message: "Admin deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting admin:", error);
    return Response.json(
      { error: "Failed to delete admin", details: error.message },
      { status: 500 },
    );
  }
}
