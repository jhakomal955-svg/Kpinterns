"use client";

import React from "react";

export default function PrivacyPolicyPage() {
  const lastUpdated = "June 9, 2026";

  const sections = [
    {
      title: "1. Introduction",
      content:
        "Welcome to KpInterns (operated by KPinterns Pvt Ltd). We value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website (www.kpinterns.com) and use our training, learning, and internship placement services.",
    },
    {
      title: "2. Information We Collect",
      content:
        "We collect personal information that you voluntarily provide to us when you register on our platform, enroll in courses, apply for internships, or communicate with us. This includes: name, email address, phone number, college/university name, degree program, department, current semester/year, registration number, and billing details processed securely via our payment gateways.",
    },
    {
      title: "3. How We Use Your Information",
      content:
        "We use the collected data to manage user accounts, deliver specialized training courses, coordinate internship programs, generate verified credentials (such as offer letters and completion certificates), communicate updates, address support inquiries, and prevent fraudulent transaction activities.",
    },
    {
      title: "4. Document Automation & Security",
      content:
        "When generating training certificates and internship offer letters, we compile your profile details into automated PDF credentials. These documents are securely stored on our servers and Cloudinary storage. Each document is registered with a unique MongoDB Registry ID and QR code to allow employers and institutions to verify authenticity.",
    },
    {
      title: "5. Data Retention & Third Parties",
      content:
        "We do not sell, rent, or trade your personal data to third parties. We only share information with trusted third-party service providers necessary to operate our platform, such as payment processors (Razorpay), secure cloud storage (Cloudinary), and email transactional services (SMTP Nodemailer). All data is protected with industry-standard TLS/SSL encryption.",
    },
    {
      title: "6. Your Privacy Rights",
      content:
        "You have the right to access the personal data stored in your student dashboard, request corrections to incorrect profile data, or inquire about data deletion. For requests related to your data, please contact our support team at info@kpinterns.com.",
    },
  ];

  return (
    <div className="min-h-screen bg-bg-main py-12 px-4 sm:px-8 lg:px-[60px] transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Block */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-main mb-4">
            Privacy Policy
          </h1>
          <p className="text-sm text-text-muted">
            Last Updated: {lastUpdated}
          </p>
        </div>

        {/* Policy Contents Container */}
        <div className="bg-bg-card border border-border-main rounded-2xl p-6 sm:p-10 shadow-sm hover:shadow-md transition-shadow duration-300 space-y-8">
          <p className="text-text-muted leading-relaxed">
            Please read this Privacy Policy carefully. By using the KpInterns portal, you consent to the data collection and usage practices outlined herein.
          </p>

          <div className="space-y-6">
            {sections.map((section, idx) => (
              <div key={idx} className="border-b border-border-main/50 pb-6 last:border-0 last:pb-0">
                <h2 className="text-xl font-bold text-text-main mb-3">
                  {section.title}
                </h2>
                <p className="text-text-muted leading-relaxed whitespace-pre-line">
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-border-main text-center">
            <h3 className="text-lg font-bold text-text-main mb-2">
              Contact Us
            </h3>
            <p className="text-text-muted text-sm">
              If you have any questions about this Privacy Policy, please contact our support at:
            </p>
            <div className="mt-3 flex flex-col sm:flex-row gap-2 justify-center text-sm font-semibold">
              <a href="mailto:info@kpinterns.com" className="text-brand-primary hover:underline">
                info@kpinterns.com
              </a>
              <span className="hidden sm:inline text-text-muted">|</span>
              <a href="mailto:infoKpinterns@gmail.com" className="text-brand-primary hover:underline">
                infoKpinterns@gmail.com
              </a>
            </div>
            <p className="text-xs text-text-muted mt-4">
              KPinterns Pvt Ltd. — Saraswati Nagar Matasgandha Road, Police Line Saharsa, Bihar - 852202
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
