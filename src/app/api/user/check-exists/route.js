import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { UserModel, AdminModel } from "@/models";

export async function POST(req) {
  try {
    await connectDB();
    const { email, phone } = await req.json();

    const User = createModel("User", UserModel);
    const Admin = createModel("Admin", AdminModel);
    const result = { emailExists: false, phoneExists: false };

    if (email && typeof email === "string" && email.trim()) {
      const normalizedEmail = email.trim();
      const escapedEmail = normalizedEmail.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      const regex = new RegExp("^" + escapedEmail + "$", "i");

      const [existingUserEmail, existingAdminEmail] = await Promise.all([
        User.findOne({ email: regex }),
        Admin.findOne({ email: regex }),
      ]);

      if (existingUserEmail || existingAdminEmail) {
        result.emailExists = true;
      }
    }

    if (phone && (typeof phone === "string" || typeof phone === "number")) {
      const cleanedPhone = String(phone).replace(/\D/g, "");
      let normalizedPhone = cleanedPhone;
      if (cleanedPhone.length === 12 && cleanedPhone.startsWith("91")) {
        normalizedPhone = cleanedPhone.substring(2);
      } else if (cleanedPhone.length === 11 && cleanedPhone.startsWith("0")) {
        normalizedPhone = cleanedPhone.substring(1);
      }
      if (/^[6-9]\d{9}$/.test(normalizedPhone)) {
        const [existingUserPhone, existingAdminPhone] = await Promise.all([
          User.findOne({ phone: normalizedPhone }),
          Admin.findOne({ phone: normalizedPhone }),
        ]);
        if (existingUserPhone || existingAdminPhone) {
          result.phoneExists = true;
        }
      }
    }

    return Response.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error checking user existence:", error);
    return Response.json(
      { error: "Failed to check account availability" },
      { status: 500 }
    );
  }
}
