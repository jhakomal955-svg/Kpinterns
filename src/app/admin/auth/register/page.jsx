"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { universitiesData } from "@/lib/data/universities";

export default function AdminRegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    role: "Admin",
    bio: "",
    agreeTerms: false,
    UniversityName: "",
    CollegeName: "",
    bankDetails: {
      name: "",
      accountNumber: "",
      ifscCode: "",
    },
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const totalSteps = 4;
  const stepTitles = ["Verification", "Admin Details", "Bank Account", "Review"];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
      if (name === "role" && value !== "College Admin") {
        updated.UniversityName = "";
        updated.CollegeName = "";
      } else if (name === "UniversityName") {
        updated.CollegeName = "";
      }
      return updated;
    });

    // Clear error on input change
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (name === "role") {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.UniversityName;
        delete newErrors.CollegeName;
        return newErrors;
      });
    } else if (name === "UniversityName") {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.CollegeName;
        return newErrors;
      });
    }
  };

  const handleBankDetailsChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [name]: value,
      },
    }));

    if (errors[`bank_${name}`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`bank_${name}`];
        return newErrors;
      });
    }
  };

  // Email Verification states
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpVerifyLoading, setOtpVerifyLoading] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpError, setOtpError] = useState("");

  useEffect(() => {
    let timer;
    if (otpCooldown > 0) {
      timer = setTimeout(() => setOtpCooldown(otpCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCooldown]);

  const handleSendOtp = async () => {
    setOtpError("");
    if (!formData.email.trim()) {
      setErrors((prev) => ({ ...prev, email: "Email is required to send OTP" }));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrors((prev) => ({ ...prev, email: "Please enter a valid email address" }));
      return;
    }

    setOtpLoading(true);
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOtpSent(true);
        setOtpCooldown(60);
        alert(data.message || "OTP sent successfully!");
        if (data.otp) {
          console.log(`[DEV ONLY] OTP Code: ${data.otp}`);
        }
      } else {
        setOtpError(data.error || "Failed to send OTP.");
      }
    } catch (err) {
      console.error(err);
      setOtpError("Failed to request OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpError("");
    if (otpInput.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP code");
      return;
    }

    setOtpVerifyLoading(true);
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp: otpInput }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsEmailVerified(true);
        setOtpSent(false);
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.email;
          return newErrors;
        });
      } else {
        setOtpError(data.error || "Invalid OTP code.");
      }
    } catch (err) {
      console.error(err);
      setOtpError("Verification failed. Please try again.");
    } finally {
      setOtpVerifyLoading(false);
    }
  };

  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      // Name validation
      if (!formData.name.trim()) {
        newErrors.name = "Name is required";
      } else if (formData.name.trim().length < 3) {
        newErrors.name = "Name must be at least 3 characters";
      }

      // Email validation
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      } else if (!isEmailVerified) {
        newErrors.email = "Please verify your email address using OTP";
      }
    } else if (step === 2) {
      // Mobile validation
      if (!formData.mobile.trim()) {
        newErrors.mobile = "Mobile number is required";
      } else {
        const cleanedMobile = formData.mobile.replace(/\D/g, "");
        let normalizedMobile = cleanedMobile;
        if (cleanedMobile.length === 12 && cleanedMobile.startsWith("91")) {
          normalizedMobile = cleanedMobile.substring(2);
        } else if (cleanedMobile.length === 11 && cleanedMobile.startsWith("0")) {
          normalizedMobile = cleanedMobile.substring(1);
        }

        if (!/^[6-9]\d{9}$/.test(normalizedMobile)) {
          newErrors.mobile = "Please enter a valid 10-digit Indian mobile number (should start with 6, 7, 8 or 9)";
        } else {
          formData.mobile = normalizedMobile;
        }
      }

      // Password validation
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }

      // Confirm Password validation
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }

      // University & College validation for College Partner
      if (formData.role === "College Admin") {
        if (!formData.UniversityName) {
          newErrors.UniversityName = "University selection is required";
        }
        if (!formData.CollegeName) {
          newErrors.CollegeName = "College selection is required";
        }
      }
    } else if (step === 3) {
      // Bank details validation
      if (!formData.bankDetails.name || formData.bankDetails.name.trim().length < 3) {
        newErrors.bank_name = "Account holder name is required (minimum 3 characters)";
      }
      if (!formData.bankDetails.accountNumber || !/^\d{9,18}$/.test(formData.bankDetails.accountNumber.trim())) {
        newErrors.bank_accountNumber = "A valid account number is required (9-18 digits)";
      }
      if (!formData.bankDetails.ifscCode || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.bankDetails.ifscCode.trim().toUpperCase())) {
        newErrors.bank_ifscCode = "A valid IFSC code is required (e.g. SBIN0001234)";
      }

      // Terms validation
      if (!formData.agreeTerms) {
        newErrors.agreeTerms = "You must agree to the terms and conditions";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validateStep()) {
      setStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep()) {
      return;
    }

    const resolvedUniversityName = formData.role === "College Admin" && formData.UniversityName
      ? (universitiesData[formData.UniversityName]?.name || formData.UniversityName)
      : "";
    const resolvedCollegeName = formData.role === "College Admin" && formData.UniversityName && formData.CollegeName
      ? (universitiesData[formData.UniversityName]?.colleges[formData.CollegeName]?.name || formData.CollegeName)
      : "";

    setIsLoading(true);
    try {
      const response = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          mobile: formData.mobile.replace(/\D/g, ""),
          password: formData.password,
          role: formData.role,
          bio: formData.bio.trim(),
          agreeTerms: formData.agreeTerms,
          UniversityName: resolvedUniversityName,
          CollegeName: resolvedCollegeName,
          bankDetails: {
            name: formData.bankDetails.name.trim(),
            accountNumber: formData.bankDetails.accountNumber.trim(),
            ifscCode: formData.bankDetails.ifscCode.trim().toUpperCase(),
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log("Admin Registration successful");
        setSuccessMessage(
          "Registration successful! Your profile is pending verification. Once verified, you will be able to login.",
        );
        setErrors({});
      } else {
        setErrors({
          submit: data.error || "Registration failed",
          details: data.details,
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrors({ submit: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-main to-bg-main flex items-center justify-center px-4 py-8">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-secondary/5 rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="text-xl font-extrabold tracking-tight text-text-main mb-4">
            <span className="text-bg-main bg-text-main rounded-full p-2">
              Kp
            </span>
            <span className="text-brand-primary">Interns</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-text-main mb-3 font-poppins">
            Admin Register
          </h1>
          <p className="text-lg text-text-muted font-poppins">
            Create your admin account
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {stepTitles.map((title, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    index + 1 <= step
                      ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg"
                      : "bg-bg-card border-2 border-border-main text-text-muted"
                  }`}
                >
                  {index + 1 < step ? (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`text-xs mt-2 font-semibold transition-colors ${index + 1 <= step ? "text-brand-primary" : "text-text-muted"}`}
                >
                  {title}
                </span>
              </div>
            ))}
          </div>

          {/* Progress Line */}
          <div className="h-1 bg-border-main rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary transition-all duration-500"
              style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Register Card */}
        <div className="bg-bg-card rounded-3xl shadow-2xl p-8 border border-border-main backdrop-blur-sm animate-fade-in">
          {successMessage ? (
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-center font-medium font-poppins">
                <div className="text-4xl mb-3">✓</div>
                {successMessage}
              </div>
              <div className="text-center pt-4 border-t border-border-main">
                <Link
                  href="/admin/auth/login"
                  className="px-6 py-3 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl font-bold font-poppins text-sm transition-all inline-block"
                >
                  Go to Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={step < 4 ? handleNext : handleSubmit} className="space-y-5">
              {step === 1 && (
                <div className="space-y-5 animate-fade-in">
                  {/* Name Input */}
                  <div>
                    <label className="block text-sm font-bold text-text-main uppercase tracking-wider mb-3 ml-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className={`w-full px-5 py-4 rounded-xl border-2 transition-all bg-bg-main font-poppins focus:outline-none focus:ring-2 focus:ring-brand-primary/20 ${
                        errors.name
                          ? "border-red-500"
                          : "border-border-main focus:border-brand-primary"
                      }`}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-2 font-medium">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email Input */}
                  <div>
                    <label className="block text-sm font-bold text-text-main uppercase tracking-wider mb-3 ml-1">
                      Email *
                    </label>
                    <div className="space-y-3">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={isEmailVerified}
                        placeholder="Enter your email"
                        className={`w-full px-5 py-4 rounded-xl border-2 transition-all bg-bg-main font-poppins focus:outline-none focus:ring-2 focus:ring-brand-primary/20 ${
                          errors.email
                            ? "border-red-500"
                            : "border-border-main focus:border-brand-primary"
                        } ${isEmailVerified ? "opacity-60 cursor-not-allowed bg-emerald-500/5 border-emerald-500/30" : ""}`}
                      />
                      {!isEmailVerified && (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={otpLoading || otpCooldown > 0}
                          className="w-full py-4 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl font-bold font-poppins text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {otpLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : otpCooldown > 0 ? (
                            `Resend in ${otpCooldown}s`
                          ) : (
                            "Send OTP"
                          )}
                        </button>
                      )}
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-2 font-medium">
                        {errors.email}
                      </p>
                    )}
                    {isEmailVerified && (
                      <p className="text-brand-success text-sm mt-2 font-semibold flex items-center gap-1">
                        <span>✓</span> Email verified successfully!
                      </p>
                    )}
                  </div>

                  {otpSent && !isEmailVerified && (
                    <div className="bg-brand-primary/5 border border-brand-primary/10 rounded-2xl p-5 animate-fade-in space-y-3">
                      <label className="block text-sm font-bold text-text-main uppercase tracking-wider ml-1">
                        Enter Verification Code *
                      </label>
                      <div className="space-y-3">
                        <input
                          type="text"
                          maxLength={6}
                          value={otpInput}
                          onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                          placeholder="Enter 6-digit OTP"
                          className="w-full px-5 py-4 rounded-xl border-2 border-border-main focus:outline-none focus:border-brand-primary bg-bg-main font-mono text-center tracking-widest text-lg font-bold"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={otpInput.length !== 6 || otpVerifyLoading}
                          className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold font-poppins text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {otpVerifyLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            "Verify"
                          )}
                        </button>
                      </div>
                      {otpError && (
                        <p className="text-red-500 text-sm mt-2 font-medium">
                          {otpError}
                        </p>
                      )}
                      <p className="text-text-muted text-xs font-poppins">
                        An OTP code was sent to <span className="font-semibold text-text-main">{formData.email}</span>. Please check your inbox or spam folder.
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold text-lg hover:shadow-2xl hover:shadow-brand-primary/40 transition-all transform hover:scale-105"
                  >
                    Continue
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5 animate-fade-in">
                  {/* Mobile Number Input */}
                  <div>
                    <label className="block text-sm font-bold text-text-main uppercase tracking-wider mb-3 ml-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      placeholder="Enter 10-digit phone number"
                      className={`w-full px-5 py-4 rounded-xl border-2 transition-all bg-bg-main font-poppins focus:outline-none focus:ring-2 focus:ring-brand-primary/20 ${
                        errors.mobile
                          ? "border-red-500"
                          : "border-border-main focus:border-brand-primary"
                      }`}
                    />
                    {errors.mobile && (
                      <p className="text-red-500 text-sm mt-2 font-medium">
                        {errors.mobile}
                      </p>
                    )}
                  </div>

                  {/* Role Selector */}
                  <div>
                    <label className="block text-sm font-bold text-text-main uppercase tracking-wider mb-3 ml-1">
                      Role *
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-5 py-4 rounded-xl border-2 transition-all bg-bg-main font-poppins focus:outline-none focus:ring-2 focus:ring-brand-primary/20 border-border-main focus:border-brand-primary appearance-none"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Employee">Employee</option>
                      <option value="Instructor">Instructor</option>
                      <option value="College Admin">College Partner</option>
                      <option value="Cybercafe Partner">Cybercafe Partner</option>
                    </select>
                  </div>

                  {formData.role === "College Admin" && (
                    <>
                      <div>
                        <label className="block text-sm font-bold text-text-main uppercase tracking-wider mb-3 ml-1">
                          University *
                        </label>
                        <select
                          name="UniversityName"
                          value={formData.UniversityName}
                          onChange={handleInputChange}
                          className={`w-full px-5 py-4 rounded-xl border-2 transition-all bg-bg-main font-poppins focus:outline-none focus:ring-2 focus:ring-brand-primary/20 border-border-main focus:border-brand-primary appearance-none ${
                            errors.UniversityName ? "border-red-500" : ""
                          }`}
                        >
                          <option value="">Select University</option>
                          {Object.entries(universitiesData).map(([key, u]) => (
                            <option key={key} value={key}>
                              {u.name}
                            </option>
                          ))}
                        </select>
                        {errors.UniversityName && (
                          <p className="text-red-500 text-sm mt-2 font-medium">
                            {errors.UniversityName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-text-main uppercase tracking-wider mb-3 ml-1">
                          College *
                        </label>
                        <select
                          name="CollegeName"
                          value={formData.CollegeName}
                          onChange={handleInputChange}
                          disabled={!formData.UniversityName}
                          className={`w-full px-5 py-4 rounded-xl border-2 transition-all bg-bg-main font-poppins focus:outline-none focus:ring-2 focus:ring-brand-primary/20 border-border-main focus:border-brand-primary appearance-none ${
                            errors.CollegeName ? "border-red-500" : ""
                          } ${!formData.UniversityName ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <option value="">
                            {formData.UniversityName ? "Select College" : "Select University first"}
                          </option>
                          {formData.UniversityName &&
                            Object.entries(universitiesData[formData.UniversityName]?.colleges || {}).map(([key, c]) => (
                              <option key={key} value={key}>
                                {c.name}
                              </option>
                            ))}
                        </select>
                        {errors.CollegeName && (
                          <p className="text-red-500 text-sm mt-2 font-medium">
                            {errors.CollegeName}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {/* Bio Input */}
                  <div>
                    <label className="block text-sm font-bold text-text-main uppercase tracking-wider mb-3 ml-1">
                      Bio <span className="text-text-muted font-normal normal-case">(optional)</span>
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Brief description about yourself or your role..."
                      rows={3}
                      className="w-full px-5 py-4 rounded-xl border-2 transition-all bg-bg-main font-poppins focus:outline-none focus:ring-2 focus:ring-brand-primary/20 border-border-main focus:border-brand-primary resize-none"
                    />
                  </div>

                  {/* Password Input */}
                  <div>
                    <label className="block text-sm font-bold text-text-main uppercase tracking-wider mb-3 ml-1">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter your password"
                        className={`w-full px-5 py-4 rounded-xl border-2 transition-all bg-bg-main font-poppins focus:outline-none focus:ring-2 focus:ring-brand-primary/20 ${
                          errors.password
                            ? "border-red-500"
                            : "border-border-main focus:border-brand-primary"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors"
                      >
                        {showPassword ? (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-2 font-medium">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password Input */}
                  <div>
                    <label className="block text-sm font-bold text-text-main uppercase tracking-wider mb-3 ml-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm your password"
                        className={`w-full px-5 py-4 rounded-xl border-2 transition-all bg-bg-main font-poppins focus:outline-none focus:ring-2 focus:ring-brand-primary/20 ${
                          errors.confirmPassword
                            ? "border-red-500"
                            : "border-border-main focus:border-brand-primary"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors"
                      >
                        {showConfirmPassword ? (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-2 font-medium">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex-1 py-4 rounded-xl border-2 border-border-main text-text-main font-semibold hover:bg-bg-main transition-all animate-fade-in"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-4 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold text-lg hover:shadow-2xl hover:shadow-brand-primary/40 transition-all transform hover:scale-105"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5 animate-fade-in">
                  <h2 className="text-xl font-bold text-text-main font-poppins mb-1">
                    Bank Account Details
                  </h2>
                  <p className="text-text-muted text-xs font-poppins mb-4">
                    Enter the bank account details where payments/payouts will be processed.
                  </p>

                  {/* Account Holder Name */}
                  <div>
                    <label className="block text-sm font-bold text-text-main uppercase tracking-wider mb-3 ml-1">
                      Account Holder Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.bankDetails.name}
                      onChange={handleBankDetailsChange}
                      placeholder="Name as in bank account"
                      className={`w-full px-5 py-4 rounded-xl border-2 transition-all bg-bg-main font-poppins focus:outline-none focus:ring-2 focus:ring-brand-primary/20 ${
                        errors.bank_name
                          ? "border-red-500"
                          : "border-border-main focus:border-brand-primary"
                      }`}
                    />
                    {errors.bank_name && (
                      <p className="text-red-500 text-sm mt-2 font-medium">
                        {errors.bank_name}
                      </p>
                    )}
                  </div>

                  {/* Account Number */}
                  <div>
                    <label className="block text-sm font-bold text-text-main uppercase tracking-wider mb-3 ml-1">
                      Account Number *
                    </label>
                    <input
                      type="text"
                      name="accountNumber"
                      value={formData.bankDetails.accountNumber}
                      onChange={handleBankDetailsChange}
                      placeholder="Enter bank account number"
                      className={`w-full px-5 py-4 rounded-xl border-2 transition-all bg-bg-main font-poppins focus:outline-none focus:ring-2 focus:ring-brand-primary/20 ${
                        errors.bank_accountNumber
                          ? "border-red-500"
                          : "border-border-main focus:border-brand-primary"
                      }`}
                    />
                    {errors.bank_accountNumber && (
                      <p className="text-red-500 text-sm mt-2 font-medium">
                        {errors.bank_accountNumber}
                      </p>
                    )}
                  </div>

                  {/* IFSC Code */}
                  <div>
                    <label className="block text-sm font-bold text-text-main uppercase tracking-wider mb-3 ml-1">
                      IFSC Code *
                    </label>
                    <input
                      type="text"
                      name="ifscCode"
                      value={formData.bankDetails.ifscCode}
                      onChange={(e) => {
                        e.target.value = e.target.value.toUpperCase();
                        handleBankDetailsChange(e);
                      }}
                      placeholder="e.g. SBIN0001234"
                      className={`w-full px-5 py-4 rounded-xl border-2 transition-all bg-bg-main font-poppins focus:outline-none focus:ring-2 focus:ring-brand-primary/20 ${
                        errors.bank_ifscCode
                          ? "border-red-500"
                          : "border-border-main focus:border-brand-primary"
                      }`}
                    />
                    {errors.bank_ifscCode && (
                      <p className="text-red-500 text-sm mt-2 font-medium">
                        {errors.bank_ifscCode}
                      </p>
                    )}
                  </div>

                  {/* Terms and Conditions Checkbox */}
                  <label className="flex items-start p-4 rounded-xl border-2 border-border-main hover:border-brand-primary/50 hover:bg-bg-main transition-all cursor-pointer group">
                    <div className="relative flex-shrink-0 w-6 h-6 border-2 border-border-main rounded-lg group-hover:border-brand-primary transition-colors mt-1">
                      <input
                        type="checkbox"
                        name="agreeTerms"
                        checked={formData.agreeTerms}
                        onChange={handleInputChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      {formData.agreeTerms && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-brand-primary"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <span className="ml-3 flex flex-col">
                      <span className="font-semibold text-text-main group-hover:text-brand-primary transition-colors">
                        I agree to the terms and conditions *
                      </span>
                      <span className="text-xs text-text-muted mt-1">
                        By registering, you agree to our privacy policy and terms of
                        service
                      </span>
                    </span>
                  </label>
                  {errors.agreeTerms && (
                    <p className="text-red-500 text-sm font-medium">
                      {errors.agreeTerms}
                    </p>
                  )}

                  {errors.submit && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/50 text-red-600 text-sm font-medium">
                      <p>{errors.submit}</p>
                      {errors.details && (
                        <p className="mt-1 text-xs text-red-500">{errors.details}</p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex-1 py-4 rounded-xl border-2 border-border-main text-text-main font-semibold hover:bg-bg-main transition-all animate-fade-in cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-4 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold text-lg hover:shadow-2xl hover:shadow-brand-primary/40 transition-all transform hover:scale-105 cursor-pointer font-poppins"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6 animate-fade-in">
                  <h2 className="text-xl sm:text-2xl font-bold text-text-main">
                    Review Details
                  </h2>
                  <p className="text-text-muted text-sm">
                    Please review your registration details carefully before completing signup.
                  </p>

                  <div className="bg-bg-main border border-border-main rounded-2xl p-6 space-y-4 text-sm font-poppins">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4">
                      <div>
                        <span className="text-text-muted text-xs block">Full Name</span>
                        <span className="text-text-main font-semibold">{formData.name}</span>
                      </div>
                      <div>
                        <span className="text-text-muted text-xs block">Email</span>
                        <span className="text-text-main font-semibold break-all">{formData.email}</span>
                      </div>
                      <div>
                        <span className="text-text-muted text-xs block">Mobile</span>
                        <span className="text-text-main font-semibold">{formData.mobile}</span>
                      </div>
                      <div>
                        <span className="text-text-muted text-xs block">Requested Role</span>
                        <span className="text-brand-primary font-bold">{formData.role}</span>
                      </div>
                      {formData.role === "College Admin" && (
                        <>
                          <div>
                            <span className="text-text-muted text-xs block">University</span>
                            <span className="text-text-main font-semibold">
                              {universitiesData[formData.UniversityName]?.name || formData.UniversityName}
                            </span>
                          </div>
                          <div>
                            <span className="text-text-muted text-xs block">College</span>
                            <span className="text-text-main font-semibold">
                              {universitiesData[formData.UniversityName]?.colleges[formData.CollegeName]?.name || formData.CollegeName}
                            </span>
                          </div>
                        </>
                      )}
                      {formData.bio && (
                        <div className="sm:col-span-2">
                          <span className="text-text-muted text-xs block">Bio</span>
                          <span className="text-text-main">{formData.bio}</span>
                        </div>
                      )}
                      <div className="sm:col-span-2 border-t border-border-main/50 my-1"></div>
                      <div>
                        <span className="text-text-muted text-xs block">Bank Account Name</span>
                        <span className="text-text-main font-semibold">{formData.bankDetails.name}</span>
                      </div>
                      <div>
                        <span className="text-text-muted text-xs block">Account Number</span>
                        <span className="text-text-main font-semibold">{formData.bankDetails.accountNumber}</span>
                      </div>
                      <div>
                        <span className="text-text-muted text-xs block">IFSC Code</span>
                        <span className="text-text-main font-semibold">{formData.bankDetails.ifscCode}</span>
                      </div>
                    </div>
                  </div>

                  {errors.submit && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/50 text-red-600 text-sm font-medium">
                      <p>{errors.submit}</p>
                      {errors.details && (
                        <p className="mt-1 text-xs text-red-500">{errors.details}</p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex-1 py-4 rounded-xl border-2 border-border-main text-text-main font-semibold hover:bg-bg-main transition-all animate-fade-in cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-4 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold text-lg hover:shadow-2xl hover:shadow-brand-primary/40 transition-all transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none cursor-pointer font-poppins"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Submitting...</span>
                        </div>
                      ) : (
                        "Confirm & Signup"
                      )}
                    </button>
                  </div>
                </div>
              )}
              {/* Login Link */}
              <div className="text-center pt-4 border-t border-border-main">
                <p className="text-text-muted font-poppins">
                  Already have an account?{" "}
                  <Link
                    href="/admin/auth/login"
                    className="text-brand-primary font-bold hover:text-brand-secondary transition-colors"
                  >
                    Login here
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Back to Admin Portal */}
        <div className="text-center mt-6">
          <Link
            href="/admin/auth"
            className="text-text-muted hover:text-text-main font-semibold transition-colors inline-flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Admin Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
