"use client";

import React from "react";

export const getEmailValidationError = (email) => {
  if (!email || typeof email !== "string" || !email.trim()) {
    return "Email address is required.";
  }
  const cleanEmail = email.trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(cleanEmail)) {
    return `"${cleanEmail}" does not match standard email format (name@domain.com).`;
  }

  const parts = cleanEmail.split("@");
  if (parts.length !== 2) return "Email must contain exactly one @ symbol.";

  const [local, domain] = parts;
  if (!local || !domain) return "Email must have username before @ and domain after @.";

  const domainParts = domain.toLowerCase().split(".");
  const tld = domainParts[domainParts.length - 1];

  // Known typo extensions
  const invalidTlds = ["con", "cmo", "gmal", "gmai", "yaho", "hotmial", "outlok", "cm", "coom", "comm"];
  if (invalidTlds.includes(tld)) {
    const suggestedDomain = domainParts.slice(0, -1).join(".") + ".com";
    return `"${cleanEmail}" has an invalid domain extension (.${tld}). Did you mean "${local}@${suggestedDomain}"?`;
  }

  const domainLower = domain.toLowerCase();
  const domainMainName = domainParts[0] || "";

  // Common domain typos
  const commonDomainTypos = {
    "gmail.con": "gmail.com",
    "gmai.com": "gmail.com",
    "gmaill.com": "gmail.com",
    "gmaiul.com": "gmail.com",
    "gamil.com": "gmail.com",
    "gmial.com": "gmail.com",
    "gmal.com": "gmail.com",
    "gmaii.com": "gmail.com",
    "gmail.co": "gmail.com",
    "yahoo.con": "yahoo.com",
    "yaho.com": "yahoo.com",
    "yahou.com": "yahoo.com",
    "hotmail.con": "hotmail.com",
    "hotmial.com": "hotmail.com",
    "outlook.con": "outlook.com",
    "outlok.com": "outlook.com",
  };

  if (commonDomainTypos[domainLower]) {
    const correctDomain = commonDomainTypos[domainLower];
    return `"${cleanEmail}" has a typo in domain "${domain}". Did you mean "${local}@${correctDomain}"?`;
  }

  // Generic prefix check for Gmail domain typos (e.g. gmaiul, gamil, gmial, gmal)
  if (
    (domainMainName.startsWith("gmai") ||
      domainMainName.startsWith("gami") ||
      domainMainName.startsWith("gmia") ||
      domainMainName.startsWith("gmal")) &&
    domainLower !== "gmail.com" &&
    domainLower !== "gmail.in" &&
    domainLower !== "gmail.co.in"
  ) {
    return `"${cleanEmail}" has a typo in domain "${domain}". Did you mean "${local}@gmail.com"?`;
  }

  // Generic prefix check for Yahoo domain typos
  if (
    domainMainName.startsWith("yaho") &&
    domainLower !== "yahoo.com" &&
    domainLower !== "yahoo.co.in" &&
    domainLower !== "yahoo.in"
  ) {
    return `"${cleanEmail}" has a typo in domain "${domain}". Did you mean "${local}@yahoo.com"?`;
  }

  return null; // Valid format
};

export const validateEmailFormat = (email) => {
  return getEmailValidationError(email) === null;
};

export default function InvalidEmailModal({
  isOpen,
  onClose,
  emailEntered = "",
  customErrorMsg = "",
}) {
  if (!isOpen) return null;

  const errorDetail = customErrorMsg || getEmailValidationError(emailEntered) || `"${emailEntered}" is an invalid email address.`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl border-2 border-red-500/40 bg-bg-card p-6 text-center shadow-2xl transition-all duration-300 scale-100 animate-in fade-in zoom-in-95">
        <div className="flex flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-500 mb-4 border border-red-500/20 shadow-inner">
            <svg 
              className="h-8 w-8 text-red-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth="2.5" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>

          <h3 className="text-xl font-extrabold text-text-main">
            Invalid Email Format!
          </h3>

          <div className="mt-3 w-full bg-red-500/10 p-3 rounded-xl border border-red-500/20 text-center">
            <p className="text-xs font-semibold text-red-500 break-all leading-relaxed">
              {errorDetail}
            </p>
          </div>

          <div className="mt-4 w-full bg-bg-main p-4 rounded-xl border border-border-main text-left space-y-2 text-xs">
            <span className="font-extrabold uppercase text-brand-primary block tracking-wider text-[11px]">
              💡 Correct Email Format Guidelines:
            </span>
            <ul className="list-disc list-inside space-y-1 font-semibold text-text-muted">
              <li><code className="text-brand-secondary bg-brand-secondary/10 px-1.5 py-0.5 rounded font-mono">user@gmail.com</code></li>
              <li><code className="text-brand-secondary bg-brand-secondary/10 px-1.5 py-0.5 rounded font-mono">student@university.edu</code></li>
              <li><code className="text-brand-secondary bg-brand-secondary/10 px-1.5 py-0.5 rounded font-mono">name@company.org</code></li>
            </ul>
            <div className="text-[11px] text-text-muted/90 pt-2 border-t border-border-main space-y-1">
              <p>• Must include an <strong className="text-text-main">@</strong> symbol.</p>
              <p>• Must have a valid domain name (e.g. <strong className="text-text-main">gmail.com</strong>).</p>
              <p>• Must end with a valid domain extension (e.g. <strong className="text-text-main">.com</strong>, <strong className="text-text-main">.in</strong>, <strong className="text-text-main">.org</strong>).</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="button"
            className="w-full px-4 py-2.5 text-sm font-bold rounded-xl bg-brand-primary text-white shadow-md hover:bg-brand-primary/90 transition duration-200 cursor-pointer"
            onClick={onClose}
          >
            Got it, I'll fix it
          </button>
        </div>
      </div>
    </div>
  );
}
