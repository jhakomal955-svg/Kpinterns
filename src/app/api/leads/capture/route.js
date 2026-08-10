/**
 * Public Lead Capture API Route
 * Handles debounced background saving of partial/abandoned registration data
 */

import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { LeadModel } from "@/models";

import mongoose from "mongoose";

function normalizePhone(phoneStr) {
  if (!phoneStr) return "";
  const cleaned = String(phoneStr).replace(/\D/g, "");
  if (cleaned.length >= 10) {
    return cleaned.slice(-10);
  }
  return "";
}

export async function POST(request) {
  try {
    await connectDB();

    let body = {};
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      body = await request.json();
    } else {
      // Handles navigator.sendBeacon text/plain or urlencoded payload
      const text = await request.text();
      try {
        body = JSON.parse(text);
      } catch (e) {
        body = {};
      }
    }

    const {
      leadId = "",
      fullName = "",
      email = "",
      phone = "",
      gender = "",
      parentName = "",
      university = "",
      college = "",
      degree = "",
      department = "",
      rollNumber = "",
      semester = "",
      session = "",
      registrationNumber = "",
      purchaseType = "internship",
      internshipId = "",
      internshipDomain = "",
      mode = "",
      step = 1,
      status = "",
    } = body;

    const trimmedEmail = (email || "").trim().toLowerCase();
    const validPhone = normalizePhone(phone);
    const trimmedName = (fullName || "").trim();

    const Lead = createModel("Lead", LeadModel);

    // Find existing lead by leadId, email, or 10-digit phone
    let existingLead = null;
    if (leadId && mongoose.Types.ObjectId.isValid(leadId)) {
      existingLead = await Lead.findById(leadId);
    }

    if (!existingLead) {
      const query = [];
      if (trimmedEmail && trimmedEmail.includes("@")) query.push({ email: trimmedEmail });
      if (validPhone && validPhone.length === 10) query.push({ phone: validPhone });

      if (query.length > 0) {
        existingLead = await Lead.findOne({ $or: query });
      }
    }

    // Require valid 10-digit phone or email to create a new lead
    if (!existingLead && (!validPhone || validPhone.length !== 10) && (!trimmedEmail || !trimmedEmail.includes("@"))) {
      return Response.json(
        { error: "Complete 10-digit mobile number or valid email is required to capture lead" },
        { status: 400 }
      );
    }

    const updateFields = {
      lastActivityAt: new Date(),
    };

    if (trimmedName) updateFields.fullName = trimmedName;
    if (trimmedEmail) updateFields.email = trimmedEmail;
    if (validPhone && validPhone.length === 10) updateFields.phone = validPhone;
    if (gender) {
      const formattedGender = gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
      if (["Male", "Female", "Other"].includes(formattedGender)) {
        updateFields.gender = formattedGender;
      }
    }
    if (parentName) updateFields.parentName = parentName;
    if (university) updateFields.university = university;
    if (college) updateFields.college = college;
    if (degree) updateFields.degree = degree;
    if (department) updateFields.department = department;
    if (rollNumber) updateFields.rollNumber = rollNumber;
    if (semester) updateFields.semester = semester;
    if (session) updateFields.session = session;
    if (registrationNumber) updateFields.registrationNumber = registrationNumber;
    if (purchaseType) updateFields.purchaseType = purchaseType;
    if (internshipId) updateFields.internshipId = internshipId;
    if (internshipDomain) updateFields.internshipDomain = internshipDomain;
    if (mode) updateFields.mode = mode;
    if (step) {
      updateFields.lastStepCompleted = Math.max(
        existingLead?.lastStepCompleted || 1,
        Number(step) || 1
      );
    }

    if (status === "Converted") {
      updateFields.status = "Converted";
    }

    let savedLead;
    if (existingLead) {
      if (existingLead.status === "Converted" && status !== "Converted") {
        delete updateFields.status;
      }
      savedLead = await Lead.findByIdAndUpdate(existingLead._id, updateFields, {
        new: true,
      });
    } else {
      if (status) {
        updateFields.status = status;
      }
      savedLead = await Lead.create(updateFields);
    }

    // Auto-clean orphan incomplete keystroke entries matching the same phone prefix
    if (validPhone && validPhone.length === 10) {
      const prefix = validPhone.slice(0, 4);
      await Lead.deleteMany({
        _id: { $ne: savedLead._id },
        email: "",
        phone: { $regex: new RegExp("^" + prefix) },
        $expr: { $lt: [{ $strLenCP: "$phone" }, 10] },
      }).catch(() => {});
    }

    return Response.json(
      {
        success: true,
        message: "Lead captured successfully",
        leadId: savedLead._id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error capturing lead:", error);
    return Response.json(
      { error: "Failed to capture lead", details: error.message },
      { status: 500 }
    );
  }
}
