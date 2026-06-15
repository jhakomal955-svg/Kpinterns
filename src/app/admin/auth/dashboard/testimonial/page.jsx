"use client";

import { useState, useEffect } from "react";

export default function TestimonialAdminPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [message, setMessage] = useState(null);

  // Fetch all testimonials
  const fetchTestimonials = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/admin/testimonial", {
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success) {
        setTestimonials(data.data);
      } else {
        setError(data.error || "Failed to fetch testimonials");
      }
    } catch (err) {
      console.error("Fetch testimonials error:", err);
      setError("An error occurred while fetching testimonials");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  // Update status (Approve / Pending)
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      setMessage(null);
      setError(null);
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/admin/testimonial", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Testimonial status updated to ${newStatus}!`);
        fetchTestimonials();
      } else {
        setError(data.error || "Failed to update status");
      }
    } catch (err) {
      console.error("Status update error:", err);
      setError("An error occurred while updating status");
    }
  };

  // Delete testimonial
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      setMessage(null);
      setError(null);
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`/api/admin/testimonial?id=${id}`, {
        method: "DELETE",
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Testimonial deleted successfully!");
        fetchTestimonials();
      } else {
        setError(data.error || "Failed to delete testimonial");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setError("An error occurred while deleting the testimonial");
    }
  };

  // Filter list based on search term & status filter
  const filteredTestimonials = testimonials.filter((testimonial) => {
    const matchesSearch =
      !searchQuery ||
      testimonial.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      testimonial.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      testimonial.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      testimonial.university?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "All" || testimonial.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-main">Testimonials Moderation</h1>
        <p className="text-text-muted text-sm sm:text-base">
          Review, approve, and manage user testimonials before they are displayed publicly on the landing page.
        </p>
      </div>

      {/* Notifications */}
      {message && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-brand-success flex items-center justify-between text-sm sm:text-base">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="font-bold ml-2">×</button>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 flex items-center justify-between text-sm sm:text-base">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold ml-2">×</button>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-bg-card border-2 border-border-main rounded-2xl p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-muted">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search by student name, university, comment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-bg-main border-2 border-border-main rounded-xl text-text-main placeholder-text-muted focus:border-brand-primary outline-none transition text-sm sm:text-base"
          />
        </div>
        <div className="w-full md:w-64">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl text-text-main focus:border-brand-primary outline-none transition text-sm sm:text-base cursor-pointer"
          >
            <option value="All">All Reviews</option>
            <option value="Pending">Pending Reviews</option>
            <option value="Approved">Approved Reviews</option>
          </select>
        </div>
      </div>

      {/* Main Listing Grid */}
      <div className="bg-bg-card border-2 border-border-main rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-20 text-center text-text-muted">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
            Loading testimonials...
          </div>
        ) : filteredTestimonials.length === 0 ? (
          <div className="py-20 text-center text-text-muted text-sm sm:text-base">
            No testimonials found matching your filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-border-main bg-bg-main text-text-muted text-xs uppercase tracking-wider font-semibold">
                  <th className="py-4 px-6">Student Info</th>
                  <th className="py-4 px-6">Rating</th>
                  <th className="py-4 px-6">Comment / Review Message</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main text-text-main text-sm sm:text-base">
                {filteredTestimonials.map((review) => (
                  <tr key={review._id} className="hover:bg-bg-main/40 transition duration-150">
                    <td className="py-4 px-6 font-medium text-text-main">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary text-white font-extrabold flex items-center justify-center text-sm shadow-sm">
                          {review.name?.charAt(0).toUpperCase() || "S"}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-base">{review.name}</span>
                          <span className="text-xs text-brand-secondary font-bold">{review.role}</span>
                          <span className="text-[11px] text-text-muted font-bold">{review.university}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4.5 h-4.5 ${
                              i < review.rating ? "text-yellow-500 fill-current" : "text-border-main/40"
                            }`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6 max-w-sm">
                      <p className="text-sm text-text-muted leading-relaxed font-semibold">
                        &quot;{review.comment}&quot;
                      </p>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                          review.status === "Approved"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-brand-success"
                            : "bg-amber-500/10 border-amber-500/30 text-amber-500"
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${review.status === "Approved" ? "bg-brand-success" : "bg-amber-500"}`}></span>
                        {review.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-3">
                        {review.status === "Pending" ? (
                          <button
                            onClick={() => handleStatusUpdate(review._id, "Approved")}
                            className="px-3.5 py-1.5 bg-brand-success/15 hover:bg-brand-success text-brand-success hover:text-white border border-brand-success/30 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                            title="Approve Testimonial"
                          >
                            Approve
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusUpdate(review._id, "Pending")}
                            className="px-3.5 py-1.5 bg-amber-500/15 hover:bg-amber-500 text-amber-500 hover:text-white border border-amber-500/30 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                            title="Reject Testimonial"
                          >
                            Reject
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(review._id)}
                          className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Delete Testimonial"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
