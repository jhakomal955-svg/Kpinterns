"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import MediaPicker from "@/components/MediaPicker";

export default function CourseEditPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id;
  const isEditing = !!courseId;
  const [activeTab, setActiveTab] = useState("basics");
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shortDescription: "",
    thumbnail: "",
    department: "Bsc",
    domain: "Full Stack Development",
    difficultyLevel: "Beginner",
    language: "English",
    price: 0,
    currency: "INR",
    isFree: true,
    duration: "1-month",
    accessDuration: "lifetime",
    status: "Draft",
    instructor: "",
    prerequisites: "",
    learningOutcomes: "",
    contentItems: [],
    updates: [],
    tags: "",
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

  const departments = ["Bsc", "BTech", "BBA", "BCom", "BA", "BCA", "BScIT", "BScCS", "Other"];
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
  const difficulties = ["Beginner", "Intermediate", "Advanced", "Expert"];
  const accessDurations = ["1-month", "3-months", "6-months", "1-year", "lifetime"];

  const fetchCourse = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/course?id=${courseId}`);
      const data = await res.json();
      if (data.success) {
        const course = data.data;
        setFormData({
          title: course.title || "",
          description: course.description || "",
          shortDescription: course.shortDescription || "",
          thumbnail: course.thumbnail || "",
          department: course.department || "Bsc",
          domain: course.domain || course.category || "Full Stack Development",
          difficultyLevel: course.difficultyLevel || "Beginner",
          language: course.language || "English",
          price: course.price || 0,
          currency: course.currency || "INR",
          isFree: course.isFree ?? true,
          duration: course.duration || "1-month",
          accessDuration: course.accessDuration || "lifetime",
          status: course.status || "Draft",
          instructor: typeof course.instructor?.[0]?.id === "object" ? course.instructor[0].id._id : (course.instructor?.[0]?.id || ""),
          prerequisites: course.prerequisites?.join(", ") || "",
          learningOutcomes: course.learningOutcomes?.join(", ") || "",
          contentItems: course.content || [],
          updates: course.updates || [],
          tags: course.tags?.join(", ") || "",
        });
      } else {
        setError("Failed to load course");
      }
    } catch (err) {
      setError("Error loading course: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isEditing) {
      fetchCourse();
    }
  }, [courseId, isEditing]);

  const handleBasicInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleThumbnailUpload = async (file) => {
    setUploadingFile(true);
    setError(null);
    try {
      const payload = new FormData();
      payload.append("file", file);

      const response = await fetch("/api/cloudinary", { method: "POST", body: payload });
      const data = await response.json();

      if (data.success) {
        setFormData((prev) => ({ ...prev, thumbnail: data.data.secure_url }));
        setMessage("Thumbnail uploaded successfully!");
      } else {
        setError("Failed to upload thumbnail");
      }
    } catch (err) {
      setError("Upload error: " + err.message);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleMediaUpload = async (file) => {
    setUploadingFile(true);
    setError(null);
    try {
      const payload = new FormData();
      payload.append("file", file);

      const response = await fetch("/api/cloudinary", { method: "POST", body: payload });
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
    if (!formData.department) {
      setError("Department is required");
      return;
    }
    if (!formData.domain) {
      setError("Domain is required");
      return;
    }
    if (!formData.instructor) {
      setError("Instructor ID is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        shortDescription: formData.shortDescription,
        thumbnail: formData.thumbnail,
        department: formData.department,
        domain: formData.domain,
        difficultyLevel: formData.difficultyLevel,
        language: formData.language,
        price: Number(formData.price),
        currency: formData.currency,
        isFree: formData.isFree,
        duration: formData.duration,
        accessDuration: formData.accessDuration,
        status: formData.status,
        instructor: formData.instructor ? [{ id: formData.instructor }] : [],
        prerequisites: formData.prerequisites.split(",").map((item) => item.trim()).filter(Boolean),
        learningOutcomes: formData.learningOutcomes.split(",").map((item) => item.trim()).filter(Boolean),
        tags: formData.tags.split(",").map((item) => item.trim()).filter(Boolean),
        content: formData.contentItems,
        updates: formData.updates,
      };

      const url = isEditing ? `/api/course?id=${courseId}` : "/api/course";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setMessage(isEditing ? "Course updated successfully!" : "Course created successfully!");
        setTimeout(() => {
          router.push("/admin/auth/dashboard/course");
        }, 1500);
      } else {
        setError(data.error || "Failed to save course");
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
          <p className="text-text-muted">Loading course...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-main">{isEditing ? "Edit Course" : "Create New Course"}</h1>
          <p className="text-text-muted mt-1">{isEditing ? "Update course details and manage content" : "Add a new course with multimedia content"}</p>
        </div>
        <button type="button" onClick={() => router.back()} className="p-2 rounded-xl hover:bg-bg-card border border-border-main transition-all">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-brand-success flex items-center justify-between">
          <span>{message}</span>
          <button type="button" onClick={() => setMessage(null)} className="font-bold ml-2 opacity-70 hover:opacity-100">×</button>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="font-bold ml-2 opacity-70 hover:opacity-100">×</button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b-2 border-border-main">
        <button type="button" onClick={() => setActiveTab("basics")} className={`px-6 py-3 font-semibold border-b-2 transition-all ${activeTab === "basics" ? "border-brand-primary text-brand-primary" : "border-transparent text-text-muted hover:text-text-main"}`}>
          Basic Details
        </button>
        <button type="button" onClick={() => setActiveTab("content")} className={`px-6 py-3 font-semibold border-b-2 transition-all ${activeTab === "content" ? "border-brand-primary text-brand-primary" : "border-transparent text-text-muted hover:text-text-main"}`}>
          Add Content
        </button>
        <button type="button" onClick={() => setActiveTab("updates")} className={`px-6 py-3 font-semibold border-b-2 transition-all ${activeTab === "updates" ? "border-brand-primary text-brand-primary" : "border-transparent text-text-muted hover:text-text-main"}`}>
          Manage Updates
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {activeTab === "basics" && (
          <div className="bg-bg-card border-2 border-border-main rounded-2xl p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-text-muted mb-2">Course Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleBasicInputChange} placeholder="Enter course title (min 5 characters)" className="w-full p-3 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition" required />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-text-muted mb-2">Description *</label>
                <textarea name="description" value={formData.description} onChange={handleBasicInputChange} placeholder="Enter detailed course description (min 20 characters)" rows="4" className="w-full p-3 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition resize-none" required />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-text-muted mb-2">Short Description</label>
                <input type="text" name="shortDescription" value={formData.shortDescription} onChange={handleBasicInputChange} placeholder="Brief course summary (max 500 characters)" className="w-full p-3 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-text-muted mb-3">Course Thumbnail</label>
                <MediaPicker onFileSelect={handleThumbnailUpload} isUploading={uploadingFile} uploadedItems={formData.thumbnail ? [formData.thumbnail] : []} maxSize={10} multiple={false} />
                {formData.thumbnail && (
                  <button type="button" onClick={() => setFormData((prev) => ({ ...prev, thumbnail: "" }))} className="mt-2 text-sm font-semibold text-red-500 hover:text-red-600 flex items-center gap-1">Clear Thumbnail</button>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-muted mb-2">Instructor ID *</label>
                <input type="text" name="instructor" value={formData.instructor} onChange={handleBasicInputChange} placeholder="Paste Admin reference ObjectId" className="w-full p-3 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition" required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-muted mb-2">Department *</label>
                <select name="department" value={formData.department} onChange={handleBasicInputChange} className="w-full p-3 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition">
                  {departments.map((dept) => <option key={dept} value={dept}>{dept}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-muted mb-2">Domain *</label>
                <select name="domain" value={formData.domain} onChange={handleBasicInputChange} className="w-full p-3 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition">
                  {domains.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-muted mb-2">Difficulty Level</label>
                <select name="difficultyLevel" value={formData.difficultyLevel} onChange={handleBasicInputChange} className="w-full p-3 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition">
                  {difficulties.map((diff) => <option key={diff} value={diff}>{diff}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-muted mb-2">Course Duration</label>
                <select name="duration" value={formData.duration} onChange={handleBasicInputChange} className="w-full p-3 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition">
                  <option value="1-week">1 Week</option>
                  <option value="2-weeks">2 Weeks</option>
                  <option value="1-month">1 Month</option>
                  <option value="3-months">3 Months</option>
                  <option value="6-months">6 Months</option>
                  <option value="1-year">1 Year</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-muted mb-2">Language</label>
                <input type="text" name="language" value={formData.language} onChange={handleBasicInputChange} placeholder="e.g., English" className="w-full p-3 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-muted mb-2">Price (INR)</label>
                <input type="number" name="price" value={formData.price} onChange={handleBasicInputChange} placeholder="0" disabled={formData.isFree} className="w-full p-3 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition disabled:opacity-50" />
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" name="isFree" id="isFree" checked={formData.isFree} onChange={(e) => { const checked = e.target.checked; setFormData((prev) => ({ ...prev, isFree: checked, price: checked ? 0 : prev.price })); }} className="w-5 h-5" />
                <label htmlFor="isFree" className="text-sm font-semibold text-text-main cursor-pointer">Mark as Free</label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-muted mb-2">Access Duration</label>
                <select name="accessDuration" value={formData.accessDuration} onChange={handleBasicInputChange} className="w-full p-3 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition">
                  {accessDurations.map((duration) => <option key={duration} value={duration}>{duration}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-muted mb-2">Status</label>
                <select name="status" value={formData.status} onChange={handleBasicInputChange} className="w-full p-3 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition">
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-text-muted mb-2">Prerequisites (comma-separated)</label>
                <textarea name="prerequisites" value={formData.prerequisites} onChange={handleBasicInputChange} placeholder="e.g., HTML basics, JavaScript fundamentals" rows="2" className="w-full p-3 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition resize-none" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-text-muted mb-2">Learning Outcomes (comma-separated)</label>
                <textarea name="learningOutcomes" value={formData.learningOutcomes} onChange={handleBasicInputChange} placeholder="e.g., Understand core concepts, Build real projects" rows="2" className="w-full p-3 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition resize-none" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-text-muted mb-2">Tags (comma-separated)</label>
                <input type="text" name="tags" value={formData.tags} onChange={handleBasicInputChange} placeholder="e.g., web, frontend, beginners" className="w-full p-3 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition" />
              </div>
            </div>
          </div>
        )}

        {activeTab === "content" && (
          <div className="space-y-6">
            <div className="bg-bg-card border-2 border-border-main rounded-2xl p-6 space-y-6">
              <h3 className="text-xl font-bold text-text-main">Add New Content Item</h3>

              <div>
                <label className="block text-sm font-semibold text-text-muted mb-2">Content Title *</label>
                <input type="text" value={currentContentItem.title} onChange={(e) => setCurrentContentItem((prev) => ({ ...prev, title: e.target.value }))} placeholder="e.g., Chapter 1 - Introduction" className="w-full p-3 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition" />
              </div>

              {/* Added Text Content input block */}
              <div>
                <label className="block text-sm font-semibold text-text-muted mb-2">Text Content / Chapter Notes</label>
                <textarea value={currentContentItem.textContent} onChange={(e) => setCurrentContentItem((prev) => ({ ...prev, textContent: e.target.value }))} placeholder="Write lecture markdown text, code blocks, or notes here..." rows="5" className="w-full p-3 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-muted mb-3">Upload Media Files (Video, PDF, Images)</label>
                <MediaPicker onFileSelect={handleMediaUpload} isUploading={uploadingFile} uploadedItems={[currentContentItem.VideoUrl, currentContentItem.pdfurl, currentContentItem.imageurl].filter(Boolean)} maxSize={100} multiple={true} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-muted mb-2">External Link (Optional)</label>
                <input type="url" value={currentContentItem.externalink} onChange={(e) => setCurrentContentItem((prev) => ({ ...prev, externalink: e.target.value }))} placeholder="https://example.com" className="w-full p-3 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition" />
              </div>

              <button type="button" disabled={uploadingFile} onClick={addContentItem} className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
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
                        <h4 className="font-semibold text-text-main mb-1">{item.title}</h4>
                        {item.textContent && <p className="text-xs text-text-muted truncate max-w-xl mb-2 italic">"{item.textContent}"</p>}
                        <div className="flex flex-wrap gap-2">
                          {item.VideoUrl && <span className="text-xs bg-blue-500/20 text-blue-500 px-2 py-1 rounded-full font-medium">🎬 Video</span>}
                          {item.pdfurl && <span className="text-xs bg-red-500/20 text-red-500 px-2 py-1 rounded-full font-medium">📄 PDF</span>}
                          {item.imageurl && <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded-full font-medium">🖼️ Image</span>}
                          {item.externalink && <span className="text-xs bg-purple-500/20 text-purple-500 px-2 py-1 rounded-full font-medium">🔗 Link</span>}
                        </div>
                      </div>
                      <button type="button" onClick={() => removeContentItem(idx)} className="ml-4 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
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
                <label className="block text-sm font-semibold text-text-muted mb-2">Update Title *</label>
                <input type="text" value={currentUpdate.title} onChange={(e) => setCurrentUpdate((prev) => ({ ...prev, title: e.target.value }))} placeholder="e.g. Syllabus updated for Unit 2" className="w-full p-3 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-muted mb-2">External Link (Optional)</label>
                <input type="url" value={currentUpdate.externalLink} onChange={(e) => setCurrentUpdate((prev) => ({ ...prev, externalLink: e.target.value }))} placeholder="https://example.com/document" className="w-full p-3 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition" />
              </div>
              <button type="button" onClick={addUpdateItem} className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2">
                Add Update Item
              </button>
            </div>

            {formData.updates && formData.updates.length > 0 && (
              <div className="bg-bg-card border-2 border-border-main rounded-2xl p-6 space-y-4">
                <h3 className="text-xl font-bold text-text-main">Course Updates ({formData.updates.length})</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {formData.updates.map((item, idx) => (
                    <div key={idx} className="bg-bg-main border-2 border-border-main rounded-xl p-4 flex items-center justify-between hover:border-brand-primary transition">
                      <div className="flex-1">
                        <h4 className="font-semibold text-text-main mb-1">{item.title}</h4>
                        {item.externalLink && <a href={item.externalLink} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-primary hover:underline truncate max-w-xl block mt-1">{item.externalLink}</a>}
                      </div>
                      <button type="button" onClick={() => removeUpdateItem(idx)} className="ml-4 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-4 pt-6 border-t-2 border-border-main sticky bottom-0 bg-bg-main p-6 rounded-2xl">
          <button type="button" disabled={isSubmitting || uploadingFile} onClick={() => router.back()} className="flex-1 px-6 py-3 border-2 border-border-main text-text-main rounded-xl hover:bg-bg-card transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed">Cancel</button>
          <button type="submit" disabled={isSubmitting || uploadingFile} className="flex-1 px-6 py-3 bg-brand-primary text-white rounded-xl hover:bg-brand-primary/90 disabled:opacity-50 transition font-semibold flex items-center justify-center gap-2 disabled:cursor-not-allowed">
            {uploadingFile ? "Uploading File..." : isSubmitting ? "Saving..." : isEditing ? "Update Course" : "Create Course"}
          </button>
        </div>
      </form>
    </div>
  );
}