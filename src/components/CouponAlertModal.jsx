"use client";

import React from "react";

export default function CouponAlertModal({ isOpen, onClose, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl border-2 border-red-500/30 bg-bg-card p-6 text-left align-middle shadow-2xl transition-all duration-300 scale-100 animate-in fade-in zoom-in-95 z-10">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500">
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-text-main">
              Coupon Expired / Invalid
            </h3>
            <p className="mt-2 text-sm font-semibold text-text-muted leading-relaxed">
              {message || "coupon code is expired try another coupen code"}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold rounded-xl bg-brand-primary text-white hover:bg-brand-primary/90 shadow-md transition duration-200 cursor-pointer text-center"
            onClick={onClose}
          >
            Try Another Coupon
          </button>
        </div>
      </div>
    </div>
  );
}
