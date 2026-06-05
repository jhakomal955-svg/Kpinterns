"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import MediaPicker from "@/components/MediaPicker";

export default function CoursesAdminPage() {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [domainFilter, setDomainFilter] = useState("All");
  const [message, setMessage] = useState(null);
  const [activeTab, setActiveTab] = useState("basics");

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shortDescription: "",
    thumbnail: "",
    department: "",
    domain: "Full Stack Development",
    difficultyLevel: "Beginner",
    price: 0,
    isFree: false,
    status: "Draft",
    language: "English",
    duration: "1-month",
    accessDuration: "lifetime",
    instructorId: "",
    prerequisites: "",
    learningOutcomes: "",
    tags: "",
    contentItems: [],
    updates: [],
  });

  const [currentContentItem, setCurrentContentItem] = useState({
    title: "",
    textContent: "", // <--- Synced into layout object defaults
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
  const [uploadError, setUploadError] = useState(null);

  const domains = [
    "Full Stack Development",
    "Frontend Development",
    "Backend Development",
    "Mobile App Development",
    "Data Science & Machine Learning",
    "DevOps & Cloud Computing",
    "Cybersecurity",
    "IoT & Embedded Systems",
    "Artificial Intelligence",
    "Blockchain Development",
    "Game Development",
    "Web3 & Cryptocurrency",
    "Other Tech",
    "Finance & Accounting",
    "Human Resources",
    "Marketing & Branding",
    "Sales & Business Development",
    "Management Consulting",
    "Supply Chain Management",
    "Operations Management",
    "Other Business",
    "Public Relations",
    "Event Management",
    "Journalism & Media",
    "Tourism & Hospitality",
    "Legal Services",
    "Content Writing",
    "Graphic Design",
    "Other"
  ];
  const departments = ["Bsc", "BTech", "BBA", "BCom", "BA", "BCA", "BScIT", "BScCS", "Other"];

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
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleThumbnailFileSelect = async (file) => {
    setUploadError(null);
    setUploadingThumbnail(true);
    try {
      const payload = new FormData();
      payload.append("file", file);

      const response = await fetch("/api/cloudinary", { method: "POST", body: payload });
      const data = await response.json();

      if (!data.success) {
        setUploadError(data.error || "Upload failed");
        return;
      }

      setFormData((prev) => ({ ...prev, thumbnail: data.data.secure_url }));
      setMessage("Thumbnail uploaded successfully!");
    } catch (err) {
      console.error(err);
      setUploadError("Failed to upload thumbnail image layout.");
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleContentFileSelect = async (file) => {
    setUploadError(null);
    setUploadingThumbnail(true);
    try {
      const payload = new FormData();
      payload.append("file", file);

      const response = await fetch("/api/cloudinary", { method: "POST", body: payload });
      const data = await response.json();

      if (!data.success) {
        setUploadError(data.error || "Upload failed");
        return;
      }

      const fileType = file.type;
      const fileUrl = data.data.secure_url;
      setCurrentContentItem((prev) => ({
        ...prev,
        ...(fileType.includes("image") && { imageurl: fileUrl }),
        ...(fileType.includes("video") && { VideoUrl: fileUrl }),
        ...(fileType.includes("pdf") && { pdfurl: fileUrl }),
      }));
      setMessage("Content media uploaded successfully.");
    } catch (err) {
      console.error(err);
      setUploadError("Failed to upload content file.");
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const addContentItem = () => {
    if (!currentContentItem.title.trim()) {
      setError("Please provide a title for the content item.");
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
    setMessage("Course content item added.");
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
    setMessage("Course update item added.");
  };

  const removeUpdateItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      updates: prev.updates.filter((_, i) => i !== index),
    }));
  };

  const openAddModal = () => {
    setFormData({
      title: "",
      description: "",
      shortDescription: "",
      thumbnail: "",
      department: "",
      domain: "Full Stack Development",
      difficultyLevel: "Beginner",
      price: 0,
      isFree: false,
      status: "Draft",
      language: "English",
      duration: "1-month",
      accessDuration: "lifetime",
      instructorId: "",
      prerequisites: "",
      learningOutcomes: "",
      tags: "",
      contentItems: [],
      updates: [],
    });
    setCurrentUpdate({
      title: "",
      externalLink: "",
    });
    setUploadError(null);
    setActiveTab("basics");
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
      if (!formData.department) {
        setError("Department is required");
        return;
      }
      if (!formData.instructorId) {
        setError("Instructor ID reference mapping token is required");
        return;
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        shortDescription: formData.shortDescription,
        thumbnail: formData.thumbnail,
        department: formData.department,
        domain: formData.domain,
        difficultyLevel: formData.difficultyLevel,
        price: formData.isFree ? 0 : Number(formData.price),
        isFree: formData.isFree,
        status: formData.status,
        language: formData.language,
        duration: formData.duration,
        accessDuration: formData.accessDuration,
        prerequisites: formData.prerequisites.split(",").map((item) => item.trim()).filter(Boolean),
        learningOutcomes: formData.learningOutcomes.split(",").map((item) => item.trim()).filter(Boolean),
        tags: formData.tags.split(",").map((item) => item.trim()).filter(Boolean),
        instructor: [{ id: formData.instructorId }],
        content: formData.contentItems,
        updates: formData.updates,
      };

      const res = await fetch("/api/course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("Course created successfully!");
        setShowModal(false);
        fetchCourses();
      } else {
        setError(data.error || "Failed to save course");
      }
    } catch (err) {
      setError("An error occurred while saving the course");
    }
  };

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
    const term = searchQuery.toLowerCase();
    const matchesSearch = course.title?.toLowerCase().includes(term) || course.description?.toLowerCase().includes(term) || (course.domain || course.category)?.toLowerCase().includes(term);
    const matchesDomain = domainFilter === "All" || (course.domain || course.category) === domainFilter;
    return matchesSearch && matchesDomain;
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-main">Manage Courses</h1>
          <p className="text-text-muted text-sm sm:text-base">Create, view, update, and publish multimedia course listings.</p>
        </div>
        <button type="button" onClick={openAddModal} className="bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-2.5 px-4 rounded-xl shadow transition duration-200 flex items-center justify-center gap-2 self-start sm:self-auto text-sm sm:text-base">
          Add New Course
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-bg-card border-2 border-border-main rounded-2xl p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-muted">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </span>
          <input type="text" placeholder="Search by course title or keywords..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-bg-main border-2 border-border-main rounded-xl text-text-main placeholder-text-muted focus:border-brand-primary outline-none transition text-sm sm:text-base" />
        </div>
        <div className="w-full md:w-64">
          <select value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)} className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl text-text-main focus:border-brand-primary outline-none transition text-sm sm:text-base">
            <option value="All">All Domains</option>
            {domains.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      {/* Courses List Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-text-muted bg-bg-card border-2 border-border-main rounded-2xl shadow-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
          Loading platform courses...
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
                {course.instructor?.[0]?.id && (
                  <div className="text-xs text-text-muted border-t border-border-main pt-2.5 space-y-1">
                    <div className="flex items-center justify-between font-medium">
                      <span className="font-semibold text-text-muted">Instructor</span>
                      <span className="text-text-main font-semibold">
                        {typeof course.instructor[0].id === "object"
                          ? course.instructor[0].id.name || "Admin"
                          : "Admin"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-medium">
                      <span className="font-semibold text-text-muted text-[10px] uppercase">ID</span>
                      <span className="font-mono text-[10px] bg-bg-main px-1.5 py-0.5 rounded border border-border-main truncate max-w-[170px] select-all" title={typeof course.instructor[0].id === "object" ? course.instructor[0].id._id : course.instructor[0].id}>
                        {typeof course.instructor[0].id === "object"
                          ? course.instructor[0].id._id
                          : course.instructor[0].id}
                      </span>
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
                <button type="button" onClick={() => handleDelete(course._id)} className="p-2 rounded-xl text-red-500 bg-bg-card border border-border-main hover:bg-red-50 text-xs font-semibold">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Course Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-bg-card border-2 border-border-main rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-border-main flex items-center justify-between bg-bg-main">
              <h2 className="text-lg sm:text-xl font-bold text-text-main">Add New Course</h2>
              <button type="button" onClick={() => setShowModal(false)} className="p-1 rounded-lg text-text-muted hover:text-text-main">×</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-sm sm:text-base">
              <div className="flex items-center gap-3 border-b border-border-main pb-4">
                <button type="button" onClick={() => setActiveTab("basics")} className={`px-4 py-2 rounded-full transition ${activeTab === "basics" ? "bg-brand-primary text-white" : "bg-bg-main text-text-muted"}`}>Basic Details</button>
                <button type="button" onClick={() => setActiveTab("content")} className={`px-4 py-2 rounded-full transition ${activeTab === "content" ? "bg-brand-primary text-white" : "bg-bg-main text-text-muted"}`}>Add Content</button>
                <button type="button" onClick={() => setActiveTab("updates")} className={`px-4 py-2 rounded-full transition ${activeTab === "updates" ? "bg-brand-primary text-white" : "bg-bg-main text-text-muted"}`}>Manage Updates</button>
              </div>

              {activeTab === "basics" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Course Title *</label>
                    <input type="text" name="title" required value={formData.title} onChange={handleInputChange} className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Description *</label>
                    <textarea name="description" required rows="4" value={formData.description} onChange={handleInputChange} className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl outline-none font-sans" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Short Summary Description</label>
                    <input type="text" name="shortDescription" value={formData.shortDescription} onChange={handleInputChange} className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Course Thumbnail Image</label>
                    <MediaPicker onFileSelect={handleThumbnailFileSelect} isUploading={uploadingThumbnail} uploadedItems={formData.thumbnail ? [formData.thumbnail] : []} onRemoveItem={() => setFormData((prev) => ({ ...prev, thumbnail: "" }))} maxSize={10} multiple={false} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Prerequisites (comma separated)</label>
                    <input type="text" name="prerequisites" value={formData.prerequisites} onChange={handleInputChange} className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Learning Outcomes (comma separated)</label>
                    <input type="text" name="learningOutcomes" value={formData.learningOutcomes} onChange={handleInputChange} className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Tags (comma separated)</label>
                    <input type="text" name="tags" value={formData.tags} onChange={handleInputChange} className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Department *</label>
                    <select name="department" value={formData.department} onChange={handleInputChange} required className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl outline-none">
                      <option value="">Select Department</option>
                      {departments.map((dept) => <option key={dept} value={dept}>{dept}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Instructor Admin Reference ID *</label>
                    <input type="text" name="instructorId" value={formData.instructorId} onChange={handleInputChange} required className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Domain *</label>
                    <select name="domain" value={formData.domain} onChange={handleInputChange} className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl outline-none">
                      {domains.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Difficulty Level *</label>
                    <select name="difficultyLevel" value={formData.difficultyLevel} onChange={handleInputChange} className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl outline-none">
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Course Duration *</label>
                    <select name="duration" value={formData.duration} onChange={handleInputChange} className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl outline-none">
                      <option value="1-week">1 Week</option>
                      <option value="2-weeks">2 Weeks</option>
                      <option value="1-month">1 Month</option>
                      <option value="3-months">3 Months</option>
                      <option value="6-months">6 Months</option>
                      <option value="1-year">1 Year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Access Duration *</label>
                    <select name="accessDuration" value={formData.accessDuration} onChange={handleInputChange} className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl outline-none">
                      <option value="lifetime">Lifetime</option>
                      <option value="1-month">1 Month</option>
                      <option value="3-months">3 Months</option>
                      <option value="6-months">6 Months</option>
                      <option value="1-year">1 Year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Language *</label>
                    <input type="text" name="language" required value={formData.language} onChange={handleInputChange} className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Status</label>
                    <select name="status" value={formData.status} onChange={handleInputChange} className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl outline-none">
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Course Price (INR)</label>
                    <input type="number" name="price" min="0" disabled={formData.isFree} value={formData.isFree ? 0 : formData.price} onChange={handleInputChange} className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl outline-none disabled:opacity-50" />
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" name="isFree" id="modalIsFree" checked={formData.isFree} onChange={(e) => { const checked = e.target.checked; setFormData((prev) => ({ ...prev, isFree: checked, price: checked ? 0 : prev.price })); }} className="w-5 h-5" />
                    <label htmlFor="modalIsFree" className="text-sm font-semibold text-text-main cursor-pointer">Mark as Free</label>
                  </div>
                </div>
              )}

              {activeTab === "content" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Content Item Title *</label>
                      <input type="text" value={currentContentItem.title} onChange={(e) => setCurrentContentItem((prev) => ({ ...prev, title: e.target.value }))} className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl outline-none" />
                    </div>

                    {/* Added Text Content input block in creation modal */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Text Content / Chapter Notes</label>
                      <textarea value={currentContentItem.textContent} onChange={(e) => setCurrentContentItem((prev) => ({ ...prev, textContent: e.target.value }))} placeholder="Write raw textbook notes, descriptions, or text info here..." rows="4" className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl outline-none focus:border-brand-primary" />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Attach Media Files</label>
                      <MediaPicker onFileSelect={handleContentFileSelect} isUploading={uploadingThumbnail} uploadedItems={[currentContentItem.imageurl, currentContentItem.VideoUrl, currentContentItem.pdfurl].filter(Boolean)} onRemoveItem={(index) => { const activeKeys = ["imageurl", "VideoUrl", "pdfurl"].filter(k => currentContentItem[k]); setCurrentContentItem((prev) => ({ ...prev, [activeKeys[index]]: "" })); }} maxSize={100} multiple={true} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">External Link</label>
                      <input type="url" value={currentContentItem.externalink} onChange={(e) => setCurrentContentItem((prev) => ({ ...prev, externalink: e.target.value }))} className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl outline-none" />
                    </div>
                    <div className="md:col-span-2">
                      <button type="button" disabled={uploadingThumbnail} onClick={addContentItem} className="w-full bg-brand-primary text-white font-semibold py-3 rounded-xl hover:bg-brand-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed">
                        {uploadingThumbnail ? "Uploading media..." : "Add Content Item"}
                      </button>
                    </div>
                  </div>

                  {formData.contentItems.length > 0 && (
                    <div className="space-y-3 bg-bg-card border-2 border-border-main rounded-2xl p-5">
                      <h3 className="text-lg font-semibold text-text-main">Content Items ({formData.contentItems.length})</h3>
                      <div className="space-y-3">
                        {formData.contentItems.map((item, idx) => (
                          <div key={idx} className="border border-border-main rounded-2xl p-4 flex flex-col gap-3 bg-bg-main">
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-semibold text-text-main">{item.title}</span>
                              <button type="button" onClick={() => removeContentItem(idx)} className="text-red-500 hover:text-red-600 text-sm">Remove</button>
                            </div>
                            {item.textContent && <p className="text-xs text-text-muted truncate max-w-xl italic">"{item.textContent}"</p>}
                            <div className="flex flex-wrap gap-2 text-xs">
                              {item.VideoUrl && <span className="bg-blue-500/10 text-blue-500 rounded-full px-2 py-1">🎬 Video</span>}
                              {item.pdfurl && <span className="bg-red-500/10 text-red-500 rounded-full px-2 py-1">📄 PDF</span>}
                              {item.imageurl && <span className="bg-green-500/10 text-green-500 rounded-full px-2 py-1">🖼️ Image</span>}
                              {item.externalink && <span className="bg-purple-500/10 text-purple-500 rounded-full px-2 py-1">🔗 External link</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "updates" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Update Title *</label>
                      <input type="text" placeholder="e.g. Syllabus updated for Unit 2" value={currentUpdate.title} onChange={(e) => setCurrentUpdate((prev) => ({ ...prev, title: e.target.value }))} className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl outline-none" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">External Link (Optional)</label>
                      <input type="url" placeholder="https://example.com/document" value={currentUpdate.externalLink} onChange={(e) => setCurrentUpdate((prev) => ({ ...prev, externalLink: e.target.value }))} className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl outline-none" />
                    </div>
                    <div className="md:col-span-2">
                      <button type="button" onClick={addUpdateItem} className="w-full bg-brand-primary text-white font-semibold py-3 rounded-xl hover:bg-brand-primary/90 transition">Add Update Item</button>
                    </div>
                  </div>

                  {formData.updates && formData.updates.length > 0 && (
                    <div className="space-y-3 bg-bg-card border-2 border-border-main rounded-2xl p-5">
                      <h3 className="text-lg font-semibold text-text-main">Course Updates ({formData.updates.length})</h3>
                      <div className="space-y-3">
                        {formData.updates.map((item, idx) => (
                          <div key={idx} className="border border-border-main rounded-2xl p-4 flex items-center justify-between gap-3 bg-bg-main">
                            <div className="flex-1">
                              <span className="font-semibold text-text-main block">{item.title}</span>
                              {item.externalLink && <a href={item.externalLink} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-primary hover:underline truncate max-w-xl block mt-1">{item.externalLink}</a>}
                            </div>
                            <button type="button" onClick={() => removeUpdateItem(idx)} className="text-red-500 hover:text-red-600 text-sm font-semibold">Remove</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-main">
                <button type="button" disabled={uploadingThumbnail} onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl border-2 border-border-main text-text-main font-semibold disabled:opacity-50 disabled:cursor-not-allowed">Cancel</button>
                <button type="submit" disabled={uploadingThumbnail} className="px-6 py-2.5 rounded-xl bg-brand-primary text-white font-semibold shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {uploadingThumbnail ? "Uploading File..." : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}