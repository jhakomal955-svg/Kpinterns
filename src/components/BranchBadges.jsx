"use client";

import { useState, useRef, useEffect } from "react";

export default function BranchBadges({ department, maxVisible = 2 }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const depts = Array.isArray(department)
    ? department.filter(Boolean)
    : department
    ? [department].filter(Boolean)
    : [];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (depts.length === 0) {
    return (
      <span className="inline-block text-[11px] uppercase font-extrabold text-brand-secondary tracking-wider bg-brand-secondary/10 px-2.5 py-0.5 rounded-md border border-brand-secondary/20">
        All Branches
      </span>
    );
  }

  const visibleDepts = depts.slice(0, maxVisible);
  const remainingDepts = depts.slice(maxVisible);

  return (
    <div className="relative inline-block w-full" ref={dropdownRef}>
      <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
        {visibleDepts.map((d, index) => (
          <span
            key={index}
            className="text-[11px] font-bold text-brand-secondary bg-brand-secondary/10 border border-brand-secondary/20 px-2.5 py-0.5 rounded-md truncate max-w-[200px]"
            title={d}
          >
            {d}
          </span>
        ))}

        {remainingDepts.length > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className="text-[11px] font-bold text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/30 px-2 py-0.5 rounded-md transition cursor-pointer flex items-center gap-1 select-none"
            title="Click to view all eligible branches"
          >
            +{remainingDepts.length} More
            <svg
              className={`w-3 h-3 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        )}
      </div>

      {isOpen && (
        <div
          className="absolute left-0 z-30 mt-1 w-72 max-h-60 overflow-y-auto bg-bg-card border-2 border-border-main rounded-xl p-3 shadow-2xl space-y-2 backdrop-blur-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-border-main pb-1.5">
            <span className="text-xs font-extrabold text-text-main uppercase tracking-wider">
              Eligible Branches ({depts.length})
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-text-muted hover:text-text-main p-0.5 rounded hover:bg-bg-main"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto pr-1">
            {depts.map((d, idx) => (
              <span
                key={idx}
                className="text-[10px] font-semibold text-text-main bg-bg-main border border-border-main px-2 py-1 rounded-md"
              >
                {d}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
