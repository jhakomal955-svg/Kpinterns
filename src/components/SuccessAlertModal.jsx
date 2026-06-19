"use client";

import React from "react";

export default function SuccessAlertModal({
  isOpen,
  onClose,
  title = "Success!",
  message = "Operation completed successfully.",
  actionText = "Okay",
  onAction,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => {
          if (onAction) onAction();
          onClose();
        }}
      />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-sm transform overflow-hidden rounded-2xl border-2 border-border-main bg-bg-card p-6 text-center shadow-2xl transition-all duration-300 scale-100 animate-in fade-in zoom-in-95">
        <div className="flex flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-brand-success mb-4 border border-brand-success/20">
            <svg 
              className="h-8 w-8 text-brand-success" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth="2.5" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
          <h3 className="text-xl font-extrabold text-text-main">
            {title}
          </h3>
          <p className="mt-3 text-sm text-text-muted leading-relaxed font-semibold">
            {message}
          </p>
        </div>

        <div className="mt-6">
          <button
            type="button"
            className="w-full px-4 py-2.5 text-sm font-bold rounded-xl bg-brand-primary text-white shadow-md hover:shadow-lg transition duration-200 cursor-pointer"
            onClick={() => {
              if (onAction) onAction();
              onClose();
            }}
          >
            {actionText}
          </button>
        </div>
      </div>
    </div>
  );
}
