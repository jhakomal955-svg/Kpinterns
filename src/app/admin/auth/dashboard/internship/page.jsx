"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import MediaPicker from "@/components/MediaPicker";

export default function InternshipsAdminPage() {
  const [internships, setInternships] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [modeFilter, setModeFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [message, setMessage] = useState(null);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [activeTab, setActiveTab] = useState("basics");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shortDescription: "",
    thumbnail: "",
    position: "",
    department: "",
    internshipType: "Full-Time",
    mode: "Hybrid",
    duration: "1-month",
    status: "Draft",
    company: "Kpinterns",
    createdBy: "admin",
    domain: "Other",
    tags: "",
    applicationDeadline: "",
    requirements: "",
    skills: "",
    responsibilities: "",
    benefits: "",
    perks: "",
    certificateOffered: true,
    stipendAmount: "",
    registrationFeeAmount: "", // Track registration fee
    contactPersonName: "",
    contactPersonEmail: "",
    contactPersonPhone: "",
    contactPersonDesignation: "",
    instructorId: "",
    contentItems: [],
    updates: [],
  });
  
  const [currentContentItem, setCurrentContentItem] = useState({
    title: "",
    textContent: "",
    VideoUrl: "",
    pdfurl: "",
    imageurl: "",
    externalink: "",
  });

  const [currentUpdate, setCurrentUpdate] = useState({
    title: "",
    externalLink: "",
  });
  
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const internshipTypes = [
    "Full-Time",
    "Part-Time",
    "Summer",
    "Winter",
    "Project-Based",
  ];
  const internshipModes = ["Online", "Offline", "Hybrid"];
  const statuses = ["Draft", "Published", "Active", "Closed", "Archived"];
  const departments = [
    "Bsc",
    "BTech",
    "BBA",
    "BCom",
    "BA",
    "BCA",
    "BScIT",
    "BScCS",
    "Other",
  ];

  const fetchInternships = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/internship");
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
    fetchInternships();

    // Load admin ID for createdBy fallback
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("adminData");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed._id) {
            setFormData((prev) => ({ ...prev, createdBy: parsed._id }));
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleThumbnailPickerSelect = async (file) => {
    setUploadError(null);
    setUploadingThumbnail(true);
    try {
      const payload = new FormData();
      payload.append("file", file);

      const response = await fetch("/api/cloudinary", {
        method: "POST",
        body: payload,
      });
      const data = await response.json();

      if (!data.success) {
        setUploadError(data.error || "Banner thumbnail upload failed");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        thumbnail: data.data.secure_url,
      }));
      setMessage("Banner image loaded via MediaPicker successfully.");
    } catch (err) {
      console.error(err);
      setUploadError("Failed to upload thumbnail banner image.");
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleMediaUpload = async (file) => {
    setUploadError(null);
    setUploadingFile(true);
    try {
      const payload = new FormData();
      payload.append("file", file);

      const response = await fetch("/api/cloudinary", {
        method: "POST",
        body: payload,
      });
      const data = await response.json();

      if (!data.success) {
        setUploadError(data.error || "Upload failed");
        return;
      }

      const fileType = file.type;
      const url = data.data.secure_url;
      setCurrentContentItem((prev) => ({
        ...prev,
        imageurl: fileType.includes("image") ? url : prev.imageurl,
        VideoUrl: fileType.includes("video") ? url : prev.VideoUrl,
        pdfurl: fileType.includes("pdf") ? url : prev.pdfurl,
      }));
      setMessage("Media item processed cleanly.");
    } catch (err) {
      console.error(err);
      setUploadError("Failed to upload content module resource file.");
    } finally {
      setUploadingFile(false);
    }
  };

  const addContentItem = () => {
    if (!currentContentItem.title.trim()) {
      setUploadError("Please provide a title for the content item.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      contentItems: [...prev.contentItems, currentContentItem],
    }));
    setCurrentContentItem({
      title: "",
      textContent: "",
      VideoUrl: "",
      pdfurl: "",
      imageurl: "",
      externalink: "",
    });
    setMessage("Content block attached.");
  };

  const removeContentItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      contentItems: prev.contentItems.filter((_, i) => i !== index),
    }));
  };

  const addUpdateItem = () => {
    if (!currentUpdate.title.trim()) {
      setError("Please provide a title for the update.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      updates: [...(prev.updates || []), currentUpdate],
    }));
    setCurrentUpdate({
      title: "",
      externalLink: "",
    });
    setMessage("Internship update item added.");
  };

  const removeUpdateItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      updates: prev.updates.filter((_, i) => i !== index),
    }));
  };

  const openAddModal = () => {
    setIsEditing(false);
    setSelectedId(null);
    setActiveTab("basics");

    let adminId = "admin";
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("adminData");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed._id) {
            adminId = parsed._id;
          }
        }
      } catch (err) {
        console.error(err);
      }
    }

    setFormData({
      title: "",
      description: "",
      shortDescription: "",
      thumbnail: "",
      position: "",
      department: "",
      internshipType: "Full-Time",
      mode: "Hybrid",
      status: "Draft",
      company: "Kpinterns",
      createdBy: adminId,
      domain: "Other",
      duration: "1-month",
      tags: "",
      applicationDeadline: "",
      requirements: "",
      skills: "",
      responsibilities: "",
      benefits: "",
      perks: "",
      certificateOffered: true,
      stipendAmount: "",
      registrationFeeAmount: "",
      contactPersonName: "",
      contactPersonEmail: "",
      contactPersonPhone: "",
      contactPersonDesignation: "",
      instructorId: "",
      contentItems: [],
      updates: [],
    });
    setCurrentContentItem({
      title: "",
      textContent: "",
      VideoUrl: "",
      pdfurl: "",
      imageurl: "",
      externalink: "",
    });
    setCurrentUpdate({
      title: "",
      externalLink: "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setMessage(null);
      setError(null);

      if (formData.title.length < 5) {
        setError("Title must be at least 5 characters long");
        return;
      }
      if (formData.description.length < 20) {
        setError("Description must be at least 20 characters long");
        return;
      }
      if (!formData.position) {
        setError("Job position role is required");
        return;
      }
      if (!formData.instructorId) {
        setError("Instructor ID reference mapping token is required");
        return;
      }

      const url = "/api/internship";
      const method = "POST";
      const payload = {
        title: formData.title,
        position: formData.position,
        description: formData.description,
        shortDescription: formData.shortDescription,
        thumbnail: formData.thumbnail,
        department: formData.department,
        internshipType: formData.internshipType,
        mode: formData.mode,
        duration: formData.duration,
        status: formData.status,
        company: formData.company,
        createdBy: formData.createdBy,
        domain: formData.domain,
        certificateOffered: formData.certificateOffered,
        tags: formData.tags ? formData.tags.split(",").map((item) => item.trim()).filter(Boolean) : [],
        requirements: formData.requirements ? formData.requirements.split(",").map((item) => item.trim()).filter(Boolean) : [],
        skills: formData.skills ? formData.skills.split(",").map((item) => item.trim()).filter(Boolean) : [],
        responsibilities: formData.responsibilities ? formData.responsibilities.split(",").map((item) => item.trim()).filter(Boolean) : [],
        benefits: formData.benefits ? formData.benefits.split(",").map((item) => item.trim()).filter(Boolean) : [],
        perks: formData.perks ? formData.perks.split(",").map((item) => item.trim()).filter(Boolean) : [],
        applicationDeadline: formData.applicationDeadline || null,
        instructor: [{ id: formData.instructorId }],
        stipend: {
          amount: formData.stipendAmount,
        },
        RegistrationFee: {
          amount: formData.registrationFeeAmount || "0",
        },
        contactPerson: {
          name: formData.contactPersonName,
          email: formData.contactPersonEmail,
          phone: formData.contactPersonPhone,
          designation: formData.contactPersonDesignation,
        },
        content: formData.contentItems,
        updates: formData.updates,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("Internship listing created successfully!");
        setShowModal(false);
        fetchInternships();
      } else {
        setError(data.error || "Failed to save internship");
      }
    } catch (err) {
      setError("An error occurred while saving the internship");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this internship?"))
      return;
    try {
      const res = await fetch(`/api/internship?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Internship deleted successfully!");
        fetchInternships();
      } else {
        setError(data.error || "Failed to delete internship");
      }
    } catch (err) {
      setError("An error occurred while deleting the internship");
    }
  };

  const filteredInternships = internships.filter((internship) => {
    const term = searchQuery.toLowerCase();
    const matchesSearch =
      internship.title?.toLowerCase().includes(term) ||
      internship.description?.toLowerCase().includes(term) ||
      internship.position?.toLowerCase().includes(term) ||
      internship.department?.toLowerCase().includes(term);

    const matchesMode = modeFilter === "All" || internship.mode === modeFilter;
    const matchesType =
      typeFilter === "All" || internship.internshipType === typeFilter;

    return matchesSearch && matchesMode && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-main">
            Manage Internships
          </h1>
          <p className="text-text-muted text-sm sm:text-base">
            Create, view, update, and manage professional student internship offers.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-2.5 px-4 rounded-xl shadow transition duration-200 flex items-center justify-center gap-2 self-start sm:self-auto text-sm sm:text-base"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Internship
        </button>
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
      <div className="bg-bg-card border-2 border-border-main rounded-2xl p-4 flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-muted">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search by position, department, title, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-bg-main border-2 border-border-main rounded-xl text-text-main placeholder-text-muted focus:border-brand-primary outline-none transition text-sm sm:text-base"
          />
        </div>
        <div className="grid grid-cols-2 gap-4 w-full lg:w-96">
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
        </div>
      </div>

      {/* Internships Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-text-muted bg-bg-card border-2 border-border-main rounded-2xl shadow-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
          Loading internships list...
        </div>
      ) : filteredInternships.length === 0 ? (
        <div className="py-20 text-center text-text-muted bg-bg-card border-2 border-border-main rounded-2xl shadow-sm text-sm sm:text-base">
          No internship offers found matching the search filters.
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
                    <span className="text-xs uppercase font-extrabold text-brand-secondary tracking-wider">
                      {internship.department}
                    </span>
                    <h3 className="font-bold text-lg text-text-main line-clamp-1">
                      {internship.position || "N/A"}
                    </h3>
                  </div>
                  <h4 className="font-semibold text-sm text-text-muted">
                    {internship.title}
                  </h4>
                  <p className="text-text-muted text-sm line-clamp-3 leading-relaxed">
                    {internship.shortDescription || internship.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-border-main grid grid-cols-1 gap-3 text-sm">
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full bg-bg-main px-3 py-1 text-xs uppercase tracking-wide text-text-muted border border-border-main">
                      {internship.domain || internship.category || "Other"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs text-text-muted block uppercase font-bold">Company</span>
                      <span className="text-sm font-semibold text-text-main">{internship.company || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-xs text-text-muted block uppercase font-bold">Deadline</span>
                      <span className="text-sm font-semibold text-text-main">
                        {internship.applicationDeadline ? new Date(internship.applicationDeadline).toLocaleDateString() : "Not set"}
                      </span>
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
                  {internship.instructor?.[0]?.id && (
                    <div className="pt-2.5 border-t border-border-main space-y-1 text-xs">
                      <div className="flex items-center justify-between font-medium">
                        <span className="font-semibold text-text-muted">Instructor</span>
                        <span className="text-text-main font-semibold text-right truncate max-w-[150px]" title={typeof internship.instructor[0].id === "object" ? internship.instructor[0].id.name : ""}>
                          {typeof internship.instructor[0].id === "object"
                            ? internship.instructor[0].id.name || "Admin"
                            : "Admin"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between font-medium">
                        <span className="font-semibold text-text-muted text-[10px] uppercase">ID</span>
                        <span className="font-mono text-[10px] bg-bg-main px-1.5 py-0.5 rounded border border-border-main truncate max-w-[170px] select-all" title={typeof internship.instructor[0].id === "object" ? internship.instructor[0].id._id : internship.instructor[0].id}>
                          {typeof internship.instructor[0].id === "object"
                            ? internship.instructor[0].id._id
                            : internship.instructor[0].id}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-5 py-4 bg-bg-main/50 border-t border-border-main flex items-center justify-end gap-3">
                <Link
                  href={`/admin/auth/dashboard/internship/${internship._id}`}
                  className="p-2 rounded-xl text-blue-500 bg-bg-card border border-border-main hover:border-blue-500/40 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex items-center gap-1.5 font-semibold text-xs sm:text-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(internship._id)}
                  className="p-2 rounded-xl text-red-500 bg-bg-card border border-border-main hover:border-red-500/40 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center gap-1.5 font-semibold text-xs sm:text-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Internship Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-bg-card border-2 border-border-main rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-border-main flex items-center justify-between bg-bg-main">
              <h2 className="text-lg sm:text-xl font-bold text-text-main">Add Internship Offer</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-border-main transition-colors text-text-muted hover:text-text-main"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-sm sm:text-base">
              <div className="flex gap-2 border-b-2 border-border-main mb-4">
                <button
                  type="button"
                  onClick={() => setActiveTab("basics")}
                  className={`px-5 py-3 font-semibold transition-all ${activeTab === "basics" ? "border-b-2 border-brand-primary text-brand-primary" : "border-transparent text-text-muted hover:text-text-main"}`}
                >
                  Basic Details
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("content")}
                  className={`px-5 py-3 font-semibold transition-all ${activeTab === "content" ? "border-b-2 border-brand-primary text-brand-primary" : "border-transparent text-text-muted hover:text-text-main"}`}
                >
                  Content Items
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("updates")}
                  className={`px-5 py-3 font-semibold transition-all ${activeTab === "updates" ? "border-b-2 border-brand-primary text-brand-primary" : "border-transparent text-text-muted hover:text-text-main"}`}
                >
                  Manage Updates
                </button>
              </div>

              {activeTab === "basics" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Internship Title / Company Intro *</label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Minimum 5 characters"
                      className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Job Position Role *</label>
                    <input
                      type="text"
                      name="position"
                      required
                      value={formData.position}
                      onChange={handleInputChange}
                      placeholder="e.g. Frontend Developer"
                      className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Department / Stream *</label>
                    <select
                      name="department"
                      required
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Short Description (1 line summary)</label>
                    <input
                      type="text"
                      name="shortDescription"
                      value={formData.shortDescription}
                      onChange={handleInputChange}
                      placeholder="Brief 1-line overview..."
                      className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Full Description *</label>
                    <textarea
                      name="description"
                      required
                      rows="4"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Provide responsibilities, requirements, timeline, etc..."
                      className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition font-sans"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Internship Domain *</label>
                    <input
                      type="text"
                      name="domain"
                      required
                      value={formData.domain}
                      onChange={handleInputChange}
                      placeholder="e.g. Full Stack Development"
                      className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Tags (comma separated)</label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="e.g. Remote, Paid, Internship"
                      className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Application Deadline</label>
                    <input
                      type="date"
                      name="applicationDeadline"
                      value={formData.applicationDeadline}
                      onChange={handleInputChange}
                      className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Requirements (comma separated)</label>
                    <input
                      type="text"
                      name="requirements"
                      value={formData.requirements}
                      onChange={handleInputChange}
                      placeholder="e.g. HTML, CSS, Communication"
                      className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Skills (comma separated)</label>
                    <input
                      type="text"
                      name="skills"
                      value={formData.skills}
                      onChange={handleInputChange}
                      placeholder="e.g. React, SQL, Teamwork"
                      className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Internship Type *</label>
                    <select
                      name="internshipType"
                      value={formData.internshipType}
                      onChange={handleInputChange}
                      className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                    >
                      {internshipTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Work Mode *</label>
                    <select
                      name="mode"
                      value={formData.mode}
                      onChange={handleInputChange}
                      className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                    >
                      {internshipModes.map((mode) => (
                        <option key={mode} value={mode}>{mode}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Internship Duration *</label>
                    <select
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                    >
                      <option value="1-week">1 Week</option>
                      <option value="2-weeks">2 Weeks</option>
                      <option value="1-month">1 Month</option>
                      <option value="3-months">3 Months</option>
                      <option value="6-months">6 Months</option>
                      <option value="1-year">1 Year</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Status *</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Instructor Admin Reference ID *</label>
                    <input
                      type="text"
                      name="instructorId"
                      value={formData.instructorId}
                      onChange={handleInputChange}
                      required
                      placeholder="Paste Admin reference ObjectId"
                      className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                    />
                  </div>

                  {/* FIX A: Internship Banner Picked utilizing MediaPicker component */}
                  <div className="md:col-span-2 bg-bg-main/40 border border-dashed border-border-main rounded-xl p-4">
                    <label className="block text-xs font-bold text-text-muted mb-3 uppercase tracking-wider">Internship Cover Banner Image</label>
                    <MediaPicker
                      onFileSelect={handleThumbnailPickerSelect}
                      isUploading={uploadingThumbnail}
                      uploadedItems={[formData.thumbnail].filter(Boolean)}
                      maxSize={10}
                      multiple={false}
                    />
                    {uploadError && <p className="mt-2 text-xs text-red-500 font-medium">{uploadError}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Stipend Description</label>
                    <input
                      type="text"
                      name="stipendAmount"
                      value={formData.stipendAmount}
                      onChange={handleInputChange}
                      placeholder="e.g. $500/month or Unpaid"
                      className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                    />
                  </div>

                  {/* FIX B: Registration Fee input added to modal layout */}
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Registration Fee</label>
                    <input
                      type="text"
                      name="registrationFeeAmount"
                      value={formData.registrationFeeAmount}
                      onChange={handleInputChange}
                      placeholder="e.g. Free or $25"
                      className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                    />
                  </div>

                  <div className="flex items-center gap-3 md:col-span-2">
                    <label className="flex items-center gap-2 text-xs uppercase font-semibold text-text-muted">
                      <input
                        type="checkbox"
                        name="certificateOffered"
                        checked={formData.certificateOffered}
                        onChange={handleInputChange}
                        className="w-4 h-4 rounded border-border-main text-brand-primary"
                      />
                      Certificate Offered
                    </label>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Company Name *</label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="e.g. KpInterns"
                      className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <h3 className="text-sm font-semibold text-text-main uppercase tracking-[0.15em] mb-2">Contact Person</h3>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Name</label>
                    <input
                      type="text"
                      name="contactPersonName"
                      value={formData.contactPersonName}
                      onChange={handleInputChange}
                      placeholder="Contact name"
                      className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Email</label>
                    <input
                      type="email"
                      name="contactPersonEmail"
                      value={formData.contactPersonEmail}
                      onChange={handleInputChange}
                      placeholder="email@example.com"
                      className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Phone</label>
                    <input
                      type="text"
                      name="contactPersonPhone"
                      value={formData.contactPersonPhone}
                      onChange={handleInputChange}
                      placeholder="+1234567890"
                      className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Designation</label>
                    <input
                      type="text"
                      name="contactPersonDesignation"
                      value={formData.contactPersonDesignation}
                      onChange={handleInputChange}
                      placeholder="HR, Mentor, Coordinator"
                      className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                    />
                  </div>
                </div>
              )}

              {activeTab === "content" && (
                <div className="space-y-6">
                  <div className="bg-bg-card border-2 border-border-main rounded-2xl p-6 space-y-6">
                    <h3 className="text-xl font-bold text-text-main">Add Content Item</h3>
                    <div>
                      <label className="block text-xs font-semibold text-text-muted mb-2 uppercase">Content Title *</label>
                      <input
                        type="text"
                        value={currentContentItem.title}
                        onChange={(e) => setCurrentContentItem((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g. Company Project Overview"
                        className="w-full p-3 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-text-muted mb-2 uppercase">Text Description / Notes</label>
                      <textarea
                        rows="3"
                        value={currentContentItem.textContent || ""}
                        onChange={(e) => setCurrentContentItem((prev) => ({ ...prev, textContent: e.target.value }))}
                        placeholder="Provide modules written materials, text descriptions or requirements..."
                        className="w-full p-3 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition font-sans"
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-text-muted mb-3 uppercase">Upload Media Files (Video, PDF, Image)</label>
                      <MediaPicker
                        onFileSelect={handleMediaUpload}
                        isUploading={uploadingFile}
                        uploadedItems={[currentContentItem.VideoUrl, currentContentItem.pdfurl, currentContentItem.imageurl].filter(Boolean)}
                        maxSize={100}
                        multiple={true}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-text-muted mb-2 uppercase">External Link (Optional)</label>
                      <input
                        type="url"
                        value={currentContentItem.externalink}
                        onChange={(e) => setCurrentContentItem((prev) => ({ ...prev, externalink: e.target.value }))}
                        placeholder="https://example.com"
                        className="w-full p-3 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={uploadingFile}
                      onClick={addContentItem}
                      className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploadingFile ? "Uploading File..." : "Add Content Item"}
                    </button>
                  </div>

                  {formData.contentItems.length > 0 && (
                    <div className="bg-bg-card border-2 border-border-main rounded-2xl p-6 space-y-4">
                      <h3 className="text-xl font-bold text-text-main">Content Items ({formData.contentItems.length})</h3>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {formData.contentItems.map((item, idx) => (
                          <div key={idx} className="bg-bg-main border-2 border-border-main rounded-xl p-4 flex items-start justify-between hover:border-brand-primary transition">
                            <div className="flex-1">
                              <h4 className="font-semibold text-text-main mb-2">{item.title}</h4>
                              <div className="flex flex-wrap gap-2">
                                {item.textContent && <span className="text-xs bg-amber-500/20 text-amber-600 px-2 py-1 rounded-full font-medium">📝 Text Notes</span>}
                                {item.VideoUrl && <span className="text-xs bg-blue-500/20 text-blue-500 px-2 py-1 rounded-full font-medium">🎬 Video</span>}
                                {item.pdfurl && <span className="text-xs bg-red-500/20 text-red-500 px-2 py-1 rounded-full font-medium">📄 PDF</span>}
                                {item.imageurl && <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded-full font-medium">🖼️ Image</span>}
                                {item.externalink && <span className="text-xs bg-purple-500/20 text-purple-500 px-2 py-1 rounded-full font-medium">🔗 Link</span>}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeContentItem(idx)}
                              className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "updates" && (
                <div className="space-y-6">
                  <div className="bg-bg-card border-2 border-border-main rounded-2xl p-6 space-y-6">
                    <h3 className="text-xl font-bold text-text-main">Add New Update</h3>
                    <div>
                      <label className="block text-xs font-semibold text-text-muted mb-2 uppercase">Update Title *</label>
                      <input
                        type="text"
                        value={currentUpdate.title}
                        onChange={(e) => setCurrentUpdate((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g. Schedule for interview released"
                        className="w-full p-3 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-text-muted mb-2 uppercase">External Link (Optional)</label>
                      <input
                        type="url"
                        value={currentUpdate.externalLink}
                        onChange={(e) => setCurrentUpdate((prev) => ({ ...prev, externalLink: e.target.value }))}
                        placeholder="https://example.com"
                        className="w-full p-3 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addUpdateItem}
                      className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
                    >
                      Add Update Item
                    </button>
                  </div>

                  {formData.updates && formData.updates.length > 0 && (
                    <div className="bg-bg-card border-2 border-border-main rounded-2xl p-6 space-y-4">
                      <h3 className="text-xl font-bold text-text-main">Internship Updates ({formData.updates.length})</h3>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {formData.updates.map((item, idx) => (
                          <div key={idx} className="bg-bg-main border-2 border-border-main rounded-xl p-4 flex items-center justify-between hover:border-brand-primary transition">
                            <div className="flex-1">
                              <h4 className="font-semibold text-text-main mb-1">{item.title}</h4>
                              {item.externalLink && <a href={item.externalLink} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-primary hover:underline truncate max-w-xl block mt-1">{item.externalLink}</a>}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeUpdateItem(idx)}
                              className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-main">
                <button
                  type="button"
                  disabled={uploadingThumbnail || uploadingFile}
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border-2 border-border-main hover:bg-bg-main text-text-main font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingThumbnail || uploadingFile}
                  className="px-6 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold shadow transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploadingThumbnail || uploadingFile ? "Uploading..." : "Create Offer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}