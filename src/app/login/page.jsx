"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
    verifyHuman: false, // Changed from rememberMe to match the input name
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    const input = formData.emailOrPhone.trim();

    if (!input) {
      newErrors.emailOrPhone = "Email or phone number is required";
    } else {
      // 1. Separate checks for Email vs Phone to avoid stripping characters prematurely
      const isEmail = input.includes("@");
      
      if (isEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input)) {
          newErrors.emailOrPhone = "Please enter a valid email address";
        }
      } else {
        // Strip non-digits ONLY for phone number evaluation
        const cleanPhone = input.replace(/\D/g, "");
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(cleanPhone)) {
          newErrors.emailOrPhone = "Please enter a valid 10-digit phone number";
        }
      }
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Optional: Ensure they checked the human verification box
    if (!formData.verifyHuman) {
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
      const response = await fetch("/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailOrPhone: formData.emailOrPhone,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("userToken", data.token);
        localStorage.setItem("userData", JSON.stringify(data.data));
        window.dispatchEvent(new Event("user-login-change"));
        router.push("/profile");
      } else {
        alert(data.error || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred during login. Please try again.");
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
            <span className="text-bg-main bg-text-main rounded-full p-2">Kp</span>
            <span className="text-brand-primary">Interns</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-text-main mb-3 font-poppins">
            Student sign-in
          </h1>
          <p className="text-lg text-text-muted font-poppins">
            For enrolled students (intern dashboard)
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
                  href="/forgot-password"
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

            {/* Verify Human Checkbox */}
            <div>
              <label className="flex items-center p-4 rounded-xl border-2 border-border-main hover:border-brand-primary/50 hover:bg-bg-main transition-all cursor-pointer group">
                <div className="relative flex-shrink-0 w-6 h-6 border-2 border-border-main rounded group-hover:border-brand-primary transition-colors flex items-center justify-center">
                  <input
                    type="checkbox"
                    name="verifyHuman"
                    checked={formData.verifyHuman}
                    onChange={handleInputChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {/* Clean custom checkmark layout */}
                  {formData.verifyHuman && (
                    <svg
                      className="w-4 h-4 text-brand-primary"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <span className="ml-3 flex items-center justify-between flex-1">
                  <span className="font-semibold text-text-main group-hover:text-brand-primary transition-colors">
                    Verify you are human
                  </span>
                  <span className="text-xs font-bold px-3 py-1 bg-text-main/10 text-text-muted rounded-full group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-colors">
                    🔒 PROTECTED
                  </span>
                </span>
              </label>
              {errors.verifyHuman && (
                <p className="text-red-500 text-sm mt-2 font-medium ml-1">
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
                "Login"
              )}
            </button>

            {/* Register Link */}
            <div className="text-center pt-4 border-t border-border-main">
              <p className="text-text-muted font-poppins">
                New user?{" "}
                <Link
                  href="/register"
                  className="text-brand-primary font-bold hover:text-brand-secondary transition-colors"
                >
                  Register here
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Additional Security Info */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center mb-2">
              <svg
                className="w-5 h-5 text-green-500"
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
            <span className="text-xs font-semibold text-text-muted">Secure</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mb-2">
              <svg
                className="w-5 h-5 text-blue-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.951-1.429 5.951 1.429a1 1 0 001.169-1.409l-7-14z" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-text-muted">Fast</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center mb-2">
              <svg
                className="w-5 h-5 text-purple-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M13 7H7v6h6V7z" />
                <path
                  fillRule="evenodd"
                  d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2V2a1 1 0 112 0v1a2 2 0 012 2v2h1a2 2 0 110 4h-1v2h1a2 2 0 110 4h-1v2a2 2 0 01-2 2v1a1 1 0 11-2 0v-1h-2v1a1 1 0 11-2 0v-1h-2v1a1 1 0 11-2 0v-1a2 2 0 01-2-2v-2H3a2 2 0 110-4h1V9H3a2 2 0 110-4h1V3a2 2 0 012-2v1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-xs font-semibold text-text-muted">
              Verified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}