"use client";

import React, { useState } from "react";
import ScrollReveal from "./ScrollReveal.jsx";

const DashboardPreview = () => {
  const [selectedTab, setSelectedTab] = useState("dashboard");

  const tabs = [
    { id: "dashboard", label: "💻 Student Dashboard", desc: "Access lectures, tracks & quizzes" },
    { id: "acceptance", label: "✉️ Acceptance Letter", desc: "Official enrollment confirmation" },
    { id: "certificate", label: "🎉 Verifiable Certificate", desc: "NEP-2020 Credit Framework" },
    { id: "verification", label: "🔍 Verification Portal", desc: "Online credential checking" },
    { id: "content", label: "📚 Detailed Content Support", desc: "Class notes, syllabus & guidelines" },
    { id: "support", label: "💬 24*7 Help & Support", desc: "Mentorship & quick ticket resolution" }
  ];

  const tabContent = {
    dashboard: {
      badge: "Student Panel",
      title: "Your Personal Skill Dashboard",
      description: "Access your personalized workspace to watch class recordings, take evaluations, submit assessments, and check your credit status.",
      image: "/format/User_dashboards.png",
      alt: "Student Profile Dashboard Format",
      features: [
        "View active batch stats and profile info.",
        "Direct link to recordings of past live classes.",
        "Real-time attendance & grade records.",
        "Self-paced assignments and progress tracking."
      ]
    },
    acceptance: {
      badge: "Official Intent",
      title: "Confirmed Internship Enrollment",
      description: "Receive a digitally signed internship acceptance letter immediately after registration, verifying your role and onboarding details.",
      image: "/format/acceptance letter.png",
      alt: "Internship Acceptance Letter Format",
      features: [
        "Includes unique ID, college roll, and domain.",
        "Signed by the authorized company registrar.",
        "Fully recognized for college internship permissions.",
        "Details student onboarding and timeline instructions."
      ]
    },
    certificate: {
      badge: "Verified Credential",
      title: "Academic Credit Endorsed Certificate",
      description: "Earn a professional completion certificate with detailed grade summaries suitable for university credit submission.",
      image: "/format/certificate_format.png",
      alt: "UGC Compliant Verifiable Credit Certificate Format",
      features: [
        "Displays verified Grade Card and score breakdown.",
        "Unique verification number and secure QR seal.",
        "Meets UGC & AICTE curriculum standards.",
        "Direct credit compatibility across universities."
      ]
    },
    verification: {
      badge: "Instant Verification",
      title: "Employer & University Portal Verification",
      description: "Colleges, registrars, and hiring partners can check your certificate's authenticity instantly via our secure search page.",
      image: "/format/verify section.png",
      alt: "Verification Portal Screenshot",
      features: [
        "Instant QR code scan to search records.",
        "Secure database lookup prevents certificate forgery.",
        "Displays verified name, batch, domain, and grade card.",
        "Ensures absolute trust with placement partners."
      ]
    },
    admin: {
      badge: "Institutional Control",
      title: "Multi-Admin & Sub-Admin Panels",
      description: "Empower department heads, registrars, and training coordinators with dedicated sub-admin dashboards to track their specific student batches.",
      image: "/format/Mutiple Admin feature.png",
      alt: "Multiple Admin Support Dashboard",
      features: [
        "Department-specific batch allocation.",
        "Sub-admin profile creation and authorization.",
        "Direct analytics for institution coordinators.",
        "Independent student verify & approval workflow."
      ]
    },
    content: {
      badge: "Syllabus Resource",
      title: "Comprehensive Courseware Repository",
      description: "Access in-depth learning materials, curated notes, syllabus breakdowns, and project submission guidelines straight from your dashboard.",
      image: "/format/detailded instrsnhip.png",
      alt: "Detailed Internship Content Panel",
      features: [
        "Downloadable slide decks and lecture notes.",
        "Topic-wise assignments and challenge tasks.",
        "Project guidelines and submission checklists.",
        "NEP-2020 aligned course curriculum resources."
      ]
    },
    support: {
      badge: "Student Care",
      title: "Around-the-Clock Mentorship Support",
      description: "Connect directly with domain mentors, submit feedback, or raise support tickets anytime to resolve technical problems instantly.",
      image: "/format/support.png",
      alt: "Support and Help Center Screen",
      features: [
        "Direct WhatsApp mentoring group integration.",
        "Raise technical assistance support tickets.",
        "Dedicated live doubt-clearing sessions.",
        "Constant feedback loops on project submissions."
      ]
    }
  };

  return (
    <section className="relative px-4 sm:px-8 lg:px-[60px] py-16 bg-bg-main overflow-hidden border-t border-border-main/40">
      {/* Decorative Ornaments */}
      <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-brand-secondary/15 to-transparent rounded-full blur-3xl -z-10 animate-pulse"></div>

      <div className="mx-auto">
        {/* Section Header */}
        <ScrollReveal className="text-center mb-12" direction="fade">
          <p className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-brand-primary mb-3">
            Product Walkthrough
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-text-main leading-tight mb-4">
            See the{" "}
            <span className="bg-linear-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent bg-300% animate-gradient">
              Learning Experience
            </span>
          </h2>
          <p className="text-base sm:text-lg text-text-muted max-w-2xl mx-auto font-medium">
            Explore the advanced digital dashboard features designed to help you study, practice, and secure certified credits.
          </p>
        </ScrollReveal>

        {/* Accordion List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-start max-w-6xl mx-auto mt-12">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`bg-bg-card border rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 ${
                selectedTab === tab.id
                  ? "border-brand-primary bg-brand-primary/5"
                  : "border-border-main hover:border-brand-primary/40"
              }`}
            >
              {/* Tab Header Button */}
              <button
                onClick={() => setSelectedTab(selectedTab === tab.id ? null : tab.id)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left focus:outline-none group cursor-pointer"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <span className={`text-base sm:text-lg font-black block ${selectedTab === tab.id ? "text-brand-primary" : "text-text-main"}`}>
                    {tab.label}
                  </span>
                  <span className="text-xs text-text-muted mt-1 block font-semibold">
                    {tab.desc}
                  </span>
                </div>

                {/* Chevron Arrow Icon */}
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center text-white transition-all duration-300 group-hover:scale-110">
                  <svg
                    className={`w-5 h-5 transition-transform duration-300 ${
                      selectedTab === tab.id ? "rotate-180" : "rotate-0"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </div>
              </button>

              {/* Expanded Content */}
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  selectedTab === tab.id
                    ? "max-h-[1000px] opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-5 pb-5 pt-0">
                  <div className="border-t border-border-main/50 pt-4 space-y-4">
                    <span className="inline-block bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-lg">
                      {tabContent[tab.id].badge}
                    </span>
                    <h4 className="text-base sm:text-lg font-bold text-text-main">
                      {tabContent[tab.id].title}
                    </h4>
                    <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-semibold">
                      {tabContent[tab.id].description}
                    </p>

                    {/* Bullet Features list */}
                    <ul className="grid grid-cols-1 gap-2 pt-1">
                      {tabContent[tab.id].features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-text-muted font-bold">
                          <span className="text-brand-success text-sm font-black leading-none mt-0.5">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Inline Image Container for Feature */}
                    <div className="mt-4 rounded-xl overflow-hidden border border-border-main/60 bg-white/70 dark:bg-bg-card/50 p-2 shadow-sm">
                      <img
                        src={tabContent[tab.id].image}
                        alt={tabContent[tab.id].alt}
                        className="w-full h-auto object-contain rounded-lg shadow-xs hover:scale-[1.01] transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;
