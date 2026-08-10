/**
 * Public Lead Capture API Route
 * Handles debounced background saving of partial/abandoned registration data
 */

import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { LeadModel } from "@/models";

export async function POST(request) {
  try {
    await connectDB();

    let body = {};
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      body = await request.json();
    } else {
      // Handles navigator.sendBeacon text/plain payload
      const text = await request.text();
      try {
        body = JSON.parse(text);
      } catch (e) {
        body = {};
      }
    }

    const {
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
    const trimmedPhone = (phone || "").trim();
    const trimmedName = (fullName || "").trim();

    // We need at least an email or phone number to create/track a lead
    if (!trimmedEmail && !trimmedPhone) {
      return Response.json(
        { error: "At least email or phone is required to capture lead" },
        { status: 400 }
      );
    }

    const Lead = createModel("Lead", LeadModel);

    // Build matching query
    const query = [];
    if (trimmedEmail) query.push({ email: trimmedEmail });
    if (trimmedPhone) query.push({ phone: trimmedPhone });

    let existingLead = null;
    if (query.length > 0) {
      existingLead = await Lead.findOne({ $or: query });
    }

    const updateFields = {
      lastActivityAt: new Date(),
    };

    if (trimmedName) updateFields.fullName = trimmedName;
    if (trimmedEmail) updateFields.email = trimmedEmail;
    if (trimmedPhone) updateFields.phone = trimmedPhone;
    if (gender) updateFields.gender = gender;
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
      // Don't downgrade status if already converted
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
