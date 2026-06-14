"use client";

import { useState } from "react";
import React from "react";
import ScrollReveal from "@/components/ScrollReveal";

export default function ContactPage() {
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
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Simulate API call
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
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
                      href="tel:1123456"
                      className="block text-text-main font-semibold hover:text-brand-primary transition-colors"
                    >
                        1234567890
                    </a>
                    <a
                      href="tel:145678963"
                      className="block text-text-main font-semibold hover:text-brand-primary transition-colors"
                    >
                      0321654987
                    </a>
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
                    placeholder="B.A. / B.Sc. / BCA"
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

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-brand-primary to-brand-primary/80 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
    </div>
  );
}
