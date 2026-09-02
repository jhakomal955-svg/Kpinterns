"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import BranchBadges from "@/components/BranchBadges";
import { DEGREE_LIST as internshipDegrees, ALL_DEPARTMENTS as internshipDepartments } from "@/lib/data/degreeDepartments";

export default function InstructorInternshipsPage() {
  const [internships, setInternships] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [modeFilter, setModeFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [degreeFilter, setDegreeFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [adminData, setAdminData] = useState(null);

  const internshipTypes = [
    "Full-Time",
    "Part-Time",
    "Summer",
    "Winter",
    "Project-Based",
  ];
  const internshipModes = ["Online", "Offline", "Hybrid"];

  const fetchInternships = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("adminToken");
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};

      const res = await fetch("/api/internship", { headers });
      const data = await res.json();
      if (data.success) {
        setInternships(data.data);
      } else {
        setError(data.error || "Failed to fetch internships");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching internships");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("adminData");
        if (stored) {
          setAdminData(JSON.parse(stored));
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchInternships();
  }, []);

  const filteredInternships = internships.filter((internship) => {
    // Show only internships assigned to this instructor
    if (adminData) {
      const isAssigned = internship.instructor?.some((inst) => {
        const instId = typeof inst.id === "object" ? inst.id?._id : inst.id;
        return instId === adminData._id;
      });
      if (!isAssigned) return false;
    }

    const term = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !term ||
      internship.title?.toLowerCase().includes(term) ||
      internship.domain?.toLowerCase().includes(term) ||
      internship.position?.toLowerCase().includes(term) ||
      internship.company?.toLowerCase().includes(term) ||
      internship.shortDescription?.toLowerCase().includes(term) ||
      internship.description?.toLowerCase().includes(term) ||
      (Array.isArray(internship.department)
        ? internship.department.some((d) => d.toLowerCase().includes(term))
        : internship.department?.toLowerCase().includes(term));

    const matchesMode = modeFilter === "All" || internship.mode === modeFilter;
    const matchesType =
      typeFilter === "All" || internship.internshipType === typeFilter;
    const matchesDegree =
      degreeFilter === "All" ||
      (internship.degree &&
        (Array.isArray(internship.degree)
          ? internship.degree.includes(degreeFilter)
          : internship.degree === degreeFilter));
    const matchesDepartment =
      departmentFilter === "All" ||
      (internship.department &&
        (Array.isArray(internship.department)
          ? internship.department.includes(departmentFilter)
          : internship.department === departmentFilter));

    return matchesSearch && matchesMode && matchesType && matchesDegree && matchesDepartment;
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-main">
            My Internships
          </h1>
          <p className="text-text-muted text-sm sm:text-base">
            View and manage coursework and syllabus content for internships assigned to you.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 flex items-center justify-between text-sm sm:text-base">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold ml-2">×</button>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-bg-card border-2 border-border-main rounded-2xl p-4 space-y-4">
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-muted">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search by internship title, domain, role, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-bg-main border-2 border-border-main rounded-xl text-text-main placeholder-text-muted focus:border-brand-primary outline-none transition text-sm sm:text-base"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className="p-2.5 bg-bg-main border-2 border-border-main rounded-xl text-text-main focus:border-brand-primary outline-none transition text-sm"
          >
            <option value="All">All Modes</option>
            {internshipModes.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="p-2.5 bg-bg-main border-2 border-border-main rounded-xl text-text-main focus:border-brand-primary outline-none transition text-sm"
          >
            <option value="All">All Types</option>
            {internshipTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            value={degreeFilter}
            onChange={(e) => setDegreeFilter(e.target.value)}
            className="p-2.5 bg-bg-main border-2 border-border-main rounded-xl text-text-main focus:border-brand-primary outline-none transition text-sm"
          >
            <option value="All">All Degrees</option>
            {internshipDegrees.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="p-2.5 bg-bg-main border-2 border-border-main rounded-xl text-text-main focus:border-brand-primary outline-none transition text-sm"
          >
            <option value="All">All Departments</option>
            {[...new Set(internshipDepartments)].map((dept, index) => (
              <option key={`dept-${dept}-${index}`} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Internships Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-text-muted bg-bg-card border-2 border-border-main rounded-2xl shadow-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
          Loading assigned internships...
        </div>
      ) : filteredInternships.length === 0 ? (
        <div className="py-20 text-center text-text-muted bg-bg-card border-2 border-border-main rounded-2xl shadow-sm text-sm sm:text-base">
          No assigned internships found matching your search filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredInternships.map((internship) => (
            <div
              key={internship._id}
              className="bg-bg-card border-2 border-border-main rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-brand-primary/40 transition duration-300 flex flex-col"
            >
              <div className="aspect-video bg-bg-main relative overflow-hidden group border-b-2 border-border-main">
                {internship.thumbnail ? (
                  <img
                    src={internship.thumbnail}
                    alt={internship.title}
                    className="object-cover w-full h-full transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-text-muted">
                    <svg className="w-12 h-12 mb-2 opacity-55" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4m0 0L10 10m0 0L4 4m0 0v2" />
                    </svg>
                    <span className="text-xs font-semibold">No Internship Banner</span>
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-brand-primary text-white text-xs font-bold py-1 px-3 rounded-full shadow">
                  {internship.internshipType}
                </div>
                <div className="absolute top-3 right-3 bg-brand-secondary text-white text-xs font-bold py-1 px-3 rounded-full shadow">
                  {internship.mode}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div>
                    <BranchBadges department={internship.department} maxVisible={2} />
                    <h3 className="font-bold text-lg text-text-main line-clamp-1">
                      {internship.title || "N/A"}
                    </h3>
                  </div>
                  <h4 className="font-semibold text-sm text-text-muted">
                    {internship.position}
                  </h4>
                  <p className="text-text-muted text-sm line-clamp-3 leading-relaxed">
                    {internship.shortDescription || internship.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-border-main grid grid-cols-1 gap-3 text-sm">
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full bg-bg-main px-3 py-1 text-xs uppercase tracking-wide text-text-muted border border-border-main">
                      {internship.domain || "Other"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs text-text-muted block uppercase font-bold">Company</span>
                      <span className="text-sm font-semibold text-text-main">{internship.company || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-xs text-text-muted block uppercase font-bold">Duration</span>
                      <span className="text-sm font-semibold text-text-main">{internship.duration || "2 Weeks"}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xs text-text-muted block uppercase font-bold">Stipend</span>
                      <span className="text-sm font-semibold text-text-main">{internship.stipend?.amount || "Unpaid"}</span>
                    </div>
                    <div>
                      <span className="text-xs text-text-muted block uppercase font-bold">Reg. Fee</span>
                      <span className="text-sm font-semibold text-text-main">{internship.RegistrationFee?.amount || "Free"}</span>
                    </div>
                  </div>
                  {internship.instructor && internship.instructor.length > 0 && (
                    <div className="flex justify-between items-center text-sm font-bold pt-2.5 border-t border-border-main">
                      <div className="flex flex-col gap-1.5">
                        <span className="font-semibold text-text-muted">Assigned Instructors</span>
                        <div className="flex flex-wrap gap-1.5">
                          {internship.instructor.map((inst, index) => {
                            const name = typeof inst.id === "object" ? inst.id?.name : "Admin";
                            return (
                              <span key={index} className="bg-bg-main border border-border-main text-text-main font-medium rounded px-2.5 py-0.5 text-[10px]">
                                {name}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                      <span className="text-xs bg-gray-500/10 px-2.5 py-0.5 rounded-full border text-text-muted">{internship.status}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-5 py-4 bg-bg-main/50 border-t border-border-main flex items-center justify-end gap-3">
                <Link
                  href={`/admin/auth/instructors/internship/${internship._id}`}
                  className="p-2 px-4 rounded-xl text-blue-500 bg-bg-card border border-border-main hover:border-blue-500/40 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex items-center gap-1.5 font-semibold text-xs sm:text-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit Content
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
