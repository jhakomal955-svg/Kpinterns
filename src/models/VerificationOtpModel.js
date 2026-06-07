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
  verified: {
    type: Boolean,
    default: false,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  verifiedAt: {
    type: Date,
    default: null,
  },
};

module.exports = VerificationOtpModel;
