import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { UserModel, AdminModel } from "@/models";
import { verifyAuth } from "@/lib/jwt";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    await connectDB();

    // Authenticate Admin or Employee
    const auth = verifyAuth(request, ["Admin", "Employee"]);
    if (!auth.authenticated) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const { targetType, targetId, newPassword } = await request.json();

    if (!targetType || !targetId || !newPassword) {
      return Response.json(
        { error: "targetType ('user' or 'admin'), targetId, and newPassword are required." },
        { status: 400 }
      );
    }

    if (typeof newPassword !== "string" || newPassword.trim().length < 6) {
      return Response.json(
        { error: "New password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // Role-based restrictions: Employees can only reset passwords for regular students/users
    if (auth.user.role === "Employee" && targetType !== "user") {
      return Response.json(
        { error: "Access denied: Employees can only reset student/user passwords." },
        { status: 403 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword.trim(), salt);

    if (targetType === "user") {
      const User = createModel("User", UserModel);
      const student = await User.findByIdAndUpdate(
        targetId,
        { password: hashedPassword, updatedAt: new Date() },
        { new: true }
      );
      if (!student) {
        return Response.json({ error: "User not found." }, { status: 404 });
      }

      return Response.json({
        success: true,
        message: `Password for student "${student.fullName || student.name || student.email}" updated successfully!`,
      }, { status: 200 });

    } else if (targetType === "admin") {
      const Admin = createModel("Admin", AdminModel);
      const staff = await Admin.findByIdAndUpdate(
        targetId,
        { password: hashedPassword, updatedAt: new Date() },
        { new: true }
      );
      if (!staff) {
        return Response.json({ error: "Account not found." }, { status: 404 });
      }

      return Response.json({
        success: true,
        message: `Password for ${staff.role} "${staff.name || staff.email}" updated successfully!`,
      }, { status: 200 });

    } else {
      return Response.json(
        { error: "Invalid targetType. Must be 'user' or 'admin'." },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("Error resetting password via Admin endpoint:", error);
    return Response.json(
      { error: "Failed to reset password.", details: error.message },
      { status: 500 }
    );
  }
}
