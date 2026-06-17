"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const Counter = ({ targetNumber, suffix = "+" }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(targetNumber.replace(/,/g, ""));
    const duration = 2000; // 2 seconds animation
    const increment = end / (duration / 16); // Update every 16ms (60fps)

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [targetNumber]);

  return (
    <>
      {count.toLocaleString()}
      {suffix}
    </>
  );
};

const WordReveal = ({ text, delayOffset = 0, className = "" }) => {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, index) => (
        <span
          key={index}
          className={`inline-block opacity-0 translate-y-[12px] animate-word-fade-in ${className}`}
          style={{
            animationDelay: `${delayOffset + index * 100}ms`,
            animationFillMode: "forwards",
          }}
        >
          {word}&nbsp;
        </span>
      ))}
    </>
  );
};

const Hero = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem("userToken");
      setIsLoggedIn(!!token);
    };

    checkLogin();
    window.addEventListener("user-login-change", checkLogin);
    return () => window.removeEventListener("user-login-change", checkLogin);
  }, []);

  const stats = [
    { number: "50,000+", label: "Students Trained" },
    { number: "100+", label: "Courses" },
    { number: "100+", label: "Universities" },
  ];

  return (
    <section className="relative overflow-hidden bg-bg-main  flex items-center justify-center px-4 sm:px-8 lg:px-[60px] py-8 ">
      {/* Animated gradient background using theme colors - Enhanced */}
      <div className="absolute top-0 left-0 w-[250px] h-[250px] sm:w-[350px] sm:h-[350px] lg:w-[600px] lg:h-[600px] bg-gradient-to-br from-brand-primary/20 to-brand-secondary/15 rounded-full -translate-x-1/3 -translate-y-1/3 blur-3xl animate-pulse"></div>
      <div
        className="absolute bottom-0 right-0 w-[250px] h-[250px] sm:w-[350px] sm:h-[350px] lg:w-[600px] lg:h-[600px] bg-gradient-to-tl from-brand-secondary/20 to-brand-primary/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="absolute top-1/2 left-1/2 w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] lg:w-[500px] lg:h-[500px] bg-gradient-to-br from-brand-success/15 to-transparent rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-6 sm:space-y-8  animate-fade-in">
            {/* Badge - Enhanced */}

            {/* Main Heading - Enhanced */}
            <div className="space-y-3 sm:space-y-5">
              <div className="inline-block group">
                <div className="bg-white/80 dark:bg-bg-card backdrop-blur-sm border border-brand-primary/30 rounded-xl px-4 sm:px-6 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3 hover:border-brand-primary/60 hover:bg-white dark:hover:bg-bg-card transition-all shadow-md hover:shadow-lg duration-300">
                  <div className="w-4 sm:w-5 h-4 sm:h-5 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform"></div>
                  <span className="text-xs sm:text-sm font-bold text-brand-primary uppercase tracking-widest">
                    AICTE & UGC compliant Programs
                  </span>
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black leading-[1.15] text-text-main">
                <WordReveal text="India's Leading Internship and Courses Platform" delayOffset={150} />
                <br />
                <span 
                  className="relative inline-block opacity-0 translate-y-[12px] animate-word-fade-in"
                  style={{
                    animationDelay: "750ms",
                    animationFillMode: "forwards",
                  }}
                >
                  <span className="relative bg-linear-to-r from-brand-primary via-brand-secondary to-brand-primary bg-clip-text text-transparent bg-300% animate-gradient">
                    for UG Students
                  </span>
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-text-muted text-md  text-justify leading-relaxed max-w-2xl font-medium opacity-90 hover:opacity-100 transition-opacity">
                Skill-based training and industry internships as per AICTE and
                UGC guidelines. We provide structured programs for technical and
                non-technical students across India.
              </p>
            </div>

            {/* CTA Buttons - Enhanced */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
              {!isLoggedIn ? (
                <Link
                  href="/register"
                  className="group relative inline-flex items-center justify-center px-8 sm:px-10 py-4 sm:py-5 text-sm sm:text-base font-bold text-white rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:scale-105 active:scale-95"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-brand-secondary via-brand-primary to-brand-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-shimmer"></span>
                  <span className="relative flex items-center gap-2">
                    Enroll in Internships Now
                    <svg
                      className="w-5 h-5 group-hover:translate-x-2 group-hover:scale-110 transition-all"
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
                </Link>
              ) : (
                <Link
                  href="/internship"
                  className="group relative inline-flex items-center justify-center px-8 sm:px-10 py-4 sm:py-5 text-sm sm:text-base font-bold text-white rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:scale-105 active:scale-95"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-brand-secondary via-brand-primary to-brand-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-shimmer"></span>
                  <span className="relative flex items-center gap-2">
                    Explore Internships 
                    <svg
                      className="w-5 h-5 group-hover:translate-x-2 group-hover:scale-110 transition-all"
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
                </Link>
              )}
              <Link
                href="/courses"
                className="group relative inline-flex items-center justify-center px-8 sm:px-10 py-4 sm:py-5 text-sm sm:text-base font-bold text-brand-primary rounded-xl border-2 border-brand-primary bg-white dark:bg-bg-card hover:bg-brand-primary/10 dark:hover:bg-brand-primary/10 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
              >
                <span className="flex items-center gap-2">
                  Explore Courses
                  <svg
                    className="w-5 h-5 group-hover:translate-x-2 group-hover:scale-110 transition-all"
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
              </Link>
            </div>

            {/* Stats - Enhanced */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="group cursor-pointer text-center sm:text-left"
                >
                  <p className="text-2xl sm:text-3xl md:text-4xl font-black bg-linear-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent group-hover:scale-125 transition-transform duration-300">
                    <Counter
                      targetNumber={stat.number.replace("+", "")}
                      suffix="+"
                    />
                  </p>
                  <p className="text-xs sm:text-sm text-text-muted font-semibold mt-2 group-hover:text-brand-primary transition-colors">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Image Section - Enhanced */}
          <div className="relative h-full min-h-[300px] sm:min-h-[400px] md:min-h-[500px] lg:max-h-[600px] animate-float">
            {/* Main hero image with enhanced styling */}
            <div style={{ position: 'relative' }} className="relative h-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 sm:border-4 border-brand-primary/20 group hover:border-brand-primary/40 transition-all duration-300">
              {/* Premium gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 via-transparent to-brand-secondary/20 z-20 pointer-events-none group-hover:from-brand-primary/30 group-hover:to-brand-secondary/30 transition-all duration-300"></div>
              {/* Image */}
              <Image
                src="/banner.png"
                alt="Transform Your Skills and Career"
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-contain object-center group-hover:scale-110 transition-transform duration-700"
              />
              {/* Shine effect */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                  animation: "shimmer 3s infinite",
                }}
              ></div>
            </div>

            {/* Floating testimonial card - Enhanced
            <div className="absolute bottom-3 sm:bottom-6 lg:bottom-8 -left-4 sm:right-8 lg:right-0 bg-bg-card/95 dark:bg-bg-card backdrop-blur-md rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 max-w-xs sm:max-w-sm z-30 hover:shadow-3xl hover:-translate-y-3 transition-all duration-300 border border-brand-primary/20 hover:border-brand-primary/40 hidden lg:block group/card">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0">
                  <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg group-hover/card:scale-110 transition-transform">
                    A
                  </div>
                </div>
                <div>
                  <p className="font-bold text-text-main text-sm">Abyab</p>
                  <p className="text-xs text-brand-secondary font-semibold">
                    Student | Batch 01
                  </p>
                </div>
              </div>
              <p className="text-text-muted leading-relaxed text-sm">
                <span className="text-3xl text-brand-primary/25 font-light">
                  "
                </span>
                An amazing platform that helped me land my dream job!
                <span className="text-3xl text-brand-primary/25 font-light ml-1">
                  "
                </span>
              </p>
              <div className="flex gap-1 mt-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 text-brand-success fill-current group-hover/card:scale-110 transition-transform"
                    style={{ transitionDelay: `${i * 50}ms` }}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div> */}
            {/* </div> */}

            {/* Decorative elements - Enhanced */}
            <div className="absolute top-10 -right-16 sm:-right-24 w-32 sm:w-48 h-32 sm:h-48 bg-gradient-to-br from-brand-secondary/30 to-transparent rounded-full blur-3xl animate-pulse"></div>
            <div
              className="absolute -bottom-16 -left-12 sm:-left-24 w-40 sm:w-64 h-40 sm:h-64 bg-gradient-to-tr from-brand-success/25 to-transparent rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
          </div>
        </div>
      </div>

      {/* Scroll indicator
      <div className="absolute bottom-8 left-1/2  z-10">
        <div className="flex flex-col items-center gap-2 text-text-muted animate-bounce cursor-pointer hover:text-brand-primary transition-colors">
          <span className="text-sm font-semibold">Scroll to explore</span>
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div> */}
    </section>
  );
};

export default Hero;
