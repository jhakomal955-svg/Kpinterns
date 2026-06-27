"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";

// ─── Enums matching the Internship model exactly ──────────────────────────────

const DEGREES = ["BTech", "Diploma", "BSc", "BA", "BCom"];

const DEPARTMENTS_BY_DEGREE = {
  BTech: [
    "Computer Science & Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
    "Electronics & Communication",
    "Chemical Engineering",
  ],
  Diploma: [
    "Computer Science & Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
    "Electronics & Communication",
    "Chemical Engineering",
  ],
  BSc: [
    "Physics",
    "Chemistry",
    "Mathematics",
    "Statistics",
    "Botany",
    "Zoology",
    "Microbiology",
    "Biotechnology",
    "Biochemistry",
    "Computer Science",
    "Data Science",
    "Agriculture",
    "Nursing",
    "Forensic Science",
  ],
  BA: [
    "Humanities",
    "Social Sciences",
    "Languages",
    "Arts & Media",
    "Vocational/Applied",
  ],
  BCom: [
    "Accounting & Finance",
    "Business Administration",
    "Banking & Insurance",
    "Taxation",
    "Economics",
    "Sales & Marketing",
    "Computer Applications",
  ],
};

// All departments (for when no degree is selected)
const ALL_DEPARTMENTS = [
  "Computer Science & Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electrical Engineering",
  "Electronics & Communication",
  "Chemical Engineering",
  "Physics",
  "Chemistry",
  "Mathematics",
  "Statistics",
  "Botany",
  "Zoology",
  "Microbiology",
  "Biotechnology",
  "Biochemistry",
  "Computer Science",
  "Data Science",
  "Agriculture",
  "Nursing",
  "Forensic Science",
  "Humanities",
  "Social Sciences",
  "Languages",
  "Arts & Media",
  "Vocational/Applied",
  "Accounting & Finance",
  "Business Administration",
  "Banking & Insurance",
  "Taxation",
  "Economics",
  "Sales & Marketing",
  "Computer Applications",
  "General Teacher Training",
  "Civil Law",
  "Criminal Law",
  "Corporate Law",
];

