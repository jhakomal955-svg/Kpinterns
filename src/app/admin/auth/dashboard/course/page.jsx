"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function CoursesAdminPage() {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [message, setMessage] = useState(null);
  const [adminData, setAdminData] = useState(null);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/course");
      const data = await res.json();
      if (data.success) {
        setCourses(data.data);
      } else {
        setError(data.error || "Failed to fetch courses");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching courses");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("adminData");
        if (stored) {
          setAdminData(JSON.parse(stored));
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      const res = await fetch(`/api/course?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setMessage("Course deleted successfully!");
        fetchCourses();
      } else {
        setError(data.error || "Failed to delete course");
      }
    } catch (err) {
      setError("An error occurred while deleting the course");
    }
  };

  const filteredCourses = courses.filter((course) => {
    if (adminData?.role === "Instructor") {
      const isAssigned = course.instructor?.some((inst) => {
        const instId = typeof inst.id === "object" ? inst.id?._id : inst.id;
        return instId === adminData._id;
      });
      if (!isAssigned) return false;
    }

    const term = searchQuery.toLowerCase();
    const matchesSearch = course.title?.toLowerCase().includes(term) || course.description?.toLowerCase().includes(term);
    const matchesDept = deptFilter === "All" || course.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-main">Manage Courses</h1>
          <p className="text-text-muted text-sm sm:text-base">Create, view, update, and publish multimedia course listings.</p>
        </div>
        {adminData?.role !== "Instructor" && (
          <Link href="/admin/auth/dashboard/course/create" className="bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-2.5 px-4 rounded-xl shadow transition duration-200 flex items-center justify-center gap-2 self-start sm:self-auto text-sm sm:text-base">
            Add New Course
          </Link>
        )}
      </div>

      {/* Notifications */}
      {message && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-brand-success flex items-center justify-between text-sm">
          <span>{message}</span>
          <button type="button" onClick={() => setMessage(null)} className="font-bold ml-2">×</button>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 flex items-center justify-between text-sm">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="font-bold ml-2">×</button>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-bg-card border-2 border-border-main rounded-2xl p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-muted">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </span>
          <input type="text" placeholder="Search by course title or keywords..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-bg-main border-2 border-border-main rounded-xl text-text-main placeholder-text-muted focus:border-brand-primary outline-none transition text-sm sm:text-base" />
        </div>
        <div className="w-full md:w-64">
          <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl text-text-main focus:border-brand-primary outline-none transition text-sm sm:text-base">
            <option value="All">All Departments</option>
            <option value="Technical">Technical</option>
            <option value="NonTechnical">NonTechnical</option>
          </select>
        </div>
      </div>

      {/* Courses List Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-text-muted bg-bg-card border-2 border-border-main rounded-2xl shadow-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
          Loading platform courses...
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="py-20 text-center text-text-muted bg-bg-card border-2 border-border-main rounded-2xl shadow-sm text-sm">
          No courses found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course._id} className="bg-bg-card border-2 border-border-main rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-brand-primary/40 transition duration-300 flex flex-col">
              {/* Card Thumbnail Area */}
              <div className="aspect-video bg-bg-main relative overflow-hidden group border-b-2 border-border-main">
                {course.thumbnail ? <img src={course.thumbnail} alt={course.title} className="object-cover w-full h-full transition duration-300 group-hover:scale-105" /> : <div className="w-full h-full flex flex-col items-center justify-center text-text-muted"><span className="text-xs font-semibold">No Preview Thumbnail</span></div>}
              </div>

              {/* Card Context Content Info */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-bold text-lg text-text-main line-clamp-2">{course.title}</h3>
                  <p className="text-text-muted text-sm line-clamp-3">{course.shortDescription || course.description}</p>
                </div>
                {course.instructor && course.instructor.length > 0 && (
                  <div className="text-xs text-text-muted border-t border-border-main pt-2.5 space-y-2">
                    <div className="flex flex-col gap-1.5">
                      <span className="font-semibold text-text-muted">Assigned Instructors</span>
                      <div className="flex flex-wrap gap-1.5">
                        {course.instructor.map((inst, index) => {
                          const name = typeof inst.id === "object" ? inst.id?.name : "Admin";
                          return (
                            <span key={index} className="bg-bg-main border border-border-main text-text-main font-medium rounded px-2.5 py-0.5 text-[10px]">
                              {name}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm font-bold pt-2.5 border-t border-border-main">
                  <span className={course.isFree ? "text-brand-success" : "text-text-main"}>{course.isFree ? "Free" : `INR ${course.price}`}</span>
                  <span className="text-xs bg-gray-500/10 px-2.5 py-0.5 rounded-full border text-text-muted">{course.status}</span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-5 py-4 bg-bg-main/50 border-t border-border-main flex items-center justify-end gap-3">
                <Link href={`/admin/auth/dashboard/course/${course._id}`} className="p-2 rounded-xl text-blue-500 bg-bg-card border border-border-main hover:bg-blue-50 text-xs font-semibold">Edit</Link>
                {adminData?.role !== "Instructor" && (
                  <button type="button" onClick={() => handleDelete(course._id)} className="p-2 rounded-xl text-red-500 bg-bg-card border border-border-main hover:bg-red-50 text-xs font-semibold">Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}