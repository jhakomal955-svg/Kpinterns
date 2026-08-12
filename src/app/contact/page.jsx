"use client";

import { useState, useEffect, useRef } from "react";
import React from "react";
import ScrollReveal from "@/components/ScrollReveal";
import AuthAlertModal from "@/components/AuthAlertModal";
import SuccessAlertModal from "@/components/SuccessAlertModal";
import Turnstile from "@/components/Turnstile";
import Link from "next/link";

export default function ContactPage() {
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    course: "",
    university: "",
    college: "",
    semester: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showAuthAlert, setShowAuthAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const handleFieldInteraction = (e) => {
    // Guest users can interact with form fields freely
  };

  const [contactLeadId, setContactLeadId] = useState("");
  const isCapturingRef = useRef(false);

  useEffect(() => {
    setMounted(true);

    const checkLoginState = () => {
      const userToken = localStorage.getItem("userToken");
      const adminToken = localStorage.getItem("adminToken");
      const loggedInToken = userToken || adminToken;
      
      if (loggedInToken) {
        setIsLoggedIn(true);
        setToken(loggedInToken);
        
        // Auto-populate the form if user/admin details exist
        const userData = localStorage.getItem("userData");
        const adminData = localStorage.getItem("adminData");
        
        try {
          if (userToken && userData) {
            const u = JSON.parse(userData);
            setFormData((prev) => ({
              ...prev,
              fullName: u.fullName || prev.fullName || "",
              email: u.email || prev.email || "",
              phone: u.phone || prev.phone || "",
              course: u.ActiveCources?.[0]?.course?.title || u.degree || prev.course || "",
              university: u.university || prev.university || "",
              college: u.college || prev.college || "",
              semester: u.semester || prev.semester || "",
            }));
          } else if (adminToken && adminData) {
            const a = JSON.parse(adminData);
            setFormData((prev) => ({
              ...prev,
              fullName: a.name || prev.fullName || "",
              email: a.email || prev.email || "",
              phone: a.mobile || prev.phone || "",
            }));
          }
        } catch (e) {
          console.error("Error auto-populating contact form:", e);
        }
      } else {
        setIsLoggedIn(false);
        setToken("");
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          course: "",
          university: "",
          college: "",
          semester: "",
          message: "",
        });
      }
    };

    checkLoginState();
    window.addEventListener("user-login-change", checkLoginState);
    return () => window.removeEventListener("user-login-change", checkLoginState);
  }, []);

  // Background Lead Capture for unregistered visitors filling contact form
  useEffect(() => {
    const hasValidName = (formData.fullName?.trim() || "").length >= 3;
    const hasValidContact = (formData.email?.trim() && formData.email.includes("@")) || (formData.phone?.trim() && formData.phone.trim().length >= 10);
    const hasInput = (hasValidName && hasValidContact) || contactLeadId;
    if (!hasInput) return;

    const timer = setTimeout(() => {
      if (isCapturingRef.current) return;
      isCapturingRef.current = true;

      fetch("/api/leads/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: contactLeadId,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          university: formData.university,
          college: formData.college,
          degree: formData.course,
          semester: formData.semester,
          source: "Contact Form",
        }),
        keepalive: true,
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.leadId && data.leadId !== contactLeadId) {
            setContactLeadId(data.leadId);
          }
        })
        .catch(() => {})
        .finally(() => {
          isCapturingRef.current = false;
        });
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData, contactLeadId, isLoggedIn]);

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.course.trim()) newErrors.course = "Course/Degree is required";
    if (!formData.university.trim())
      newErrors.university = "University is required";
    if (!formData.college.trim())
      newErrors.college = "College name is required";
    if (!formData.semester.trim()) newErrors.semester = "Semester is required";
    if (!formData.message.trim()) newErrors.message = "Message is required";
    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Enforce Turnstile CAPTCHA unless running under automation (E2E tests)
    const isAutomated = typeof navigator !== "undefined" && navigator.webdriver;
    if (!turnstileToken && !isAutomated) {
      alert("Please complete the human verification (CAPTCHA).");
      return;
    }

    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: token ? {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        } : {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ...formData, turnstileToken }),
      });

      if (response.ok) {
        setSubmitted(true);
        setShowSuccessAlert(true);
        setFormData((prev) => ({
          ...prev,
          message: "",
        }));
        setTimeout(() => setSubmitted(false), 5000);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  return (
    <div className="min-h-screen bg-bg-main px-4 sm:px-8 lg:px-[60px] py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <ScrollReveal className="text-center mb-16" direction="fade">
          <h1 className="text-4xl md:text-5xl font-extrabold text-text-main mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Reach out to us via any of these channels or visit our office in
            Patna. We'd love to hear from you!
          </p>
        </ScrollReveal>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Contact Info */}
          <div className="space-y-8">
            {/* Office Info Card */}
            <ScrollReveal direction="up" delay={50}>
              <div className="bg-bg-card border border-border-main rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                    <svg
                      className="h-6 w-6 text-brand-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-text-main mb-2">
                    OUR OFFICE
                  </h3>
                  <p className="text-text-main font-semibold">
                    KPinterns Pvt Ltd.
                  </p>
                  <p className="text-text-main font-semibold">
                     Saraswati Nagar Matasgandha Road
                  </p>
                  <p className="text-text-main font-semibold">
                     Police Line Saharsa Bihar 
                  </p>
                  <p className="text-text-main font-semibold">852202</p>
                </div>
              </div>
            </div>
            </ScrollReveal>

            {/* Call Support Card */}
            <ScrollReveal direction="up" delay={100}>
              <div className="bg-bg-card border border-border-main rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/30">
                    <svg
                      className="h-6 w-6 text-brand-success"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-text-main mb-3">
                    CALL SUPPORT
                  </h3>
                  <div className="space-y-2">
                    <a
                      href="tel:9204312848"
                      className="block text-text-main font-semibold hover:text-brand-primary transition-colors"
                    >
                        9204312848
                    </a>
                    {/* <a
                      href="tel:145678963"
                      className="block text-text-main font-semibold hover:text-brand-primary transition-colors"
                    >
                      0321654987
                    </a> */}
                  </div>
                </div>
              </div>
            </div>
            </ScrollReveal>

            {/* Email Inquiry Card */}
            <ScrollReveal direction="up" delay={150}>
              <div className="bg-bg-card border border-border-main rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                    <svg
                      className="h-6 w-6 text-brand-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-text-main mb-2">
                    EMAIL INQUIRY
                  </h3>
                  <div className="flex flex-col gap-2">
                  <a
                    href="mailto:info@kpinterns.com"
                    className="text-text-main font-semibold hover:text-brand-primary transition-colors"
                  >
                    info@kpinterns.com
                  </a>
                   <a
                    href="mailto:infoKpinterns@gmail.com"
                    className="text-text-main font-semibold hover:text-brand-primary transition-colors"
                  >
                    infoKpinterns@gmail.com
                  </a>
                  </div>
                </div>
              </div>
            </div>
            </ScrollReveal>

            {/* Business Hours Card */}
            <ScrollReveal direction="up" delay={200}>
              <div className="bg-bg-card border border-border-main rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                    <svg
                      className="h-6 w-6 text-brand-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-text-main mb-2">
                    BUSINESS HOURS
                  </h3>
                  <p className="text-text-main font-semibold">
                    Monday - Friday: 9:00 AM - 6:00 PM
                  </p>
                  <p className="text-text-main font-semibold">
                    Saturday: 10:00 AM - 4:00 PM
                  </p>
                  <p className="text-text-main font-semibold">Sunday: Closed</p>
                </div>
              </div>
            </div>
            </ScrollReveal>

            {/* Social media connections links */}
            <div className="bg-bg-card border border-border-main rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-sm font-bold uppercase tracking-wider text-text-main mb-4">Follow us for more updates</h2>
              <div className="flex gap-6 sm:gap-8 items-center flex-wrap">
                <ScrollReveal direction="up" delay={50}>
                  <Link href="https://whatsapp.com/channel/0029VbD99mRDJ6H8VJ0Jc417" target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-[#25D366] transition-colors" title="WhatsApp Channel" aria-label="Follow KP Interns on WhatsApp">
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                  </Link>
                </ScrollReveal>
                <ScrollReveal direction="up" delay={100}>
                  <Link href="https://www.linkedin.com/company/kpinterns.com/" target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-brand-primary transition-colors" title="LinkedIn" aria-label="KP Interns LinkedIn">
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.8v8.37h2.8v-4.67c0-.25.015-.51.09-.69a1.14 1.14 0 0 1 1-.74c.65 0 .8.51.8 1.25v4.85h2.8M7.12 9.49a1.44 1.44 0 1 0-1.44-1.44 1.44 1.44 0 0 0 1.44 1.44m1.39 9.01V10.12H5.73v8.38h2.78z"/></svg>
                  </Link>
                </ScrollReveal>
                <ScrollReveal direction="up" delay={150}>
                  <Link href="https://youtube.com/@kpinterns?si=UOU6cATzGDzYW7zN" target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-brand-primary transition-colors" title="YouTube" aria-label="KP Interns YouTube">
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.377.505 9.377.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  </Link>
                </ScrollReveal>
                <ScrollReveal direction="up" delay={200}>
                  <Link href="https://www.instagram.com/kpinterns020?igsh=a2p3cW9vbnB1ZWU=" target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-brand-primary transition-colors" title="Instagram" aria-label="KP Interns Instagram">
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </Link>
                </ScrollReveal>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <ScrollReveal direction="scale" delay={100} className="h-full">
            <div className="bg-bg-card border border-border-main rounded-2xl p-8 shadow-md h-full">
              {submitted && (
                <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-xl">
                  <div className="flex items-center gap-3">
                    <svg
                      className="h-5 w-5 text-brand-success flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-green-800 dark:text-green-200 font-semibold">
                      Thank you! We'll get back to you soon.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <fieldset 
                  className="space-y-6 border-0 p-0 m-0"
                >
                {/* Full Name Field */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-semibold text-text-main mb-2"
                  >
                    FULL NAME
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className={`w-full px-4 py-3 rounded-lg border bg-bg-main text-text-main placeholder:text-text-muted transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary ${
                      errors.fullName ? "border-red-500" : "border-border-main"
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-text-main mb-2"
                  >
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    className={`w-full px-4 py-3 rounded-lg border bg-bg-main text-text-main placeholder:text-text-muted transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary ${
                      errors.email ? "border-red-500" : "border-border-main"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Phone Number Field */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-semibold text-text-main mb-2"
                  >
                    PHONE NUMBER
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="91XXXXXXXXX"
                    className={`w-full px-4 py-3 rounded-lg border bg-bg-main text-text-main placeholder:text-text-muted transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary ${
                      errors.phone ? "border-red-500" : "border-border-main"
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* Course/Degree Field */}
                <div>
                  <label
                    htmlFor="course"
                    className="block text-sm font-semibold text-text-main mb-2"
                  >
                    COURSE / DEGREE
                  </label>
                  <input
                    type="text"
                    id="course"
                    name="course"
                    value={formData.course}
                    onChange={handleInputChange}
                    placeholder="B.Tech / Diploma / B.A. / B.Sc. / B.Com"
                    className={`w-full px-4 py-3 rounded-lg border bg-bg-main text-text-main placeholder:text-text-muted transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary ${
                      errors.course ? "border-red-500" : "border-border-main"
                    }`}
                  />
                  {errors.course && (
                    <p className="text-red-500 text-sm mt-1">{errors.course}</p>
                  )}
                </div>

                {/* University Field */}
                <div>
                  <label
                    htmlFor="university"
                    className="block text-sm font-semibold text-text-main mb-2"
                  >
                    UNIVERSITY
                  </label>
                  <input
                    type="text"
                    id="university"
                    name="university"
                    value={formData.university}
                    onChange={handleInputChange}
                    placeholder="Patliputra University"
                    className={`w-full px-4 py-3 rounded-lg border bg-bg-main text-text-main placeholder:text-text-muted transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary ${
                      errors.university
                        ? "border-red-500"
                        : "border-border-main"
                    }`}
                  />
                  {errors.university && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.university}
                    </p>
                  )}
                </div>

                {/* College Name Field */}
                <div>
                  <label
                    htmlFor="college"
                    className="block text-sm font-semibold text-text-main mb-2"
                  >
                    COLLEGE NAME
                  </label>
                  <input
                    type="text"
                    id="college"
                    name="college"
                    value={formData.college}
                    onChange={handleInputChange}
                    placeholder="AN College"
                    className={`w-full px-4 py-3 rounded-lg border bg-bg-main text-text-main placeholder:text-text-muted transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary ${
                      errors.college ? "border-red-500" : "border-border-main"
                    }`}
                  />
                  {errors.college && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.college}
                    </p>
                  )}
                </div>

                {/* Semester Field */}
                <div>
                  <label
                    htmlFor="semester"
                    className="block text-sm font-semibold text-text-main mb-2"
                  >
                    SEMESTER
                  </label>
                  <input
                    type="text"
                    id="semester"
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    placeholder="Semester 3 / Year 2"
                    className={`w-full px-4 py-3 rounded-lg border bg-bg-main text-text-main placeholder:text-text-muted transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary ${
                      errors.semester ? "border-red-500" : "border-border-main"
                    }`}
                  />
                  {errors.semester && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.semester}
                    </p>
                  )}
                </div>

                {/* Message Field */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold text-text-main mb-2"
                  >
                    HOW CAN WE HELP?
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Type your message here..."
                    rows="5"
                    className={`w-full px-4 py-3 rounded-lg border bg-bg-main text-text-main placeholder:text-text-muted transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none ${
                      errors.message ? "border-red-500" : "border-border-main"
                    }`}
                  />
                  {errors.message && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.message}
                    </p>
                  )}
                </div>
              </fieldset>

              {/* Human Verification Turnstile */}
              <div className="flex justify-center my-4">
                <Turnstile onSuccess={(token) => setTurnstileToken(token)} theme="dark" />
              </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-brand-primary to-brand-primary/80 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-3"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Sending...
                    </>
                  ) : (mounted && !isLoggedIn) ? (
                    <>
                      <span>Login Required to Send Message</span>
                    </>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>
          </ScrollReveal>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-extrabold text-text-main text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                question: "How long does it take to respond to inquiries?",
                answer:
                  "We typically respond to all inquiries within 24-48 hours during business hours.",
              },
              {
                question: "What are your office hours?",
                answer:
                  "Monday to Friday: 9 AM - 6 PM, Saturday: 10 AM - 4 PM, Sunday: Closed",
              },
              {
                question: "Can I call outside business hours?",
                answer:
                  "Yes, you can call anytime. For urgent matters, please use our emergency line.",
              },
              {
                question: "Do you offer internship opportunities?",
                answer:
                  "Yes! We offer various internship programs. Please contact us for more details.",
              },
            ].map((faq, index) => (
              <ScrollReveal
                key={index}
                direction="up"
                delay={index * 80}
              >
                <div
                  className="bg-bg-card border border-border-main rounded-xl p-6 hover:shadow-md transition-shadow h-full"
                >
                <h3 className="font-semibold text-text-main mb-3 flex items-start gap-3">
                  <span className="text-brand-primary font-bold text-lg mt-0.5">
                    Q
                  </span>
                  {faq.question}
                </h3>
                <p className="text-text-muted leading-relaxed ml-8">
                  {faq.answer}
                </p>
              </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
      <AuthAlertModal isOpen={showAuthAlert} onClose={() => setShowAuthAlert(false)} />
      <SuccessAlertModal 
        isOpen={showSuccessAlert} 
        onClose={() => setShowSuccessAlert(false)} 
        title="Message Sent!"
        message="Thank you! Your message has been sent successfully. We will get back to you soon."
      />
    </div>
  );
}
