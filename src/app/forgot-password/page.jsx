"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UserForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    emailOrPhone: "",
    registrationNumber: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [testOtp, setTestOtp] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.emailOrPhone.trim()) {
      newErrors.emailOrPhone = "Email or phone number is required";
    }
    if (!formData.registrationNumber.trim()) {
      newErrors.registrationNumber = "Registration number is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/user/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailOrPhone: formData.emailOrPhone,
          registrationNumber: formData.registrationNumber,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.otp) {
          setTestOtp(data.otp);
        }
        setStep(2);
      } else {
        setErrors({ submit: data.error || "Verification failed." });
      }
    } catch (err) {
      console.error(err);
      setErrors({ submit: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (!formData.otp.trim()) {
      setErrors({ otp: "OTP code is required" });
      return;
    }
    if (formData.otp.trim().length !== 6) {
      setErrors({ otp: "OTP must be exactly 6 digits" });
      return;
    }
    setStep(3);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/user/forgot-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailOrPhone: formData.emailOrPhone,
          otp: formData.otp,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Your password has been successfully reset! Redirecting to login...");
        router.push("/login");
      } else {
        setErrors({ submit: data.error || "Failed to reset password." });
      }
    } catch (err) {
      console.error(err);
      setErrors({ submit: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-main to-bg-main flex items-center justify-center px-4 py-8">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-secondary/5 rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-md">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="text-xl font-extrabold tracking-tight text-text-main mb-4">
            <span className="text-bg-main bg-text-main rounded-full p-2">Kp</span>
            <span className="text-brand-primary">Interns</span>
          </div>
          <h1 className="text-4xl font-bold text-text-main mb-2 font-poppins">
            Reset Password
          </h1>
          <p className="text-text-muted font-poppins">
            Student Password Recovery
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-bg-card rounded-3xl shadow-2xl p-8 border border-border-main backdrop-blur-sm animate-fade-in">
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-semibold">
              ⚠️ {errors.submit}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-6">
              <p className="text-sm text-text-muted mb-4">
                Please enter your registered Email/Phone and Registration Number to verify your identity.
              </p>

              <div>
                <label className="block text-sm font-bold text-text-main uppercase tracking-wider mb-3 ml-1">
                  Email or Phone Number
                </label>
                <input
                  type="text"
                  name="emailOrPhone"
                  value={formData.emailOrPhone}
                  onChange={handleInputChange}
                  placeholder="Enter email or phone"
                  className={`w-full px-5 py-4 rounded-xl border-2 transition-all bg-bg-main font-poppins focus:outline-none focus:ring-2 focus:ring-brand-primary/20 ${
                    errors.emailOrPhone ? "border-red-500" : "border-border-main focus:border-brand-primary"
                  }`}
                />
                {errors.emailOrPhone && (
                  <p className="text-red-500 text-sm mt-2 font-medium">{errors.emailOrPhone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-text-main uppercase tracking-wider mb-3 ml-1">
                  Registration Number
                </label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleInputChange}
                  placeholder="Enter registration number"
                  className={`w-full px-5 py-4 rounded-xl border-2 transition-all bg-bg-main font-poppins focus:outline-none focus:ring-2 focus:ring-brand-primary/20 ${
                    errors.registrationNumber ? "border-red-500" : "border-border-main focus:border-brand-primary"
                  }`}
                />
                {errors.registrationNumber && (
                  <p className="text-red-500 text-sm mt-2 font-medium">{errors.registrationNumber}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold text-lg hover:shadow-2xl hover:shadow-brand-primary/40 transition-all transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? "Verifying..." : "Continue"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <p className="text-sm text-text-muted mb-4">
                A 6-digit OTP has been generated for verification. Enter it below.
              </p>

              {testOtp && (
                <div className="p-4 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary rounded-xl text-sm font-bold">
                  ℹ️ Testing Mode: Use OTP <span className="underline">{testOtp}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-text-main uppercase tracking-wider mb-3 ml-1">
                  Verification Code (OTP)
                </label>
                <input
                  type="text"
                  name="otp"
                  maxLength="6"
                  value={formData.otp}
                  onChange={handleInputChange}
                  placeholder="Enter 6-digit OTP"
                  className={`w-full px-5 py-4 text-center tracking-widest text-lg font-bold rounded-xl border-2 transition-all bg-bg-main focus:outline-none focus:ring-2 focus:ring-brand-primary/20 ${
                    errors.otp ? "border-red-500" : "border-border-main focus:border-brand-primary"
                  }`}
                />
                {errors.otp && (
                  <p className="text-red-500 text-sm mt-2 font-medium">{errors.otp}</p>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 rounded-xl border-2 border-border-main text-text-main font-semibold hover:bg-bg-main transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold text-lg hover:shadow-2xl hover:shadow-brand-primary/40 transition-all transform hover:scale-105"
                >
                  Verify
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <p className="text-sm text-text-muted mb-4">
                Enter your new password. Must be at least 6 characters long.
              </p>

              <div>
                <label className="block text-sm font-bold text-text-main uppercase tracking-wider mb-3 ml-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="Enter new password"
                    className={`w-full px-5 py-4 rounded-xl border-2 transition-all bg-bg-main font-poppins focus:outline-none focus:ring-2 focus:ring-brand-primary/20 ${
                      errors.newPassword ? "border-red-500" : "border-border-main focus:border-brand-primary"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main"
                  >
                    {showPassword ? "👁️" : "🙈"}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-red-500 text-sm mt-2 font-medium">{errors.newPassword}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-text-main uppercase tracking-wider mb-3 ml-1">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm new password"
                  className={`w-full px-5 py-4 rounded-xl border-2 transition-all bg-bg-main font-poppins focus:outline-none focus:ring-2 focus:ring-brand-primary/20 ${
                    errors.confirmPassword ? "border-red-500" : "border-border-main focus:border-brand-primary"
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-2 font-medium">{errors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold text-lg hover:shadow-2xl hover:shadow-brand-primary/40 transition-all transform hover:scale-105 disabled:opacity-70"
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

          <div className="text-center pt-6 mt-6 border-t border-border-main">
            <Link
              href="/login"
              className="text-brand-primary font-bold hover:text-brand-secondary transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
