/**
 * Contact API Routes
 * Complete CRUD operations for Contact model
 * GET - Get all contacts or a specific contact
 * POST - Create a new contact
 * PUT - Update a contact
 * DELETE - Delete a contact
 */

import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { ContactModel } from "@/models";
import { verifyAuth } from "@/lib/jwt";
import { verifyTurnstileToken } from "@/lib/turnstile";

export async function GET(request) {
  try {
    await connectDB();

    // Authenticate Admin only
    const auth = verifyAuth(request, ["Admin"]);
    if (!auth.authenticated) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const url = new URL(request.url);
    const contactId = url.searchParams.get("id");
    const status = url.searchParams.get("status");

    const Contact = createModel("Contact", ContactModel);

    if (contactId) {
      // Get single contact by ID
      const contact = await Contact.findById(contactId);

      if (!contact) {
        return Response.json({ error: "Contact not found" }, { status: 404 });
      }

      return Response.json({ success: true, data: contact }, { status: 200 });
    } else if (status) {
      // Get contacts by status
      const contacts = await Contact.find({ status });

      return Response.json(
        { success: true, data: contacts, total: contacts.length },
        { status: 200 },
      );
    } else {
      // Get all contacts
      const contacts = await Contact.find().sort({ createdAt: -1 });

      return Response.json(
        { success: true, data: contacts, total: contacts.length },
        { status: 200 },
      );
    }
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return Response.json(
      { error: "Failed to fetch contacts", details: error.message },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const { turnstileToken, ...data } = await request.json();

    // Verify Turnstile Token to prevent human & bot spam flood attacks
    const isHuman = await verifyTurnstileToken(turnstileToken);
    if (!isHuman) {
      return Response.json(
        { error: "Human verification failed. Please try again." },
        { status: 400 },
      );
    }

    // Validate required fields
    const requiredFields = [
      "fullName",
      "email",
      "phone",
      "course",
      "university",
      "college",
      "semester",
      "message",
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        return Response.json(
          { error: `${field} is required` },
          { status: 400 },
        );
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return Response.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Phone validation
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(data.phone)) {
      return Response.json(
        { error: "Phone must be 10 digits" },
        { status: 400 },
      );
    }

    const Contact = createModel("Contact", ContactModel);

    // Create new contact
    const newContact = new Contact(data);
    await newContact.save();

    // Contact created

    return Response.json(
      {
        success: true,
        message: "Contact saved successfully",
        data: newContact,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating contact:", error);
    return Response.json(
      { error: "Failed to create contact", details: error.message },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    await connectDB();

    // Authenticate Admin only
    const auth = verifyAuth(request, ["Admin"]);
    if (!auth.authenticated) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const url = new URL(request.url);
    const contactId = url.searchParams.get("id");

    if (!contactId) {
      return Response.json(
        { error: "Contact ID is required" },
        { status: 400 },
      );
    }

    const data = await request.json();
    const Contact = createModel("Contact", ContactModel);

    // Update contact
    const updatedContact = await Contact.findByIdAndUpdate(contactId, data, {
      new: true,
      runValidators: true,
    });

    if (!updatedContact) {
      return Response.json({ error: "Contact not found" }, { status: 404 });
    }

    // Contact updated

    return Response.json(
      {
        success: true,
        message: "Contact updated successfully",
        data: updatedContact,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating contact:", error);
    return Response.json(
      { error: "Failed to update contact", details: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    await connectDB();

    // Authenticate Admin only
    const auth = verifyAuth(request, ["Admin"]);
    if (!auth.authenticated) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const url = new URL(request.url);
    const contactId = url.searchParams.get("id");

    if (!contactId) {
      return Response.json(
        { error: "Contact ID is required" },
        { status: 400 },
      );
    }

    const Contact = createModel("Contact", ContactModel);

    // Delete contact
    const deletedContact = await Contact.findByIdAndDelete(contactId);

    if (!deletedContact) {
      return Response.json({ error: "Contact not found" }, { status: 404 });
    }

    // Contact deleted

    return Response.json(
      { success: true, message: "Contact deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting contact:", error);
    return Response.json(
      { error: "Failed to delete contact", details: error.message },
      { status: 500 },
    );
  }
}
