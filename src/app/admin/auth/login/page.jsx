"use client";

import { useState } from "react";
import Link from "next/link";
import Turnstile from "@/components/Turnstile";
import InvalidEmailModal, { validateEmailFormat } from "@/components/InvalidEmailModal";

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
  });
  const [turnstileToken, setTurnstileToken] = useState("");

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showInvalidEmailModal, setShowInvalidEmailModal] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error on input change
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailOrPhone = formData.emailOrPhone.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneDigits = emailOrPhone.replace(/\D/g, "");
    const phoneRegex = /^\d{10}$/;

    if (!emailOrPhone) {
      newErrors.emailOrPhone = "Email or phone number is required";
    } else if (emailOrPhone.includes("@")) {
      if (!validateEmailFormat(emailOrPhone)) {
        newErrors.emailOrPhone = "Please enter a valid email address";
        setShowInvalidEmailModal(true);
      }
    } else {
      if (!phoneRegex.test(phoneDigits)) {
        newErrors.emailOrPhone = "Please enter a valid 10-digit phone number";
      }
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!turnstileToken) {
      newErrors.verifyHuman = "Please verify you are human";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailOrPhone: formData.emailOrPhone,
          password: formData.password,
          turnstileToken: turnstileToken,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.data && data.data.verified === false) {
          setErrors({
            submit:
              "Your profile is not verified yet. Once verified, you will be able to login.",
          });
          return;
        }

        localStorage.setItem("adminToken", data.token || "token-" + Date.now());
        localStorage.setItem("adminData", JSON.stringify(data.data));
        console.log("Admin Login successful:", data.data);
        // Redirect to appropriate dashboard based on role
        if (data.data && data.data.role === "Instructor") {
          window.location.href = "/admin/auth/instructors";
        } else if (data.data && data.data.role === "College Admin") {
          window.location.href = "/admin/auth/college-admin";
        } else if (data.data && data.data.role === "Cybercafe Partner") {
          window.location.href = "/admin/auth/cybercafe-partner";
        } else {
          window.location.href = "/admin/auth/dashboard";
        }
      } else {
        setErrors({ submit: data.error || "Login failed" });
      }
    } catch (error) {
      console.error("Login error:", error);
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
            Admin Login
          </h1>
          <p className="text-lg text-text-muted font-poppins">
            Access the admin control panel
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-bg-card rounded-3xl shadow-2xl p-8 border border-border-main backdrop-blur-sm animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email or Phone Input */}
            <div>
              <label className="block text-sm font-bold text-text-main uppercase tracking-wider mb-3 ml-1">
                Email or Phone Number
              </label>
              <input
                type="text"
                name="emailOrPhone"
                value={formData.emailOrPhone}
                onChange={handleInputChange}
                placeholder="Email or 10-digit phone"
                className={`w-full px-5 py-4 rounded-xl border-2 transition-all bg-bg-main font-poppins focus:outline-none focus:ring-2 focus:ring-brand-primary/20 ${
                  errors.emailOrPhone
                    ? "border-red-500"
                    : "border-border-main focus:border-brand-primary"
                }`}
              />
              {errors.emailOrPhone && (
                <p className="text-red-500 text-sm mt-2 font-medium">
                  {errors.emailOrPhone}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-bold text-text-main uppercase tracking-wider ml-1">
                  Password
                </label>
                <Link
                  href="/admin/auth/forgot-password"
                  className="text-sm font-bold text-brand-primary hover:text-brand-secondary transition-colors"
                >
                  FORGOT?
                </Link>
              </div>
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

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/50">
                <p className="text-red-500 text-sm font-medium">
                  {errors.submit}
                </p>
              </div>
            )}

            {/* Verify Human Cloudflare Turnstile */}
            <div>
              <Turnstile onSuccess={(token) => setTurnstileToken(token)} theme="dark" />
              {errors.verifyHuman && (
                <p className="text-red-500 text-sm mt-2 font-medium text-center">
                  {errors.verifyHuman}
                </p>
              )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold text-lg hover:shadow-2xl hover:shadow-brand-primary/40 transition-all transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Logging in...</span>
                </div>
              ) : (
                "Admin Login"
              )}
            </button>

            {/* Register Link */}
            <div className="text-center pt-4 border-t border-border-main">
              <p className="text-text-muted font-poppins">
                New admin?{" "}
                <Link
                  href="/admin/auth/register"
                  className="text-brand-primary font-bold hover:text-brand-secondary transition-colors"
                >
                  Register here
                </Link>
              </p>
            </div>
          </form>
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
      <InvalidEmailModal
        isOpen={showInvalidEmailModal}
        onClose={() => setShowInvalidEmailModal(false)}
        emailEntered={formData.emailOrPhone}
      />
    </div>
  );
}