const DOMAINS_BY_DEPARTMENT = {
  "Computer Science & Engineering": [
    "Web Development", "🤖 Machine Learning", "🧠 Artificial Intelligence",
    "📊 Data Science", "🔒 Cyber Security", "☁️ Cloud Computing", "📱 Android Development",
    "Full Stack Development", "Frontend Development", "Backend Development",
    "Mobile App Development", "Data Science & Machine Learning", "Artificial Intelligence",
    "DevOps & Cloud Computing", "Cybersecurity", "Blockchain Development",
    "Web3 & Cryptocurrency", "Game Development", "IoT & Embedded Systems",
    "Software Testing & QA", "Database Administration", "UI/UX Design", "Other Tech",
  ],
  "Mechanical Engineering": [
    "AutoCAD", "🚗 Car Designing", "🚒 IC Engine", "🚜 Hybrid Electric Vehicle", "🛠️ SolidWorks",
    "Product Design & Development", "CAD/CAM Design", "Manufacturing & Production",
    "Automobile Engineering", "Thermal & HVAC Engineering", "Robotics & Automation",
    "Quality Control & Inspection", "Industrial Engineering", "Maintenance Engineering",
    "Energy & Power Systems", "3D Printing & Additive Manufacturing",
    "Project Management (Mechanical)", "Other Mechanical",
  ],
  "Civil Engineering": [
    "AutoCAD", "🏗️ Construction Planning", "🏢 Revit Architecture", "🛠️ SolidWorks",
    "🎨 3ds Max", "🏭 Industrial Training",
    "Structural Engineering", "Construction Management", "Urban Planning & Design",
    "Geotechnical Engineering", "Transportation Engineering", "Water Resources & Irrigation",
    "Environmental Engineering", "Surveying & GIS", "Building Information Modelling (BIM)",
    "Project Management (Civil)", "Other Civil",
  ],
  "Electrical Engineering": [
    "Internet of Things (IoT)", "🤖 Robotics", "🔌 VLSI Design", "🖲️ Embedded Systems",
    "Power Systems & Grid Engineering", "Renewable Energy & Solar",
    "Control Systems & Automation", "Electrical Machine Design",
    "High Voltage & Power Electronics", "PLC & SCADA Programming",
    "Instrumentation & Measurement", "EV & Battery Technology",
    "Electrical Project Management", "Other Electrical",
  ],
  "Electronics & Communication": [
    "Internet of Things (IoT)", "🤖 Robotics", "🔌 VLSI Design", "🖲️ Embedded Systems",
    "Embedded Systems & IoT", "VLSI Design", "PCB Design & Prototyping",
    "Signal Processing", "Telecommunications & Networking", "RF & Microwave Engineering",
    "Consumer Electronics Testing", "Firmware Development", "Other Electronics",
  ],
  "Chemical Engineering": [
    "Process Engineering", "Petroleum & Refinery", "Pharmaceutical Manufacturing",
    "Polymer & Materials Science", "Food Technology", "Environmental & Safety Engineering",
    "Quality Assurance (Chemical)", "Research & Development (Chemical)", "Other Chemical",
  ],
  "Data Science": [
    "Data Analysis & Visualization", "Machine Learning Engineering", "Business Intelligence",
    "Data Engineering & Pipelines", "AI Research", "Statistical Modelling", "Other Data Science",
  ],
  "Biotechnology": [
    "Molecular Biology Research", "Pharmaceutical Biotechnology", "Agricultural Biotechnology",
    "Bioinformatics", "Environmental Biotechnology", "Other Biotechnology",
  ],
  "Microbiology": [
    "Clinical Microbiology", "Food & Beverage Microbiology",
    "Research & Development (Micro)", "Quality Control (Lab)", "Other Life Sciences",
  ],
  "Biochemistry": [
    "Clinical Research", "Pharmaceutical R&D", "Nutrition & Dietetics", "Other Life Sciences",
  ],
  "Zoology": [
    "Wildlife Conservation", "Veterinary Support", "Other Life Sciences",
  ],
  "Botany": [
    "Plant Research", "Horticulture", "Pharmaceutical Botany", "Other Life Sciences",
  ],
  "Physics": [
    "Research & Development", "Instrumentation", "Renewable Energy",
    "Quantitative Finance", "Other Sciences",
  ],
  "Chemistry": [
    "Analytical Chemistry", "Research & Development", "Quality Control (Lab)", "Other Sciences",
  ],
  "Mathematics": [
    "Actuarial Science", "Quantitative Finance", "Statistical Modelling",
    "Market Research", "Other Sciences",
  ],
  "Statistics": [
    "Statistical Modelling", "Market Research", "Data Analysis & Visualization",
    "Actuarial Science", "Other Sciences",
  ],
  "Agriculture": [
    "Agribusiness Management", "Agricultural Research", "Rural Development",
    "Agricultural Biotechnology", "Other Agriculture",
  ],
  "Nursing": [
    "Clinical Nursing", "Community Health", "Hospital Administration", "Other Healthcare",
  ],
  "Forensic Science": [
    "Crime Investigation Support", "Lab Analysis", "Legal Services", "Other Forensic",
  ],
  "Accounting & Finance": [
    "💰 Finance", "📉 Stock Market",
    "Financial Analysis", "Accounting & Audit", "Taxation", "Investment Banking",
    "Financial Modelling", "Other Finance",
  ],
  "Business Administration": [
    "📊 Business Analytics", "👥 Human Resource Management",
    "General Management", "Operations Management", "Project Management",
    "Entrepreneurship", "Other Business",
  ],
  "Banking & Insurance": [
    "Banking Operations", "Insurance Sales & Advisory", "Risk Management",
    "Loan Processing", "Other Finance",
  ],
  "Taxation": [
    "GST & Indirect Taxation", "Direct Taxation", "Tax Audit & Compliance", "Other Finance",
  ],
  "Economics": [
    "Economic Research & Policy", "Financial Analysis", "Market Research", "Other Economics",
  ],
  "Sales & Marketing": [
    "Marketing", "📱 Digital Marketing",
    "Digital Marketing", "Content Marketing", "Sales & Business Development",
    "Brand Management", "Social Media Marketing", "Other Marketing",
  ],
  "Computer Applications": [
    "Full Stack Development", "Frontend Development", "Backend Development",
    "Mobile App Development", "UI/UX Design", "Other Tech",
  ],
  "Humanities": [
    "Content Writing", "Journalism & Media", "Public Relations",
    "Event Management", "Social Work & NGO", "Other Humanities",
  ],
  "Social Sciences": [
    "Public Policy Research", "Community Development", "Social Work & NGO",
    "Other Social Sciences",
  ],
  "Languages": [
    "Translation & Interpretation", "Teaching & Tutoring", "Content Writing",
    "Journalism & Media", "Other Languages",
  ],
  "Arts & Media": [
    "Graphic Design", "Photography & Videography", "Animation & VFX",
    "Film Production", "UI/UX Design", "Other Media",
  ],
  "Vocational/Applied": [
    "Tourism & Hospitality", "Retail Management", "Other Vocational",
  ],
};

