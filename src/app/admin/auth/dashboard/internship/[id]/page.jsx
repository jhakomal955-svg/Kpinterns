"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MediaPicker from "@/components/MediaPicker";

export default function InternshipEditPage() {
  const router = useRouter();
  const params = useParams();
  const internshipId = params?.id;
  const isEditing = !!internshipId;

  const [activeTab, setActiveTab] = useState("basics");
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shortDescription: "",
    thumbnail: "",
    position: "",
    department: "Bsc",
    internshipType: "Full-Time",
    mode: "Hybrid",
    duration: "1-month",
    status: "Draft",
    company: "Kpinterns",
    domain: "Other",
    createdBy: "admin",
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
  const internshipTypes = [
    "Full-Time",
    "Part-Time",
    "Summer",
    "Winter",
    "Project-Based",
  ];
  const internshipModes = ["Online", "Offline", "Hybrid"];
  const statuses = ["Draft", "Published", "Active", "Closed", "Archived"];
  const durations = [
    "1-week",
    "2-weeks",
    "1-month",
    "3-months",
    "6-months",
    "1-year",
  ];

  const fetchInternship = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/internship?id=${internshipId}`);
      const data = await res.json();
      if (data.success) {
        const internship = data.data;

        // Load admin ID for fallback
        let loggedInAdminId = "admin";
        if (typeof window !== "undefined") {
          try {
            const stored = localStorage.getItem("adminData");
            if (stored) {
              const parsed = JSON.parse(stored);
              if (parsed && parsed._id) {
                loggedInAdminId = parsed._id;
              }
            }
          } catch (err) {
            console.error(err);
          }
        }

        setFormData({
          title: internship.title || "",
          description: internship.description || "",
          shortDescription: internship.shortDescription || "",
          thumbnail: internship.thumbnail || "",
          position: internship.position || "",
          department: internship.department || "Bsc",
          internshipType: internship.internshipType || "Full-Time",
          mode: internship.mode || "Hybrid",
          duration: internship.duration || "1-month",
          status: internship.status || "Draft",
          company: internship.company || "Kpinterns",
          domain: internship.domain || internship.category || "Other",
          createdBy: (internship.createdBy && internship.createdBy !== "admin")
            ? (typeof internship.createdBy === "object" ? internship.createdBy._id : internship.createdBy)
            : loggedInAdminId,
          tags: Array.isArray(internship.tags) ? internship.tags.join(", ") : "",
          applicationDeadline: internship.applicationDeadline ? internship.applicationDeadline.split("T")[0] : "",
          requirements: Array.isArray(internship.requirements) ? internship.requirements.join(", ") : "",
          skills: Array.isArray(internship.skills) ? internship.skills.join(", ") : "",
          responsibilities: Array.isArray(internship.responsibilities) ? internship.responsibilities.join(", ") : "",
          benefits: Array.isArray(internship.benefits) ? internship.benefits.join(", ") : "",
          perks: Array.isArray(internship.perks) ? internship.perks.join(", ") : "",
          certificateOffered: internship.certificateOffered ?? true,
          stipendAmount: internship.stipend?.amount || "",
          registrationFeeAmount: internship.RegistrationFee?.amount || "",
          contactPersonName: internship.contactPerson?.name || "",
          contactPersonEmail: internship.contactPerson?.email || "",
          contactPersonPhone: internship.contactPerson?.phone || "",
          contactPersonDesignation: internship.contactPerson?.designation || "",
          instructorId: typeof internship.instructor?.[0]?.id === "object" ? internship.instructor[0].id._id : (internship.instructor?.[0]?.id || ""),
          contentItems: internship.content || [],
          updates: internship.updates || [],
        });
      } else {
        setError(data.error || "Failed to load internship");
      }
    } catch (err) {
      setError("Error loading internship: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isEditing) {
      fetchInternship();
    }
  }, [internshipId, isEditing]);

  const handleBasicInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleThumbnailPickerSelect = async (file) => {
    setUploadingThumbnail(true);
    setError(null);
    try {
      const payload = new FormData();
      payload.append("file", file);

      const response = await fetch("/api/cloudinary", {
        method: "POST",
        body: payload,
      });
      const data = await response.json();

      if (data.success) {
        setFormData((prev) => ({
          ...prev,
          thumbnail: data.data.secure_url,
        }));
        setMessage("Banner image processed via MediaPicker successfully!");
      } else {
        setError("Failed to upload thumbnail banner image.");
      }
    } catch (err) {
      setError("Upload error: " + err.message);
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleMediaUpload = async (file) => {
    setUploadingFile(true);
    setError(null);
    try {
      const payload = new FormData();
      payload.append("file", file);

      const response = await fetch("/api/cloudinary", {
        method: "POST",
        body: payload,
      });
      const data = await response.json();

      if (data.success) {
        const fileType = file.type;
        const url = data.data.secure_url;

        if (fileType.includes("image")) {
          setCurrentContentItem((prev) => ({ ...prev, imageurl: url }));
        } else if (fileType.includes("video")) {
          setCurrentContentItem((prev) => ({ ...prev, VideoUrl: url }));
        } else if (fileType.includes("pdf")) {
          setCurrentContentItem((prev) => ({ ...prev, pdfurl: url }));
        }
        setMessage("File uploaded successfully!");
      } else {
        setError("Failed to upload file");
      }
    } catch (err) {
      setError("Upload error: " + err.message);
    } finally {
      setUploadingFile(false);
    }
  };

  const addContentItem = () => {
    if (!currentContentItem.title.trim()) {
      setError("Please enter a content title");
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

    setMessage("Content item added successfully!");
  };

  const removeContentItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      contentItems: prev.contentItems.filter((_, i) => i !== index),
    }));
  };

  const addUpdateItem = () => {
    if (!currentUpdate.title.trim()) {
      setError("Please enter an update title");
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

    setMessage("Update item added successfully!");
  };

  const removeUpdateItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      updates: prev.updates.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    
    if (formData.title.length < 5) {
      setError("Title must be at least 5 characters long");
      return;
    }
    if (formData.description.length < 20) {
      setError("Description must be at least 20 characters long");
      return;
    }
    if (!formData.position) {
      setError("Position is required");
      return;
    }
    if (!formData.department) {
      setError("Department is required");
      return;
    }
    if (!formData.internshipType) {
      setError("Internship Type is required");
      return;
    }
    if (!formData.company) {
      setError("Company is required");
      return;
    }
    if (!formData.domain) {
      setError("Domain is required");
      return;
    }
    if (!formData.instructorId) {
      setError("Instructor ID reference mapping token is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        shortDescription: formData.shortDescription,
        thumbnail: formData.thumbnail,
        position: formData.position,
        department: formData.department,
        internshipType: formData.internshipType,
        mode: formData.mode,
        duration: formData.duration,
        status: formData.status,
        company: formData.company,
        createdBy: formData.createdBy,
        domain: formData.domain,
        certificateOffered: formData.certificateOffered,
        applicationDeadline: formData.applicationDeadline || null,
        instructor: formData.instructorId ? [{ id: formData.instructorId }] : [],
        tags: formData.tags ? formData.tags.split(",").map((item) => item.trim()).filter(Boolean) : [],
        requirements: formData.requirements ? formData.requirements.split(",").map((item) => item.trim()).filter(Boolean) : [],
        skills: formData.skills ? formData.skills.split(",").map((item) => item.trim()).filter(Boolean) : [],
        responsibilities: formData.responsibilities ? formData.responsibilities.split(",").map((item) => item.trim()).filter(Boolean) : [],
        benefits: formData.benefits ? formData.benefits.split(",").map((item) => item.trim()).filter(Boolean) : [],
        perks: formData.perks ? formData.perks.split(",").map((item) => item.trim()).filter(Boolean) : [],
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

      const url = isEditing ? `/api/internship?id=${internshipId}` : "/api/internship";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setMessage(isEditing ? "Internship updated successfully!" : "Internship created successfully!");
        setTimeout(() => {
          router.push("/admin/auth/dashboard/internship");
        }, 1500);
      } else {
        setError(data.error || "Failed to save internship");
      }
    } catch (err) {
      setError("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-text-muted">Loading internship details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-main">
            {isEditing ? "Edit Internship" : "Create Internship"}
          </h1>
          <p className="text-text-muted text-sm sm:text-base">
            Manage internship details, requirements, and multimedia content.
          </p>
        </div>
        <Link
          href="/admin/auth/dashboard/internship"
          className="inline-flex items-center justify-center rounded-xl border border-border-main bg-bg-card px-4 py-2 text-sm font-semibold text-text-main hover:border-brand-primary hover:text-brand-primary transition"
        >
          Back to Internships
        </Link>
      </div>

      {/* Notifications */}
      {message && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-brand-success flex items-center justify-between text-sm sm:text-base">
          <span>{message}</span>
          <button type="button" onClick={() => setMessage(null)} className="font-bold ml-2">×</button>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 flex items-center justify-between text-sm sm:text-base">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="font-bold ml-2">×</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-2 border-b-2 border-border-main mb-4 bg-bg-card rounded-t-2xl p-4">
          <button
            type="button"
            onClick={() => setActiveTab("basics")}
            className={`px-5 py-3 font-semibold transition-all ${activeTab === "basics" ? "border-b-2 border-brand-primary text-brand-primary -mb-4" : "border-transparent text-text-muted hover:text-text-main"}`}
          >
            Basic Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("content")}
            className={`px-5 py-3 font-semibold transition-all ${activeTab === "content" ? "border-b-2 border-brand-primary text-brand-primary -mb-4" : "border-transparent text-text-muted hover:text-text-main"}`}
          >
            Content Items
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("updates")}
            className={`px-5 py-3 font-semibold transition-all ${activeTab === "updates" ? "border-b-2 border-brand-primary text-brand-primary -mb-4" : "border-transparent text-text-muted hover:text-text-main"}`}
          >
            Manage Updates
          </button>
        </div>

        {activeTab === "basics" && (
          <div className="space-y-6 bg-bg-card border-2 border-border-main rounded-2xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Internship Title / Company Intro *</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleBasicInputChange}
                  placeholder="Minimum 5 characters"
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Job Position *</label>
                <input
                  type="text"
                  name="position"
                  required
                  value={formData.position}
                  onChange={handleBasicInputChange}
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
                  onChange={handleBasicInputChange}
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Company Name *</label>
                <input
                  type="text"
                  name="company"
                  required
                  value={formData.company}
                  onChange={handleBasicInputChange}
                  placeholder="e.g. KpInterns"
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Domain *</label>
                <input
                  type="text"
                  name="domain"
                  required
                  value={formData.domain}
                  onChange={handleBasicInputChange}
                  placeholder="e.g. Full Stack Development"
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Short Description</label>
                <input
                  type="text"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleBasicInputChange}
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
                  onChange={handleBasicInputChange}
                  placeholder="Provide responsibilities, requirements, timeline, etc..."
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition font-sans"
                ></textarea>
              </div>

              {/* FIX A: Internship Banner Picked utilizing MediaPicker component on dedicated Edit page */}
              <div className="md:col-span-2 bg-bg-main/40 border border-dashed border-border-main rounded-xl p-4">
                <label className="block text-xs font-bold text-text-muted mb-3 uppercase tracking-wider">Internship Cover Banner Image</label>
                <MediaPicker
                  onFileSelect={handleThumbnailPickerSelect}
                  isUploading={uploadingThumbnail}
                  uploadedItems={[formData.thumbnail].filter(Boolean)}
                  maxSize={10}
                  multiple={false}
                />
                {error && <p className="text-xs text-red-500 mt-2 font-medium">{error}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Internship Type *</label>
                <select
                  name="internshipType"
                  required
                  value={formData.internshipType}
                  onChange={handleBasicInputChange}
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
                  required
                  value={formData.mode}
                  onChange={handleBasicInputChange}
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
                  required
                  value={formData.duration}
                  onChange={handleBasicInputChange}
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                >
                  {durations.map((dur) => (
                    <option key={dur} value={dur}>{dur}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Status *</label>
                <select
                  name="status"
                  required
                  value={formData.status}
                  onChange={handleBasicInputChange}
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
                  onChange={handleBasicInputChange}
                  required
                  placeholder="Paste Admin reference ObjectId"
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Application Deadline</label>
                <input
                  type="date"
                  name="applicationDeadline"
                  value={formData.applicationDeadline}
                  onChange={handleBasicInputChange}
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Tags (comma separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleBasicInputChange}
                  placeholder="e.g. Remote, Paid, Internship"
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Requirements (comma separated)</label>
                <input
                  type="text"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleBasicInputChange}
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
                  onChange={handleBasicInputChange}
                  placeholder="e.g. React, SQL, Teamwork"
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Responsibilities (comma separated)</label>
                <input
                  type="text"
                  name="responsibilities"
                  value={formData.responsibilities}
                  onChange={handleBasicInputChange}
                  placeholder="e.g. Develop features, Test code"
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Benefits (comma separated)</label>
                <input
                  type="text"
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleBasicInputChange}
                  placeholder="e.g. Mentorship, Experience"
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Perks (comma separated)</label>
                <input
                  type="text"
                  name="perks"
                  value={formData.perks}
                  onChange={handleBasicInputChange}
                  placeholder="e.g. Flexible hours, Remote work"
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Stipend Amount</label>
                <input
                  type="text"
                  name="stipendAmount"
                  value={formData.stipendAmount}
                  onChange={handleBasicInputChange}
                  placeholder="e.g. $500/month or Unpaid"
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>

              {/* FIX B: Registration Fee input added to dedicated Edit page */}
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Registration Fee</label>
                <input
                  type="text"
                  name="registrationFeeAmount"
                  value={formData.registrationFeeAmount}
                  onChange={handleBasicInputChange}
                  placeholder="e.g. Free or $25"
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="certificateOffered"
                  id="certificateOffered"
                  checked={formData.certificateOffered}
                  onChange={handleBasicInputChange}
                  className="w-5 h-5"
                />
                <label htmlFor="certificateOffered" className="text-sm font-semibold text-text-main cursor-pointer">
                  Certificate Offered
                </label>
              </div>

              <div className="md:col-span-2">
                <h3 className="text-sm font-semibold text-text-main uppercase tracking-[0.15em] mb-3">Contact Person</h3>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Name</label>
                <input
                  type="text"
                  name="contactPersonName"
                  value={formData.contactPersonName}
                  onChange={handleBasicInputChange}
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
                  onChange={handleBasicInputChange}
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
                  onChange={handleBasicInputChange}
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
                  onChange={handleBasicInputChange}
                  placeholder="HR, Mentor, Coordinator"
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "content" && (
          <div className="space-y-6 bg-bg-card border-2 border-border-main rounded-2xl p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-text-main">Add Content Item</h3>
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
                disabled={uploadingFile || uploadingThumbnail}
                onClick={addContentItem}
                className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingFile || uploadingThumbnail ? "Uploading File..." : "Add Content Item"}
              </button>
            </div>

            {formData.contentItems.length > 0 && (
              <div className="bg-bg-card border-2 border-border-main rounded-2xl p-6 space-y-4">
                <h3 className="text-lg font-bold text-text-main">Content Items ({formData.contentItems.length})</h3>
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
          <div className="space-y-6 bg-bg-card border-2 border-border-main rounded-2xl p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-text-main">Add New Update</h3>
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

        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            disabled={isSubmitting || uploadingFile || uploadingThumbnail}
            onClick={() => router.push("/admin/auth/dashboard/internship")}
            className="px-5 py-2.5 rounded-xl border-2 border-border-main hover:bg-bg-main text-text-main font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || uploadingFile || uploadingThumbnail}
            className="px-6 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 text-white font-semibold shadow transition disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploadingFile || uploadingThumbnail ? "Uploading..." : isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Internship"}
          </button>
        </div>
      </form>
    </div>
  );
}