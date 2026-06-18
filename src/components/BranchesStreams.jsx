"use client";

import React from "react";
import ScrollReveal from "./ScrollReveal.jsx";

const BranchesStreams = () => {
  const technicalCourses = [
    { name: "Computer Science Engineering (CSE)", icon: "💻" },
    { name: "Civil Engineering", icon: "🏗️" },
    { name: "Electrical Engineering", icon: "⚡" },
    { name: "Electronics & Communication Engineering (ECE)", icon: "📡" },
    { name: "Mechanical Engineering", icon: "⚙️" },
    { name: "Information Technology (IT)", icon: "🖥️" },
  ];

  const nonTechnicalCourses = [
    { name: "BA — Bachelor of Arts", icon: "📚" },
    { name: "BSc — Bachelor of Science", icon: "🔬" },
    { name: "BCom — Bachelor of Commerce", icon: "💼" },
    { name: "BBA — Bachelor of Business Administration", icon: "📊" },
    { name: "BCA — Bachelor of Computer Applications", icon: "💾" },
    { name: "BA in Hospitality & Tourism", icon: "✈️" },
  ];

  return (
    <section className="relative overflow-hidden px-4 sm:px-8 lg:px-[60px] py-8bg-bg-main lg:mb-10 mb-5">
      {/* Animated Background Elements */}
      <div className="absolute top-32 right-10 w-[280px] h-[280px] md:w-[350px] md:h-[350px] bg-gradient-to-bl from-brand-secondary/20 to-transparent rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div
        className="absolute -bottom-10 -left-20 w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-gradient-to-tr from-brand-primary/15 to-transparent rounded-full blur-3xl -z-10 animate-pulse"
        style={{ animationDelay: "1.5s" }}
      ></div>

      <div className="mx-auto">
        {/* Header Section */}
        <ScrollReveal className="text-center mb-6" direction="fade">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-text-main mb-4 leading-tight">
            Branches & Streams
            <br />
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary bg-clip-text text-transparent bg-300% animate-gradient">
                Covered
              </span>
            </span>
          </h2>

          <p className="text-base md:text-lg text-text-muted max-w-2xl mx-auto mt-6 leading-relaxed font-medium">
            Technical and non-technical courses for B.Tech, Diploma, and
            graduation streams.
          </p>
        </ScrollReveal>

        {/* Content Section - Both Cards Visible */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 lg:gap-12">
          {/* Technical Courses Card */}
          <ScrollReveal className="flex flex-col" direction="left" delay={100}>
            <div className="group relative overflow-hidden rounded-2xl border border-brand-primary/20 hover:border-brand-primary/50 bg-bg-card shadow-lg hover:shadow-xl transition-all duration-300 p-8 md:p-10 flex-1">
            {/* Gradient background overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-secondary/5 pointer-events-none"></div>

            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-primary/0 via-brand-primary to-brand-primary/0"></div>

            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center gap-4 bg-bg-card mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/15 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                  <span className="text-3xl">🏢</span>
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-black text-text-main mb-1">
                    Technical
                  </h3>
                  <p className="text-sm font-semibold text-brand-primary">
                    B.Tech / Diploma
                  </p>
                </div>
              </div>

              {/* Course List */}
              <div className="space-y-2.5">
                {technicalCourses.map((course, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3.5 rounded-lg hover:bg-gradient-to-r hover:from-brand-primary/10 hover:to-brand-secondary/5 dark:hover:from-brand-primary/15 dark:hover:to-brand-secondary/10 transition-all duration-200 group/item cursor-pointer"
                  >
                    <div className="text-2xl flex-shrink-0 group-hover/item:scale-110 group-hover/item:rotate-12 transition-transform duration-300 mt-0.5">
                      {course.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm md:text-base font-semibold text-text-main group-hover/item:text-brand-primary transition-colors duration-200">
                        {course.name}
                      </p>
                    </div>
                    <div className="text-brand-success text-lg flex-shrink-0 font-bold">
                      ✓
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-border-main/30 dark:border-brand-primary/10">
                <p className="text-sm font-bold text-brand-primary hover:text-brand-secondary hover:gap-3 transition-all cursor-pointer flex items-center gap-2 group/more">
                  And Many More
                  <svg
                    className="w-5 h-5 group-hover/more:translate-x-2 transition-transform"
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
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

          {/* Non-Technical Courses Card */}
          <ScrollReveal className="flex flex-col" direction="right" delay={150}>
            <div className="group relative overflow-hidden rounded-2xl border border-brand-secondary/20 hover:border-brand-secondary/50 bg-bg-card shadow-lg hover:shadow-xl transition-all duration-300 p-8 md:p-10 flex-1">
            {/* Gradient background overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-secondary/5 via-transparent to-brand-primary/5 pointer-events-none"></div>

            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-secondary/0 via-brand-secondary to-brand-secondary/0"></div>

            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-brand-secondary/20 to-brand-primary/15 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                  <span className="text-3xl">🎨</span>
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-black text-text-main mb-1">
                    Non-Technical
                  </h3>
                  <p className="text-sm font-semibold text-brand-secondary">
                    Graduation Streams
                  </p>
                </div>
              </div>

              {/* Course List */}
              <div className="space-y-2.5">
                {nonTechnicalCourses.map((course, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3.5 rounded-lg hover:bg-gradient-to-r hover:from-brand-secondary/10 hover:to-brand-primary/5 dark:hover:from-brand-secondary/15 dark:hover:to-brand-primary/10 transition-all duration-200 group/item cursor-pointer"
                  >
                    <div className="text-2xl flex-shrink-0 group-hover/item:scale-110 group-hover/item:rotate-12 transition-transform duration-300 mt-0.5">
                      {course.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm md:text-base font-semibold text-text-main group-hover/item:text-brand-secondary transition-colors duration-200">
                        {course.name}
                      </p>
                    </div>
                    <div className="text-brand-success text-lg flex-shrink-0 font-bold">
                      ✓
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-border-main/30 dark:border-brand-secondary/10">
                <p className="text-sm font-bold text-brand-secondary hover:text-brand-primary hover:gap-3 transition-all cursor-pointer flex items-center gap-2 group/more">
                  And Many More
                  <svg
                    className="w-5 h-5 group-hover/more:translate-x-2 transition-transform"
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
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default BranchesStreams;
