"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
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
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedPricing, setSelectedPricing] = useState("all");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/course");
        if (!res.ok) {
          setError(`Server error: ${res.status} ${res.statusText}`);
          return;
        }
        const data = await res.json();
        if (data.success) {
          // Only show published courses
          setCourses(data.data.filter(c => c.status === "Published"));
        } else {
          setError(data.error || "Failed to load courses");
        }
      } catch (err) {
        console.error(err);
        setError("An error occurred while loading courses.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Filter courses based on user choices
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      !searchTerm ||
      course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = !selectedDept || course.department === selectedDept;

    const matchesDifficulty =
      !selectedDifficulty || course.difficultyLevel === selectedDifficulty;

    let matchesPricing = true;
    if (selectedPricing === "free") {
      matchesPricing = course.isFree === true || course.price === 0;
    } else if (selectedPricing === "paid") {
      matchesPricing = course.isFree === false && course.price > 0;
    }

    return (
      matchesSearch &&
      matchesDept &&
      matchesDifficulty &&
      matchesPricing
    );
  });

  return (
    <div className="min-h-screen bg-bg-main text-text-main py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight">
            Explore Our <span className="text-brand-primary">Courses</span>
          </h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Upgrade your skill set with professional learning modules designed by industrial experts.
          </p>
        </div>

        {/* Loading and Error States */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
            <p className="mt-4 text-text-muted">Loading courses...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500 bg-red-500/10 border border-red-500/20 rounded-2xl p-6 max-w-md mx-auto">
            <p className="font-bold">{error}</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 text-text-muted bg-bg-card border-2 border-border-main rounded-2xl max-w-md mx-auto p-8">
            <span className="text-4xl mb-4 block">📚</span>
            <p className="font-semibold">No courses published yet.</p>
            <p className="text-sm mt-1">Check back later or explore other options.</p>
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
                    placeholder="Search courses by title, description, or domain..."
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
                {(searchTerm || selectedDept || selectedDifficulty || selectedPricing !== "all") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedDept("");
                      setSelectedDifficulty("");
                      setSelectedPricing("all");
                    }}
                    className="px-6 py-3 bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-white font-bold rounded-xl transition-all duration-300 text-sm whitespace-nowrap cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {/* Department Filter */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-text-muted">Department</label>
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full px-3 py-2.5 bg-bg-main border-2 border-border-main rounded-xl text-text-main font-semibold text-sm focus:outline-none focus:border-brand-primary transition-all cursor-pointer"
                  >
                    <option value="">All Departments</option>
                    <option value="Technical">Technical</option>
                    <option value="NonTechnical">NonTechnical</option>
                  </select>
                </div>

                {/* Difficulty Level Filter */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-text-muted">Difficulty</label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full px-3 py-2.5 bg-bg-main border-2 border-border-main rounded-xl text-text-main font-semibold text-sm focus:outline-none focus:border-brand-primary transition-all cursor-pointer"
                  >
                    <option value="">All Difficulties</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                {/* Pricing Filter */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-text-muted">Pricing</label>
                  <select
                    value={selectedPricing}
                    onChange={(e) => setSelectedPricing(e.target.value)}
                    className="w-full px-3 py-2.5 bg-bg-main border-2 border-border-main rounded-xl text-text-main font-semibold text-sm focus:outline-none focus:border-brand-primary transition-all cursor-pointer"
                  >
                    <option value="all">All (Free & Paid)</option>
                    <option value="free">Free Only</option>
                    <option value="paid">Paid Only</option>
                  </select>
                </div>
              </div>
              
              {/* Active Filter Badges */}
              {(searchTerm || selectedDept || selectedDifficulty || selectedPricing !== "all") && (
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
                  {selectedDifficulty && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-bg-main border border-border-main rounded-full text-xs font-semibold text-text-main">
                      Difficulty: {selectedDifficulty}
                      <button onClick={() => setSelectedDifficulty("")} className="text-text-muted hover:text-brand-primary cursor-pointer font-bold">✕</button>
                    </span>
                  )}
                  {selectedPricing !== "all" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-bg-main border border-border-main rounded-full text-xs font-semibold text-text-main">
                      Price: {selectedPricing === "free" ? "Free Only" : "Paid Only"}
                      <button onClick={() => setSelectedPricing("all")} className="text-text-muted hover:text-brand-primary cursor-pointer font-bold">✕</button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Results count & status */}
            {filteredCourses.length === 0 ? (
              <div className="text-center py-20 text-text-muted bg-bg-card border-2 border-border-main rounded-2xl max-w-md mx-auto p-8 animate-fade-in">
                <span className="text-4xl mb-4 block">🔍</span>
                <p className="font-semibold text-lg text-text-main mb-2">No courses found matching your criteria</p>
                <p className="text-sm">Try resetting filters or adjusting search queries.</p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedDept("");
                    setSelectedDifficulty("");
                    setSelectedPricing("all");
                  }}
                  className="mt-6 px-5 py-2.5 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold rounded-xl transition-all shadow cursor-pointer text-sm"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6 flex justify-between items-center text-sm text-text-muted font-bold px-2 animate-fade-in">
                  <span>Found {filteredCourses.length} {filteredCourses.length === 1 ? "course" : "courses"}</span>
                </div>

                {/* Courses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredCourses.map((course, index) => (
                    <ScrollReveal
                      key={course._id}
                      className="flex flex-col"
                      direction="up"
                      delay={(index % 3) * 80}
                      duration={600}
                    >
                      <div
                        className="group bg-bg-card border-2 border-border-main rounded-2xl overflow-hidden hover:border-brand-primary hover:shadow-xl transition-all duration-300 flex flex-col flex-1"
                      >
                      {/* Visual Thumbnail representation */}
                      <div className="relative h-48 bg-gradient-to-br from-brand-primary/20 via-brand-secondary/20 to-brand-primary/10 flex items-center justify-center overflow-hidden border-b border-border-main">
                        {course.thumbnail ? (
                          <img 
                            src={course.thumbnail} 
                            alt={course.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350"
                            loading="lazy"
                          />
                        ) : (
                          <>
                            <div className="absolute inset-0 bg-brand-primary/10 group-hover:scale-105 transition-transform duration-350"></div>
                            <span className="text-5xl group-hover:rotate-6 transition-transform duration-350 select-none">🎓</span>
                          </>
                        )}
                        
                        {/* Absolute Badges */}
                        <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
                          <span className="bg-bg-card/90 text-text-main text-[11px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full shadow border border-border-main">
                            {course.department}
                          </span>
                          <span className={`text-white text-[11px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full shadow ${
                            course.difficultyLevel === "Beginner" ? "bg-brand-success" :
                            course.difficultyLevel === "Intermediate" ? "bg-brand-primary" : "bg-orange-500"
                          }`}>
                            {course.difficultyLevel}
                          </span>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-6 flex flex-col flex-1">
                        
                        <h3 className="text-xl font-bold text-text-main group-hover:text-brand-primary transition-colors line-clamp-1 mb-2">
                          {course.title}
                        </h3>
                        
                        <p className="text-text-muted text-sm line-clamp-3 mb-6 flex-1">
                          {course.shortDescription || course.description}
                        </p>

                        {/* Pricing and Access Details */}
                        <div className="flex items-center justify-between pt-4 border-t border-border-main mt-auto">
                          <div className="flex flex-col">
                            <span className="text-xs text-text-muted uppercase font-bold tracking-wider">Price</span>
                            <span className="text-lg font-black text-text-main">
                              {course.isFree ? "Free" : `₹${course.price}`}
                            </span>
                          </div>

                          <div className="flex flex-col text-right">
                            <span className="text-xs text-text-muted uppercase font-bold tracking-wider">Duration</span>
                            <span className="text-sm font-semibold text-text-main capitalize">
                              {course.duration ? course.duration.replace("-", " ") : "1 month"}
                            </span>
                          </div>
                        </div>

                        {(() => {
                          const isEnrolled = userData?.ActiveCources?.some(
                            (c) => (c.course?._id || c.course) === course._id
                          );
                          return (
                            <Link
                              href={`/courses/${course._id}`}
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