// All domains (for when no department is selected)
const ALL_DOMAINS = Array.from(
  new Set(Object.values(DOMAINS_BY_DEPARTMENT).flat())
).sort();

export default function InternshipsPage() {
  const [internships, setInternships] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const userJson = localStorage.getItem("userData");
    if (userJson) {
      try {
        setUserData(JSON.parse(userJson));
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
  }, []);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDegree, setSelectedDegree] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedMode, setSelectedMode] = useState("");
  const [selectedStipend, setSelectedStipend] = useState("all");

  useEffect(() => {
    const fetchInternships = async () => {
      try {
        const res = await fetch("/api/internship");
        if (!res.ok) {
          setError(`Server error: ${res.status} ${res.statusText}`);
          return;
        }
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

  // Cascade: available departments based on selected degree
  const availableDepartments = useMemo(() => {
    if (!selectedDegree) return ALL_DEPARTMENTS;
    return DEPARTMENTS_BY_DEGREE[selectedDegree] || ALL_DEPARTMENTS;
  }, [selectedDegree]);

  // Cascade: available domains based on selected department
  const availableDomains = useMemo(() => {
    if (!selectedDept) return ALL_DOMAINS;
    return DOMAINS_BY_DEPARTMENT[selectedDept] || ALL_DOMAINS;
  }, [selectedDept]);

  // When degree changes, reset department & domain if they're no longer valid
  const handleDegreeChange = (value) => {
    setSelectedDegree(value);
    const depts = value ? (DEPARTMENTS_BY_DEGREE[value] || []) : ALL_DEPARTMENTS;
    if (selectedDept && !depts.includes(selectedDept)) {
      setSelectedDept("");
      setSelectedDomain("");
    }
  };

  // When department changes, reset domain if it's no longer valid
  const handleDeptChange = (value) => {
    setSelectedDept(value);
    const domains = value ? (DOMAINS_BY_DEPARTMENT[value] || []) : ALL_DOMAINS;
    if (selectedDomain && !domains.includes(selectedDomain)) {
      setSelectedDomain("");
    }
  };

  const resetAll = () => {
    setSearchTerm("");
    setSelectedDegree("");
    setSelectedDept("");
    setSelectedDomain("");
    setSelectedType("");
    setSelectedMode("");
    setSelectedStipend("all");
  };

  const hasActiveFilters =
    searchTerm || selectedDegree || selectedDept || selectedDomain ||
    selectedType || selectedMode || selectedStipend !== "all";

  // Filter internships based on user choices (client-side)
  const filteredInternships = internships.filter((internship) => {
    const matchesSearch =
      !searchTerm ||
      internship.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.domain?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDegree =
      !selectedDegree ||
      (Array.isArray(internship.degree)
        ? internship.degree.includes(selectedDegree)
        : internship.degree === selectedDegree);
    const matchesDept =
      !selectedDept ||
      (Array.isArray(internship.department)
        ? internship.department.includes(selectedDept)
        : internship.department === selectedDept);
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
      matchesDegree &&
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
                    id="internship-search"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by title, position, company, or domain..."
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
                {hasActiveFilters && (
                  <button
                    onClick={resetAll}
                    className="px-6 py-3 bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-white font-bold rounded-xl transition-all duration-300 text-sm whitespace-nowrap cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
              </div>

              {/* Row 1: Degree · Department · Domain */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {/* Degree Filter */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="filter-degree" className="text-xs font-extrabold uppercase tracking-wider text-text-muted">
                    Degree
                  </label>
                  <select
                    id="filter-degree"
                    value={selectedDegree}
                    onChange={(e) => handleDegreeChange(e.target.value)}
                    className="w-full px-3 py-2.5 bg-bg-main border-2 border-border-main rounded-xl text-text-main font-semibold text-sm focus:outline-none focus:border-brand-primary transition-all cursor-pointer"
                  >
                    <option value="">All Degrees</option>
                    {DEGREES.map((deg) => (
                      <option key={deg} value={deg}>{deg}</option>
                    ))}
                  </select>
                </div>

                {/* Department Filter */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="filter-dept" className="text-xs font-extrabold uppercase tracking-wider text-text-muted">
                    Department
                  </label>
                  <select
                    id="filter-dept"
                    value={selectedDept}
                    onChange={(e) => handleDeptChange(e.target.value)}
                    className="w-full px-3 py-2.5 bg-bg-main border-2 border-border-main rounded-xl text-text-main font-semibold text-sm focus:outline-none focus:border-brand-primary transition-all cursor-pointer"
                  >
                    <option value="">All Departments</option>
                    {availableDepartments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                {/* Domain Filter */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="filter-domain" className="text-xs font-extrabold uppercase tracking-wider text-text-muted">
                    Domain
                  </label>
                  <select
                    id="filter-domain"
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    className="w-full px-3 py-2.5 bg-bg-main border-2 border-border-main rounded-xl text-text-main font-semibold text-sm focus:outline-none focus:border-brand-primary transition-all cursor-pointer"
                  >
                    <option value="">All Domains</option>
                    {availableDomains.map((domain) => (
                      <option key={domain} value={domain}>{domain}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Type · Mode · Compensation */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Internship Type Filter */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="filter-type" className="text-xs font-extrabold uppercase tracking-wider text-text-muted">
                    Type
                  </label>
                  <select
                    id="filter-type"
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
                  <label htmlFor="filter-mode" className="text-xs font-extrabold uppercase tracking-wider text-text-muted">
                    Mode
                  </label>
                  <select
                    id="filter-mode"
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
                  <label htmlFor="filter-stipend" className="text-xs font-extrabold uppercase tracking-wider text-text-muted">
                    Compensation
                  </label>
                  <select
                    id="filter-stipend"
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
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-border-main/50 animate-fade-in">
                  {searchTerm && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-bg-main border border-border-main rounded-full text-xs font-semibold text-text-main">
                      Search: &quot;{searchTerm}&quot;
                      <button onClick={() => setSearchTerm("")} className="text-text-muted hover:text-brand-primary cursor-pointer font-bold">✕</button>
                    </span>
                  )}
                  {selectedDegree && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-bg-main border border-border-main rounded-full text-xs font-semibold text-text-main">
                      Degree: {selectedDegree}
                      <button onClick={() => handleDegreeChange("")} className="text-text-muted hover:text-brand-primary cursor-pointer font-bold">✕</button>
                    </span>
                  )}
                  {selectedDept && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-bg-main border border-border-main rounded-full text-xs font-semibold text-text-main">
                      Dept: {selectedDept}
                      <button onClick={() => handleDeptChange("")} className="text-text-muted hover:text-brand-primary cursor-pointer font-bold">✕</button>
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
                  onClick={resetAll}
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
                      className="flex flex-col"
                      direction="up"
                      delay={(index % 3) * 80}
                      duration={600}
                    >
                      <div
                        className="group bg-bg-card border-2 border-border-main rounded-2xl overflow-hidden hover:border-brand-primary hover:shadow-xl transition-all duration-300 flex flex-col flex-1"
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
                            {Array.isArray(internship.degree) ? internship.degree.join(", ") : internship.degree}
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

                        <span className="text-sm font-semibold text-text-muted mb-1 block">
                          🏢 {internship.company || "KpInterns"}
                        </span>

                        <span className="text-xs font-semibold text-text-muted mb-4 block line-clamp-1" title={Array.isArray(internship.department) ? internship.department.join(", ") : internship.department}>
                          📚 {Array.isArray(internship.department) ? internship.department.join(", ") : internship.department}
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

                        {(() => {
                          const isEnrolled = userData?.ActiveInternship?.some(
                            (i) => (i.internship?._id || i.internship) === internship._id
                          );
                          return (
                            <Link
                              href={`/internship/${internship._id}`}
                              className={`w-full mt-6 font-bold py-3 px-4 rounded-xl text-center shadow transition-all block ${
                                isEnrolled
                                  ? "bg-brand-success hover:bg-brand-success/95 text-white"
                                  : "bg-brand-primary hover:bg-brand-primary/95 text-white"
                              }`}
                            >
                              {isEnrolled ? "Start Learning" : "View Details"}
                            </Link>
                          );
                        })()}
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