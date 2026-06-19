"use client";

import React from "react";
import Link from "next/link";

export default function AuthAlertModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl border-2 border-border-main bg-bg-card p-6 text-left align-middle shadow-2xl transition-all duration-300 scale-100 animate-in fade-in zoom-in-95">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
            <svg 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth="2" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-text-main">
              Registration & Login Needed
            </h3>
            <p className="mt-2 text-sm text-text-muted leading-relaxed font-semibold">
              Please register or login to your account to send a message through the contact form.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
          <button
            type="button"
            className="px-4 py-2.5 text-sm font-bold rounded-xl bg-bg-main border-2 border-border-main text-text-main hover:bg-bg-main/80 transition duration-200 cursor-pointer w-full sm:w-auto text-center"
            onClick={onClose}
          >
            Cancel
          </button>
          <Link
            href="/login"
            className="px-4 py-2.5 text-sm font-bold rounded-xl border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white transition duration-200 w-full sm:w-auto text-center"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="px-4 py-2.5 text-sm font-bold rounded-xl bg-brand-primary text-white hover:bg-brand-primary/95 shadow-md hover:shadow-lg transition duration-200 w-full sm:w-auto text-center"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
