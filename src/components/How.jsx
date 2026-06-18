"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import ScrollReveal from "./ScrollReveal.jsx";

const How = () => {
  const router = useRouter();
  const [hoveredStep, setHoveredStep] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef(null);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    if (scrollWidth === clientWidth) return;
    const newIndex = Math.min(
      Math.max(Math.round((scrollLeft / (scrollWidth - clientWidth)) * (steps.length - 1)), 0),
      steps.length - 1
    );
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  const steps = [
    {
      number: 1,
      title: "Register",
      description:
        "Fill in your details and choose your desired internship domain or training course.",
      icon: "📝",
      color: "from-brand-primary to-brand-secondary",
    },
    {
      number: 2,
      title: "Learn & Practice",
      description:
        "Attend live classes, watch video tutorials, and complete practical assignments with expert guidance.",
      icon: "🎓",
      color: "from-brand-secondary to-brand-success",
    },
    {
      number: 3,
      title: "Build Projects",
      description:
        "Work on real-world projects, collaborate with peers, and build a professional portfolio.",
      icon: "🚀",
      color: "from-brand-success to-brand-primary",
    },
    {
      number: 4,
      title: "Get Certificate",
      description:
        "Receive your verified digital certificate with academic credit details, ready for college submission and resumes.",
      icon: "🎉",
      color: "from-brand-primary to-brand-secondary",
    },
  ];

  return (
    <section className="relative px-4 sm:px-8 lg:px-[60px] py-8 bg-bg-main overflow-hidden">
      {/* Background gradient elements */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-br from-brand-primary/10 to-transparent rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-brand-secondary/10 to-transparent rounded-full blur-3xl -z-10"></div>

      {/* Header Section */}
      <ScrollReveal className="text-center mb-6" direction="fade">
        <p className="text-brand-primary text-sm sm:text-base font-bold uppercase tracking-widest mb-3">
          Simple Process
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-text-main mb-4 leading-tight">
          How It{" "}
          <span className="bg-linear-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
            Works
          </span>
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-text-muted max-w-2xl mx-auto leading-relaxed">
          From registration to a verified certificate — Four simple steps to
          transform your career
        </p>
      </ScrollReveal>

      {/* Steps Container */}
      <div className="mx-auto">
        {/* Mobile View - Horizontal Scroll Cards */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="lg:hidden flex items-stretch overflow-x-auto snap-x snap-mandatory gap-6 pb-6 scrollbar-hide"
        >
          {steps.map((step) => (
            <ScrollReveal
              key={step.number}
              className="group relative flex flex-col flex-shrink-0 w-[285px] sm:w-[320px] snap-center"
              direction="up"
              delay={step.number * 80}
            >
              <div className="bg-bg-card border border-border-main rounded-2xl p-6 sm:p-8 hover:border-brand-primary/40 hover:shadow-xl transition-all duration-300 flex-1">
                {/* Step Number Circle */}
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${step.color} text-white font-black text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  {step.number}
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-2xl font-bold text-text-main mb-2">
                    {step.title}
                  </h3>
                  <p className="text-text-muted leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Icon */}
                <div className="absolute top-6 right-6 text-4xl opacity-20 group-hover:opacity-40 transition-opacity">
                  {step.icon}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-1.5 mt-2 lg:hidden mb-6">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeIndex === idx ? "bg-brand-primary w-5" : "bg-border-main w-2"
              }`}
            />
          ))}
        </div>

        {/* Desktop View - Timeline */}
        <div className="hidden lg:block">
          {/* Connecting Line */}
          <div className="relative mb-16">
            {/* Gradient line */}
            <div className="absolute top-8 left-0 right-0 h-1 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary rounded-full opacity-30"></div>

            {/* Steps Grid */}
            <div className="grid grid-cols-4 gap-6">
              {steps.map((step) => (
                <ScrollReveal
                  key={step.number}
                  className="group relative"
                  direction="up"
                  delay={step.number * 120}
                  onMouseEnter={() => setHoveredStep(step.number)}
                  onMouseLeave={() => setHoveredStep(null)}
                >
                  {/* Step Number Circle */}
                  <div
                    className={`w-20 h-20 rounded-full bg-gradient-to-br ${step.color} text-white font-black text-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-2xl group-hover:scale-125 transition-all duration-300 relative z-10 cursor-pointer`}
                  >
                    {step.number}
                  </div>

                  {/* Card */}
                  <div
                    className={`bg-bg-card border-2 rounded-2xl p-6 text-center transition-all duration-300 ${
                      hoveredStep === step.number
                        ? "border-brand-primary/60 shadow-2xl -translate-y-2 bg-brand-primary/5"
                        : "border-border-main shadow-lg hover:border-brand-primary/40 hover:shadow-xl"
                    }`}
                  >
                    {/* Title */}
                    <h3 className="text-xl font-bold text-text-main mb-3">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-text-muted text-sm leading-relaxed mb-4">
                      {step.description}
                    </p>

                    {/* Icon */}
                    <div
                      className={`text-5xl transition-all duration-300 ${hoveredStep === step.number ? "scale-125" : "scale-100"}`}
                    >
                      {step.icon}
                    </div>

                    {/* Hover Arrow */}
                    {step.number < 4 && (
                      <div className="absolute -right-7 top-1/2 -translate-y-1/2 text-brand-primary/40 group-hover:text-brand-primary transition-colors duration-300">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </div>
      <ScrollReveal className="max-w-3xl mx-auto text-center mt-16" direction="scale">
        <div className="bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 border border-brand-primary/20 rounded-3xl p-8 sm:p-10 lg:p-12 backdrop-blur-sm hover:border-brand-primary/40 transition-all duration-300">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-main mb-4">
            Ready to Fulfill Your Internship Credits and Up-skill?
          </h3>
          <p className="text-text-muted text-base sm:text-lg mb-8 leading-relaxed">
            Join thousands of students who are already learning, growing, and
            getting certified with us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => router.push("/internship")} className="group relative inline-flex items-center justify-center px-8 sm:px-10 py-3 sm:py-4 text-sm sm:text-base font-bold text-white rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-r from-brand-secondary via-brand-primary to-brand-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-shimmer"></span>
              <span className="relative flex items-center gap-2">
                Start Internship Today
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
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
              </span>
            </button>
            <button onClick={()=>router.push("/courses")} className="group relative inline-flex items-center justify-center px-8 sm:px-10 py-3 sm:py-4 text-sm sm:text-base font-bold text-brand-primary rounded-xl border-2 border-brand-primary bg-white dark:bg-bg-card hover:bg-brand-primary/10 dark:hover:bg-brand-primary/10 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95">
              <span className="flex items-center gap-2">
                Start Course
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </ScrollReveal>
      
    </section>
  );
};

export default How;
