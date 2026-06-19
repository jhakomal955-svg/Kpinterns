"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function InstructorCreatePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    role: "Instructor",
    bio: "",
    agreeTerms: true,
    verified: true,
    bankDetails: {
      name: "",
      accountNumber: "",
      ifscCode: "",
    },
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const totalSteps = 3;
  const stepTitles = ["Basic Info", "Security & Details", "Bank Account"];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
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

  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = "Name is required";
      } else if (formData.name.trim().length < 3) {
        newErrors.name = "Name must be at least 3 characters";
      }

      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
    } else if (step === 2) {
      if (!formData.mobile.trim()) {
        newErrors.mobile = "Mobile number is required";
      } else if (!/^\d{10}$/.test(formData.mobile.replace(/\D/g, ""))) {
        newErrors.mobile = "Please enter a valid 10-digit phone number";
      }

      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    } else if (step === 3) {
      if (!formData.bankDetails.name || formData.bankDetails.name.trim().length < 3) {
        newErrors.bank_name = "Account holder name is required (minimum 3 characters)";
      }
      if (!formData.bankDetails.accountNumber || !/^\d{9,18}$/.test(formData.bankDetails.accountNumber.trim())) {
        newErrors.bank_accountNumber = "A valid account number is required (9-18 digits)";
      }
      if (!formData.bankDetails.ifscCode || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.bankDetails.ifscCode.trim().toUpperCase())) {
        newErrors.bank_ifscCode = "A valid IFSC code is required (e.g. SBIN0001234)";
      }

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
    if (!validateStep()) return;

    setIsLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
      const response = await fetch("/api/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          mobile: formData.mobile.replace(/\D/g, ""),
          password: formData.password,
          role: "Instructor",
          bio: formData.bio.trim(),
          agreeTerms: formData.agreeTerms,
          verified: true, // Auto-verified
          isAdminCreation: true, // Bypasses email verification OTP checks
          bankDetails: {
            name: formData.bankDetails.name.trim(),
            accountNumber: formData.bankDetails.accountNumber.trim(),
            ifscCode: formData.bankDetails.ifscCode.trim().toUpperCase(),
          },
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert("Instructor account created successfully!");
        router.push("/admin/auth/dashboard/instructor");
      } else {
        setErrors({
          submit: data.error || "Creation failed",
          details: data.details,
        });
      }
    } catch (error) {
      console.error("Creation error:", error);
      setErrors({ submit: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-main font-poppins">
            Add New Instructor
          </h1>
          <p className="text-text-muted text-sm sm:text-base">
            Create a new platform instructor account with instant verification.
          </p>
        </div>
        <Link
          href="/admin/auth/dashboard/instructor"
          className="inline-flex items-center justify-center rounded-xl border border-border-main bg-bg-card px-4 py-2 text-sm font-semibold text-text-main hover:border-brand-primary hover:text-brand-primary transition"
        >
          Back to Instructors
        </Link>
      </div>

      {/* Progress Bar */}
      <div className="bg-bg-card border-2 border-border-main rounded-2xl p-5 shadow-sm">
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

      {/* Form Card */}
      <div className="bg-bg-card rounded-3xl shadow-xl p-6 sm:p-10 border border-border-main">
        <form onSubmit={step < 3 ? handleNext : handleSubmit} className="space-y-5">
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-xl font-bold text-text-main">Basic Details</h2>
              {/* Name Input */}
              <div>
                <label className="block text-xs font-bold text-text-main uppercase tracking-wider mb-2.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter instructor's name"
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main font-poppins focus:outline-none focus:ring-2 focus:ring-brand-primary/20 ${
                    errors.name
                      ? "border-red-500"
                      : "border-border-main focus:border-brand-primary"
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-2 font-medium">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-xs font-bold text-text-main uppercase tracking-wider mb-2.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter instructor's email"
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main font-poppins focus:outline-none focus:ring-2 focus:ring-brand-primary/20 ${
                    errors.email
                      ? "border-red-500"
                      : "border-border-main focus:border-brand-primary"
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-2 font-medium">
                    {errors.email}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold text-base hover:shadow-lg hover:shadow-brand-primary/30 transition-all transform hover:scale-[1.02]"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-xl font-bold text-text-main">Account Details & Credentials</h2>
              
              {/* Mobile Number Input */}
              <div>
                <label className="block text-xs font-bold text-text-main uppercase tracking-wider mb-2.5">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  placeholder="Enter 10-digit phone number"
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main font-poppins focus:outline-none focus:ring-2 focus:ring-brand-primary/20 ${
                    errors.mobile
                      ? "border-red-500"
                      : "border-border-main focus:border-brand-primary"
                  }`}
                />
                {errors.mobile && (
                  <p className="text-red-500 text-xs mt-2 font-medium">
                    {errors.mobile}
                  </p>
                )}
              </div>

              {/* Bio Input */}
              <div>
                <label className="block text-xs font-bold text-text-main uppercase tracking-wider mb-2.5">
                  Bio <span className="text-text-muted font-normal normal-case">(optional)</span>
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Brief description about the instructor's background or course specialties..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main font-poppins focus:outline-none focus:border-brand-primary border-border-main resize-none"
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-bold text-text-main uppercase tracking-wider mb-2.5">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter password (minimum 6 characters)"
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main font-poppins focus:outline-none focus:ring-2 focus:ring-brand-primary/20 ${
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
                    {showPassword ? "👁️" : "🙈"}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-2 font-medium">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="block text-xs font-bold text-text-main uppercase tracking-wider mb-2.5">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main font-poppins focus:outline-none focus:ring-2 focus:ring-brand-primary/20 ${
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
                    {showConfirmPassword ? "👁️" : "🙈"}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-2 font-medium">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 py-3 rounded-xl border-2 border-border-main text-text-main font-semibold hover:bg-bg-main transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold text-base hover:shadow-lg hover:shadow-brand-primary/30 transition-all transform hover:scale-[1.02]"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-xl font-bold text-text-main">Bank Account Details</h2>
              <p className="text-text-muted text-xs font-poppins">
                Enter bank details to complete manual Instructor registration.
              </p>

              {/* Account Holder Name */}
              <div>
                <label className="block text-xs font-bold text-text-main uppercase tracking-wider mb-2.5">
                  Account Holder Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.bankDetails.name}
                  onChange={handleBankDetailsChange}
                  placeholder="Enter name as in bank records"
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main font-poppins focus:outline-none focus:ring-2 focus:ring-brand-primary/20 ${
                    errors.bank_name ? "border-red-500" : "border-border-main focus:border-brand-primary"
                  }`}
                />
                {errors.bank_name && (
                  <p className="text-red-500 text-xs mt-2 font-medium">
                    {errors.bank_name}
                  </p>
                )}
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-xs font-bold text-text-main uppercase tracking-wider mb-2.5">
                  Account Number *
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.bankDetails.accountNumber}
                  onChange={handleBankDetailsChange}
                  placeholder="Enter account number"
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main font-poppins focus:outline-none focus:ring-2 focus:ring-brand-primary/20 ${
                    errors.bank_accountNumber ? "border-red-500" : "border-border-main focus:border-brand-primary"
                  }`}
                />
                {errors.bank_accountNumber && (
                  <p className="text-red-500 text-xs mt-2 font-medium">
                    {errors.bank_accountNumber}
                  </p>
                )}
              </div>

              {/* IFSC Code */}
              <div>
                <label className="block text-xs font-bold text-text-main uppercase tracking-wider mb-2.5">
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
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main font-poppins focus:outline-none focus:ring-2 focus:ring-brand-primary/20 ${
                    errors.bank_ifscCode ? "border-red-500" : "border-border-main focus:border-brand-primary"
                  }`}
                />
                {errors.bank_ifscCode && (
                  <p className="text-red-500 text-xs mt-2 font-medium">
                    {errors.bank_ifscCode}
                  </p>
                )}
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start p-4 rounded-xl border-2 border-border-main hover:border-brand-primary/50 hover:bg-bg-main transition-all cursor-pointer group">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded accent-brand-primary cursor-pointer mt-1 flex-shrink-0"
                />
                <span className="ml-3 flex flex-col">
                  <span className="font-semibold text-text-main group-hover:text-brand-primary transition-colors text-sm">
                    Confirm Terms & Conditions
                  </span>
                  <span className="text-xs text-text-muted mt-1">
                    Accept credentials creation for this instructor account.
                  </span>
                </span>
              </label>
              {errors.agreeTerms && (
                <p className="text-red-500 text-xs font-medium mt-1">
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

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 py-3 rounded-xl border-2 border-border-main text-text-main font-semibold hover:bg-bg-main transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold text-base hover:shadow-lg hover:shadow-brand-primary/30 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating...</span>
                    </div>
                  ) : (
                    "Register Instructor"
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
