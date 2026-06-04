/**
 * Contact Model
 * Represents a contact form submission from users
 */

const ContactModel = {
  // Personal Information
  fullName: {
    type: String,
    required: true,
    minlength: 3,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  phone: {
    type: String,
    required: true,
    match: /^\d{10}$/,
  },

  // Academic Information
  course: {
    type: String,
    required: true,
    trim: true,
  },
  university: {
    type: String,
    required: true,
    trim: true,
  },
  college: {
    type: String,
    required: true,
    trim: true,
  },
  semester: {
    type: String,
    required: true,
  },

  // Message
  message: {
    type: String,
    required: true,
    minlength: 10,
    trim: true,
  },

  // Status
  status: {
    type: String,
    enum: ["New", "Reviewed", "Responded", "Closed"],
    default: "New",
  },

  // Metadata
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
};

module.exports = ContactModel;
