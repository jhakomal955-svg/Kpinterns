"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";

export default function InternshipsPage() {
  const [internships, setInternships] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedMode, setSelectedMode] = useState("");
  const [selectedStipend, setSelectedStipend] = useState("all");

  useEffect(() => {
    const fetchInternships = async () => {
      try {
        const res = await fetch("/api/internship");
        const data = await res.json();
        if (data.success) {
          // Filter to show active internships
          setInternships(data.data.filter(i => i.status === "Active" || i.status === "Published"));
        } else {
          setError(data.error || "Failed to load internships");
        }
      } catch (err) {
        console.error(err);
        setError("An error occurred while loading internships.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInternships();
  }, []);

  // Get unique domains from available internships
  const uniqueDomains = Array.from(
    new Set(internships.map((i) => i.domain).filter(Boolean))
  ).sort();

  // Filter internships based on user choices
  const filteredInternships = internships.filter((internship) => {
    const matchesSearch =
      !searchTerm ||
      internship.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.domain?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = !selectedDept || internship.department === selectedDept;

    const matchesDomain = !selectedDomain || internship.domain === selectedDomain;

    const matchesType = !selectedType || internship.internshipType === selectedType;

    const matchesMode = !selectedMode || internship.mode === selectedMode;

    let matchesStipend = true;
    if (selectedStipend === "paid") {
      matchesStipend = internship.stipend?.amount > 0;
    } else if (selectedStipend === "unpaid") {
      matchesStipend = !internship.stipend?.amount || internship.stipend.amount === 0;
    }

    return (
      matchesSearch &&
      matchesDept &&
      matchesDomain &&
      matchesType &&
      matchesMode &&
      matchesStipend
    );
  });

  return (
    <div className="min-h-screen bg-bg-main text-text-main py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight">
            Explore <span className="text-brand-primary">Internships</span>
          </h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Apply to domain-focused, industry-aligned internships. Gain certificates, experience, and professional mentorship.
          </p>
        </div>

        {/* Loading and Error States */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
            <p className="mt-4 text-text-muted">Loading internships...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500 bg-red-500/10 border border-red-500/20 rounded-2xl p-6 max-w-md mx-auto">
            <p className="font-bold">{error}</p>
          </div>
        ) : internships.length === 0 ? (
          <div className="text-center py-20 text-text-muted bg-bg-card border-2 border-border-main rounded-2xl max-w-md mx-auto p-8">
            <span className="text-4xl mb-4 block">💼</span>
            <p className="font-semibold">No active internships found.</p>
            <p className="text-sm mt-1">Please check back later or explore available courses.</p>
          </div>
        ) : (
          <>
            {/* Search and Filter Panel */}
            <div className="mb-10 p-6 bg-bg-card border-2 border-border-main rounded-2xl shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1 relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                    🔍
                  </span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search internships by title, position, company, or domain..."
                    className="w-full pl-10 pr-10 py-3 bg-bg-main border-2 border-border-main rounded-xl text-text-main placeholder-text-muted/60 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all text-sm font-semibold"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-muted hover:text-brand-primary transition-colors text-sm"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Reset Button */}
                {(searchTerm || selectedDept || selectedDomain || selectedType || selectedMode || selectedStipend !== "all") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedDept("");
                      setSelectedDomain("");
                      setSelectedType("");
                      setSelectedMode("");
                      setSelectedStipend("all");
                    }}
                    className="px-6 py-3 bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-white font-bold rounded-xl transition-all duration-300 text-sm whitespace-nowrap cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
                {/* Department Filter */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-text-muted">Department</label>
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full px-3 py-2.5 bg-bg-main border-2 border-border-main rounded-xl text-text-main font-semibold text-sm focus:outline-none focus:border-brand-primary transition-all cursor-pointer"
                  >
                    <option value="">All Departments</option>
                    <option value="Bsc">Bsc</option>
                    <option value="BTech">BTech</option>
                    <option value="BBA">BBA</option>
                    <option value="BCom">BCom</option>
                    <option value="BA">BA</option>
                    <option value="BCA">BCA</option>
                    <option value="BScIT">BScIT</option>
                    <option value="BScCS">BScCS</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Domain Filter */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-text-muted">Domain</label>
                  <select
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    className="w-full px-3 py-2.5 bg-bg-main border-2 border-border-main rounded-xl text-text-main font-semibold text-sm focus:outline-none focus:border-brand-primary transition-all cursor-pointer"
                  >
                    <option value="">All Domains</option>
                    {uniqueDomains.map((domain) => (
                      <option key={domain} value={domain}>
                        {domain}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Internship Type Filter */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-text-muted">Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-bg-main border-2 border-border-main rounded-xl text-text-main font-semibold text-sm focus:outline-none focus:border-brand-primary transition-all cursor-pointer"
                  >
                    <option value="">All Types</option>
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Summer">Summer</option>
                    <option value="Winter">Winter</option>
                    <option value="Project-Based">Project-Based</option>
                  </select>
                </div>

                {/* Mode Filter */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-text-muted">Mode</label>
                  <select
                    value={selectedMode}
                    onChange={(e) => setSelectedMode(e.target.value)}
                    className="w-full px-3 py-2.5 bg-bg-main border-2 border-border-main rounded-xl text-text-main font-semibold text-sm focus:outline-none focus:border-brand-primary transition-all cursor-pointer"
                  >
                    <option value="">All Modes</option>
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                {/* Stipend Filter */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-text-muted">Compensation</label>
                  <select
                    value={selectedStipend}
                    onChange={(e) => setSelectedStipend(e.target.value)}
                    className="w-full px-3 py-2.5 bg-bg-main border-2 border-border-main rounded-xl text-text-main font-semibold text-sm focus:outline-none focus:border-brand-primary transition-all cursor-pointer"
                  >
                    <option value="all">All (Paid & Unpaid)</option>
                    <option value="paid">Paid Only</option>
                    <option value="unpaid">Unpaid Only</option>
                  </select>
                </div>
              </div>
              
              {/* Active Filter Badges */}
              {(searchTerm || selectedDept || selectedDomain || selectedType || selectedMode || selectedStipend !== "all") && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-border-main/50 animate-fade-in">
                  {searchTerm && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-bg-main border border-border-main rounded-full text-xs font-semibold text-text-main">
                      Search: "{searchTerm}"
                      <button onClick={() => setSearchTerm("")} className="text-text-muted hover:text-brand-primary cursor-pointer font-bold">✕</button>
                    </span>
                  )}
                  {selectedDept && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-bg-main border border-border-main rounded-full text-xs font-semibold text-text-main">
                      Dept: {selectedDept}
                      <button onClick={() => setSelectedDept("")} className="text-text-muted hover:text-brand-primary cursor-pointer font-bold">✕</button>
                    </span>
                  )}
                  {selectedDomain && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-bg-main border border-border-main rounded-full text-xs font-semibold text-text-main">
                      Domain: {selectedDomain}
                      <button onClick={() => setSelectedDomain("")} className="text-text-muted hover:text-brand-primary cursor-pointer font-bold">✕</button>
                    </span>
                  )}
                  {selectedType && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-bg-main border border-border-main rounded-full text-xs font-semibold text-text-main">
                      Type: {selectedType}
                      <button onClick={() => setSelectedType("")} className="text-text-muted hover:text-brand-primary cursor-pointer font-bold">✕</button>
                    </span>
                  )}
                  {selectedMode && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-bg-main border border-border-main rounded-full text-xs font-semibold text-text-main">
                      Mode: {selectedMode}
                      <button onClick={() => setSelectedMode("")} className="text-text-muted hover:text-brand-primary cursor-pointer font-bold">✕</button>
                    </span>
                  )}
                  {selectedStipend !== "all" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-bg-main border border-border-main rounded-full text-xs font-semibold text-text-main">
                      Compensation: {selectedStipend === "paid" ? "Paid Only" : "Unpaid Only"}
                      <button onClick={() => setSelectedStipend("all")} className="text-text-muted hover:text-brand-primary cursor-pointer font-bold">✕</button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Results count & status */}
            {filteredInternships.length === 0 ? (
              <div className="text-center py-20 text-text-muted bg-bg-card border-2 border-border-main rounded-2xl max-w-md mx-auto p-8 animate-fade-in">
                <span className="text-4xl mb-4 block">🔍</span>
                <p className="font-semibold text-lg text-text-main mb-2">No internships found matching your criteria</p>
                <p className="text-sm">Try resetting filters or adjusting search queries.</p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedDept("");
                    setSelectedDomain("");
                    setSelectedType("");
                    setSelectedMode("");
                    setSelectedStipend("all");
                  }}
                  className="mt-6 px-5 py-2.5 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold rounded-xl transition-all shadow cursor-pointer text-sm"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6 flex justify-between items-center text-sm text-text-muted font-bold px-2 animate-fade-in">
                  <span>Found {filteredInternships.length} {filteredInternships.length === 1 ? "internship" : "internships"}</span>
                </div>

                {/* Internships Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredInternships.map((internship, index) => (
                    <ScrollReveal
                      key={internship._id}
                      className="h-full"
                      direction="up"
                      delay={(index % 3) * 80}
                      duration={600}
                    >
                      <div
                        className="group bg-bg-card border-2 border-border-main rounded-2xl overflow-hidden hover:border-brand-primary hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                      >
                      {/* Visual Header / Thumbnail */}
                      <div className="relative h-48 bg-gradient-to-br from-brand-secondary/20 via-brand-primary/20 to-brand-secondary/10 flex items-center justify-center overflow-hidden border-b border-border-main">
                        {internship.thumbnail ? (
                          <img 
                            src={internship.thumbnail} 
                            alt={internship.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350"
                            loading="lazy"
                          />
                        ) : (
                          <>
                            <div className="absolute inset-0 bg-brand-secondary/10 group-hover:scale-105 transition-transform duration-350"></div>
                            <span className="text-5xl group-hover:-rotate-6 transition-transform duration-350 select-none">💼</span>
                          </>
                        )}
                        
                        {/* Badges Overlay */}
                        <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
                          <span className="bg-bg-card/90 text-text-main text-[11px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full shadow border border-border-main">
                            {internship.department}
                          </span>
                          <span className="bg-brand-primary text-white text-[11px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full shadow">
                            {internship.mode}
                          </span>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-bold text-brand-secondary uppercase tracking-wider">
                            {internship.domain}
                          </span>
                          <span className="bg-brand-success/15 text-brand-success text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-brand-success/20">
                            {internship.internshipType}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-text-main group-hover:text-brand-secondary transition-colors line-clamp-1 mb-1">
                          {internship.title}
                        </h3>
                        
                        <span className="text-sm font-semibold text-text-muted mb-4 block">
                          🏢 {internship.company || "KpInterns"}
                        </span>

                        <p className="text-text-muted text-sm line-clamp-3 mb-6 flex-1">
                          {internship.shortDescription || internship.description}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-border-main mt-auto">
                          {/* Fee and Duration */}
                          <div className="flex flex-col">
                            <span className="text-xs text-text-muted uppercase font-bold tracking-wider">Registration Fee</span>
                            <span className="text-lg font-black text-text-main">
                              {internship.RegistrationFee?.amount ? `₹${internship.RegistrationFee.amount}` : "Free"}
                            </span>
                          </div>

                          <div className="flex flex-col text-right">
                            <span className="text-xs text-text-muted uppercase font-bold tracking-wider">Stipend</span>
                            <span className="text-sm font-semibold text-brand-success">
                              {internship.stipend?.amount ? `₹${internship.stipend.amount}/mo` : "Unpaid"}
                            </span>
                          </div>
                        </div>

                        <Link
                          href={`/internship/${internship._id}`}
                          className="w-full mt-6 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold py-3 px-4 rounded-xl text-center shadow transition-all block"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}