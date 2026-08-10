/**
 * Single Lead API Route (Update status, add follow-up notes, assign employee, delete)
 */

import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { LeadModel } from "@/models";
import { verifyAuth } from "@/lib/jwt";

export async function GET(request, { params }) {
  try {
    await connectDB();

    const auth = verifyAuth(request, ["Admin", "Employee"]);
    if (!auth.authenticated) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const Lead = createModel("Lead", LeadModel);
    const lead = await Lead.findById(id);

    if (!lead) {
      return Response.json({ error: "Lead not found" }, { status: 404 });
    }

    return Response.json({ success: true, data: lead }, { status: 200 });
  } catch (error) {
    console.error("Error fetching lead:", error);
    return Response.json(
      { error: "Failed to fetch lead", details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    await connectDB();

    const auth = verifyAuth(request, ["Admin", "Employee"]);
    if (!auth.authenticated) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const data = await request.json();
    const Lead = createModel("Lead", LeadModel);

    const lead = await Lead.findById(id);
    if (!lead) {
      return Response.json({ error: "Lead not found" }, { status: 404 });
    }

    const updateOps = {};

    // Allow status update
    if (data.status) {
      updateOps.status = data.status;
    }

    // Allow assignment
    if (data.assignedEmployee !== undefined) {
      updateOps.assignedEmployee = data.assignedEmployee;
    }
    if (data.assignedEmployeeName !== undefined) {
      updateOps.assignedEmployeeName = data.assignedEmployeeName;
    }

    // Allow field edits if provided
    if (data.fullName) updateOps.fullName = data.fullName;
    if (data.email) updateOps.email = data.email;
    if (data.phone) updateOps.phone = data.phone;

    updateOps.lastActivityAt = new Date();

    // Push new note if provided
    let updateQuery = { $set: updateOps };
    if (data.newNote && data.newNote.trim()) {
      updateQuery.$push = {
        notes: {
          comment: data.newNote.trim(),
          addedBy: auth.user.email || "Employee",
          addedByRole: auth.user.role || "Employee",
          createdAt: new Date(),
        },
      };
    }

    const updatedLead = await Lead.findByIdAndUpdate(id, updateQuery, {
      new: true,
    });

    return Response.json(
      {
        success: true,
        message: "Lead updated successfully",
        data: updatedLead,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating lead:", error);
    return Response.json(
      { error: "Failed to update lead", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const auth = verifyAuth(request, ["Admin", "Employee"]);
    if (!auth.authenticated) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const Lead = createModel("Lead", LeadModel);

    const deletedLead = await Lead.findByIdAndDelete(id);
    if (!deletedLead) {
      return Response.json({ error: "Lead not found" }, { status: 404 });
    }

    return Response.json(
      { success: true, message: "Lead deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting lead:", error);
    return Response.json(
      { error: "Failed to delete lead", details: error.message },
      { status: 500 }
    );
  }
}
