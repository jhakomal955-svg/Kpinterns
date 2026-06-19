"use client";

import React from "react";

export default function LogoutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
}) {
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
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
            {/* Exit/Logout Icon */}
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-text-main">
              Confirm Logout
            </h3>
            <p className="mt-2 text-sm text-text-muted leading-relaxed font-medium">
              Are you sure you want to log out? You will need to sign in again to access your account dashboard or profile.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            className="px-4 py-2.5 text-sm font-bold rounded-xl bg-bg-main border-2 border-border-main text-text-main hover:bg-bg-main/80 transition duration-200 cursor-pointer"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2.5 text-sm font-bold rounded-xl bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg transition duration-200 cursor-pointer"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
