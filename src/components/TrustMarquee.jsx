"use client";

import React from "react";
import Image from "next/image";

const TrustMarquee = () => {
  const trustItems = [
    {
      type: "compliance",
      name: "UGC Compliant",
      detail: "Academic Credit Framework",
      image: "/ugc.jpg",
    },
    {
      type: "compliance",
      name: "AICTE Registered",
      detail: "Technical Course Regulated",
      image: "/Aicte.png",
    },
    {
      type: "compliance",
      name: "ISO 9001:2015",
      detail: "Certified Quality System",
      image: "/Iso.png",
    },
    {
      type: "compliance",
      name: "MSME Registered",
      detail: "Govt of India Enterprise",
      image: "/Msme.png",
    },
    {
      type: "compliance",
      name: "MCA Registered",
      detail: "Ministry of Corporate Affairs",
      image: "/Mca.png",
    },
    {
      type: "university",
      name: "Patna University",
      detail: "CBCS / CCFUP Compatible",
      icon: "🎓",
    },
    {
      type: "university",
      name: "LNMU Darbhanga",
      detail: "Academic Credit Transfer",
      icon: "🏛️",
    },
    {
      type: "university",
      name: "Magadh University",
      detail: "NEP-2020 Aligned Curriculum",
      icon: "📚",
    },
    {
      type: "university",
      name: "BRABU Muzaffarpur",
      detail: "4 Academic Credits",
      icon: "🏢",
    },
    {
      type: "university",
      name: "Pataliputra University",
      detail: "Semester Internship Track",
      icon: "📖",
    },
    {
      type: "university",
      name: "TMBU Bhagalpur",
      detail: "NEP Credit Compliant",
      icon: "✍️",
    },
  ];

  return (
    <section className="relative w-full py-8 overflow-hidden bg-bg-main border-y border-border-main/50">
      <div className="px-4 sm:px-8 lg:px-[60px] mb-4 text-center sm:text-left">
        <p className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-brand-primary">
          Academic Compatibility & Recognition
        </p>
      </div>

      {/* Marquee Outer Container */}
      <div className="relative w-full overflow-hidden flex select-none">
        {/* Left/Right fading gradients to look clean & premium */}
        <div className="absolute top-0 left-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-bg-main to-transparent z-10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-bg-main to-transparent z-10 pointer-events-none"></div>

        {/* Marquee Track (scrolling ticker - Side by Side containers) */}
        <div className="flex animate-marquee-paused">
          {/* Main Track container */}
          <div className="animate-marquee flex-shrink-0 flex gap-6 pr-6 py-2">
            {trustItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 bg-bg-card border border-border-main hover:border-brand-primary/40 rounded-2xl px-5 py-3.5 shadow-md hover:shadow-lg transition-all duration-300 min-w-[280px]"
              >
                {item.type === "compliance" ? (
                  <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center bg-white rounded-lg p-1 overflow-hidden shadow-inner border border-border-main/20">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 flex-shrink-0 bg-brand-primary/10 rounded-xl flex items-center justify-center text-xl">
                    {item.icon}
                  </div>
                )}

                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-black text-text-main leading-tight truncate">
                    {item.name}
                  </span>
                  <span className="text-xs font-semibold text-text-muted mt-0.5 truncate">
                    {item.detail}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Duplicate Track container (seamless loop connector) */}
          <div className="animate-marquee flex-shrink-0 flex gap-6 pr-6 py-2" aria-hidden="true">
            {trustItems.map((item, index) => (
              <div
                key={`dup-${index}`}
                className="flex items-center gap-4 bg-bg-card border border-border-main hover:border-brand-primary/40 rounded-2xl px-5 py-3.5 shadow-md hover:shadow-lg transition-all duration-300 min-w-[280px]"
              >
                {item.type === "compliance" ? (
                  <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center bg-white rounded-lg p-1 overflow-hidden shadow-inner border border-border-main/20">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 flex-shrink-0 bg-brand-primary/10 rounded-xl flex items-center justify-center text-xl">
                    {item.icon}
                  </div>
                )}

                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-black text-text-main leading-tight truncate">
                    {item.name}
                  </span>
                  <span className="text-xs font-semibold text-text-muted mt-0.5 truncate">
                    {item.detail}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustMarquee;
