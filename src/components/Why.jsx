"use client";

import React, { useState } from "react";
import ScrollReveal from "./ScrollReveal.jsx";

const Why = () => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const features = [
    {
      id: 1,
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      title: "UGC & NEP-2020 Compliant",
      description:
        "Our curriculum is structured under CBCS / CCFUP guidelines with 4 academic credits, recognized across Bihar universities.",
      color: "from-blue-500 to-blue-600",
      lightColor: "from-blue-50 to-blue-100/50"
    },
    {
      id: 2,
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4l3 2m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: "120-Hour Programme",
      description:
        "Structured training with live classes, comprehensive notes, and interactive quizzes — all tracked in your personal student dashboard.",
      color: "from-cyan-500 to-teal-600",
      lightColor: "from-cyan-50 to-teal-100/50",
    },
    {
      id: 3,
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: "Verifiable Certificates",
      description:
        "Every certificate has a unique ID and QR code. Employers can verify it instantly on our portal — no fakes possible.",
      color: "from-orange-500 to-red-600",
      lightColor: "from-orange-50 to-red-100/50",
    },
    {
      id: 4,
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      ),
      title: "Affordable Fee",
      description:
        "Transparent pricing (₹400-₹500) with special discounts for BNMU and Purnea University students.",
      color: "from-purple-500 to-indigo-600",
      lightColor: "from-purple-50 to-indigo-100/50",
    },
    {
      id: 5,
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      ),
      title: "100% Online & Flexible",
      description:
        "Attend classes on Google Meet from your phone. Access recordings and study materials anytime, anywhere.",
      color: "from-pink-500 to-rose-600",
      lightColor: "from-pink-50 to-rose-100/50",
    },
    {
      id: 6,
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM15 20H9m6 0h.01"
          />
        </svg>
      ),
      title: "Dedicated Mentor Support",
      description:
        "Assigned domain mentors guide you via WhatsApp and live sessions. Get personalized feedback on all your assessments.",
      color: "from-indigo-500 to-purple-600",
      lightColor: "from-indigo-50 to-purple-100/50",
    },
  ];

  return (
    <section className="relative px-4 sm:px-8 lg:px-[60px] py-8  bg-bg-main overflow-hidden">
      {/* Animated background gradient elements */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] lg:w-[600px] lg:h-[600px] bg-gradient-to-br from-brand-primary/15 to-transparent rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div
        className="absolute bottom-0 left-0 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] lg:w-[600px] lg:h-[600px] bg-gradient-to-tr from-brand-secondary/15 to-transparent rounded-full blur-3xl -z-10 animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>

      {/* Header Section */}
      <div className="text-center mb-6 animate-fade-in mx-auto">
      
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-text-main mb-4 sm:mb-6 leading-[1.2]">
          Designed for
          <br />
          <span className="bg-linear-to-r from-brand-primary via-brand-secondary to-brand-primary bg-clip-text text-transparent bg-300% animate-gradient">
            Indian UG Students
          </span>
        </h2>

        <p className="text-base sm:text-lg md:text-xl text-text-muted max-w-2xl mx-auto leading-relaxed font-medium opacity-90">
          We understand the local university ecosystem and have built a
          programme that truly fits your academic calendar and needs.
        </p>
      </div>

      {/* Features Grid */}
      <div className="mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <ScrollReveal
              key={feature.id}
              className="group relative"
              direction="up"
              delay={index * 80}
              onMouseEnter={() => setHoveredCard(feature.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Card Container */}
              <div
                className={`relative h-full bg-bg-card border border-border-main rounded-2xl p-6 sm:p-8 transition-all duration-300 overflow-hidden ${
                  hoveredCard === feature.id
                    ? "border-brand-primary/50 shadow-2xl -translate-y-2"
                    : "shadow-lg hover:shadow-xl hover:border-brand-primary/30"
                }`}
              >
                {/* Gradient Background on Hover */}
                <div
                  className={``}
                ></div>

                

                {/* Icon Circle */}
                <div
                  className={`inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${feature.color} text-white mb-4 sm:mb-6 shadow-lg transition-all duration-300 ${
                    hoveredCard === feature.id
                      ? "scale-110 shadow-2xl"
                      : "group-hover:scale-105"
                  }`}
                >
                  {feature.icon}
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-xl sm:text-2xl font-bold text-text-main mb-3 transition-colors duration-300 group-hover:text-brand-primary">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-text-muted leading-relaxed line-clamp-4 group-hover:line-clamp-none transition-all duration-300">
                    {feature.description}
                  </p>
                </div>

                {/* Hover Arrow */}
                <div
                  className={`absolute bottom-4 sm:bottom-6 right-4 sm:right-6 text-brand-primary/40 transition-all duration-300 transform ${
                    hoveredCard === feature.id
                      ? "translate-x-2 -translate-y-2 text-brand-primary/100"
                      : "group-hover:translate-x-1"
                  }`}
                >
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>

                {/* Top Border Accent */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color} transition-all duration-300 transform origin-left ${
                    hoveredCard === feature.id ? "scale-x-100" : "scale-x-0"
                  }`}
                ></div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Bottom CTA Section */}
      
    </section>
  );
};

export default Why;
