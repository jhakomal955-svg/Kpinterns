/**
 * Verification OTP Model
 * Represents a verification OTP generated for email registration
 */

const VerificationOtpModel = {
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  expiresAt: {
    type: Date,
    required: true,
    expires: 0, // MongoDB TTL index: automatically deletes document when expired
  },
  verifiedAt: {
    type: Date,
    default: null,
  },
};

export default VerificationOtpModel;
