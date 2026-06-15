"use client";

import React, { useState } from "react";
import ScrollReveal from "./ScrollReveal.jsx";

const DashboardPreview = () => {
  const [selectedTab, setSelectedTab] = useState("dashboard");

  const tabs = [
    { id: "dashboard", label: "💻 Student Dashboard", desc: "Access lectures, tracks & quizzes" },
    { id: "acceptance", label: "✉️ Acceptance Letter", desc: "Official enrollment confirmation" },
    { id: "certificate", label: "🎉 Verifiable Certificate", desc: "NEP-2020 Credit Framework" },
    { id: "verification", label: "🔍 Verification Portal", desc: "Online credential checking" }
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

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mt-12">
          {/* Left: Tab Selectors & Features Info (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Custom Tab buttons */}
            <div className="space-y-2.5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all duration-300 flex items-start gap-4 hover:-translate-y-0.5 cursor-pointer ${
                    selectedTab === tab.id
                      ? "bg-bg-card border-brand-primary shadow-lg"
                      : "bg-transparent border-transparent hover:bg-bg-card/40 hover:border-border-main/50"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm sm:text-base font-black ${selectedTab === tab.id ? "text-brand-primary" : "text-text-main"}`}>
                      {tab.label}
                    </span>
                  </div>
                  {selectedTab === tab.id && (
                    <span className="text-brand-primary font-black text-lg self-center">➔</span>
                  )}
                </button>
              ))}
            </div>

            {/* Selected Tab Description card */}
            <div className="p-6 bg-bg-card border border-border-main/60 rounded-2xl shadow-md space-y-4">
              <span className="bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
                {tabContent[selectedTab].badge}
              </span>
              <h3 className="text-xl font-bold text-text-main">
                {tabContent[selectedTab].title}
              </h3>
              <p className="text-sm text-text-muted leading-relaxed font-semibold">
                {tabContent[selectedTab].description}
              </p>

              {/* Bullet Features list */}
              <ul className="space-y-2.5 pt-2">
                {tabContent[selectedTab].features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-text-muted font-bold">
                    <span className="text-brand-success text-sm font-black mt-0.5">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: High-Fidelity Image Container (7 Cols) */}
          <div className="lg:col-span-7 h-full flex flex-col justify-center">
            {/* Mock browser container */}
            <div className="w-full bg-bg-card border-4 border-border-main rounded-3xl shadow-2xl overflow-hidden aspect-[4/3] flex flex-col">
              {/* Browser top-bar */}
              <div className="bg-bg-main px-4 py-3 border-b border-border-main/50 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-400"></span>
                  <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                  <span className="w-3 h-3 rounded-full bg-green-400"></span>
                </div>
                <div className="bg-bg-card border border-border-main/40 rounded-lg text-[10px] font-bold text-text-muted/70 px-8 py-1 truncate max-w-[220px] text-center select-none shadow-sm">
                  kpinterns.in/format/{selectedTab}
                </div>
                <div className="w-10"></div>
              </div>

              {/* Browser Viewport - Renders the real upload image */}
              <div className="flex-1 p-3 bg-bg-main relative flex flex-col justify-center items-center overflow-hidden">
                <div className="w-full h-full relative rounded-xl overflow-hidden bg-white/80 dark:bg-bg-card/40 border border-border-main/40 p-2 flex items-center justify-center">
                  <img
                    src={tabContent[selectedTab].image}
                    alt={tabContent[selectedTab].alt}
                    className="max-h-full max-w-full object-contain rounded-lg shadow-md hover:scale-[1.02] transition-transform duration-500 select-none"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;
