"use client";

import React, { useState, useEffect } from "react";

export default function SocialBannerModal() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show popup on every website visit with smooth entrance delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const socialLinks = [
    {
      name: "WhatsApp Channel",
      tagline: "Official Updates & Announcements",
      badge: "NEW",
      href: "https://whatsapp.com/channel/0029VbD99mRDJ6H8VJ0Jc417",
      bgClass: "hover:bg-[#25D366]/10 border-[#25D366]/30",
      btnClass: "bg-[#25D366] text-white hover:bg-[#20bd5a]",
      icon: (
        <svg className="w-7 h-7 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      tagline: "Career Insights & Network",
      href: "https://www.linkedin.com/company/kpinterns.com/",
      bgClass: "hover:bg-[#0A66C2]/10 border-[#0A66C2]/30",
      btnClass: "bg-[#0A66C2] text-white hover:bg-[#084e96]",
      icon: (
        <svg className="w-7 h-7 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.8v8.37h2.8v-4.67c0-.25.015-.51.09-.69a1.14 1.14 0 0 1 1-.74c.65 0 .8.51.8 1.25v4.85h2.8M7.12 9.49a1.44 1.44 0 1 0-1.44-1.44 1.44 1.44 0 0 0 1.44 1.44m1.39 9.01V10.12H5.73v8.38h2.78z"/>
        </svg>
      ),
    },
    {
      name: "YouTube",
      tagline: "Free Tutorials & Live Classes",
      href: "https://youtube.com/@kpinterns?si=UOU6cATzGDzYW7zN",
      bgClass: "hover:bg-[#FF0000]/10 border-[#FF0000]/30",
      btnClass: "bg-[#FF0000] text-white hover:bg-[#cc0000]",
      icon: (
        <svg className="w-7 h-7 text-[#FF0000]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.377.505 9.377.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
    },
    {
      name: "Instagram",
      tagline: "Student Stories & Updates",
      href: "https://www.instagram.com/kpinterns020?igsh=a2p3cW9vbnB1ZWU=",
      bgClass: "hover:bg-[#E4405F]/10 border-[#E4405F]/30",
      btnClass: "bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white hover:opacity-90",
      icon: (
        <svg className="w-7 h-7 text-[#E4405F]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md transition-opacity duration-300 animate-fadeIn">
      {/* Click backdrop to dismiss */}
      <div className="absolute inset-0" onClick={handleDismiss} />

      {/* Main Banner Modal Container */}
      <div className="relative w-full max-w-xl bg-bg-card border border-border-main rounded-3xl shadow-2xl overflow-hidden z-10 p-6 sm:p-8 animate-scaleUp">
        
        {/* Close Button ('Cut') */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2.5 rounded-full text-text-muted hover:text-text-main hover:bg-bg-main border border-border-main/50 transition-all cursor-pointer group"
          title="Close and Explore Website"
          aria-label="Close social media links modal"
        >
          <svg
            className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header with Company Logo */}
        <div className="text-center mb-6 pr-8 pl-2">
          {/* Company Brand Logo */}
          <div className="flex justify-center items-center mb-3">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-main flex items-center gap-1.5">
              <span className="text-bg-main bg-text-main rounded-full px-3 py-1 text-xl sm:text-2xl shadow-sm">Kp</span>
              <span className="text-brand-primary">Interns</span>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-semibold uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
            Connect With KP Interns
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
            Join Our Official Communities 🚀
          </h2>
          <p className="text-sm text-text-muted mt-2 max-w-md mx-auto leading-relaxed">
            Stay updated with daily internship openings, live project mentorship, technical roadmaps & community announcements!
          </p>
        </div>

        {/* Social Channels List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleDismiss}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 group bg-bg-main/60 ${social.bgClass}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-bg-card border border-border-main shrink-0 shadow-sm">
                  {social.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-text-main truncate group-hover:text-brand-primary transition-colors">
                      {social.name}
                    </span>
                    {social.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-extrabold bg-[#25D366] text-white rounded-full">
                        {social.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted truncate">{social.tagline}</p>
                </div>
              </div>
              <span className={`ml-2 px-3 py-1.5 text-xs font-semibold rounded-xl shadow-sm transition-transform duration-200 group-hover:scale-105 shrink-0 ${social.btnClass}`}>
                Join
              </span>
            </a>
          ))}
        </div>

        {/* Dismiss / Explore Button */}
        <div className="text-center pt-2 border-t border-border-main/60">
          <button
            onClick={handleDismiss}
            className="w-full py-3 rounded-2xl bg-bg-main hover:bg-border-main/40 text-text-main font-semibold text-sm transition-all border border-border-main flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Explore Website Features</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
