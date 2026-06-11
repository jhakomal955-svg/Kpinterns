"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MediaPicker from "@/components/MediaPicker";

export default function InternshipCreatePage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("basics");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [adminsList, setAdminsList] = useState([]);
  const [adminData, setAdminData] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shortDescription: "",
    thumbnail: "",
    position: "",
    department: "Computer Science & Engineering",
    internshipType: "Full-Time",
    mode: "Hybrid",
    duration: "1-month",
    status: "Draft",
    company: "Kpinterns",
    domain: "Full Stack Development",
    degree: "BTech",
    createdBy: "",
    tags: "",
    requirements: "",
    skills: "",
    responsibilities: "",
    benefits: "",
    perks: "",
    certificateOffered: true,
    stipendAmount: "",
    registrationFeeAmount: "",
    instructors: [],
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

  const degrees = ["BTech", "Diploma", "BSc", "BA", "BCom"];
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

  // Grouped departments according to Internship model enums
  const departmentGroups = {
    "Engineering (B.Tech / Diploma)": [
      "Computer Science & Engineering",
      "Mechanical Engineering",
      "Civil Engineering",
      "Electrical Engineering",
      "Electronics & Communication",
      "Chemical Engineering",
    ],
    "Pure & Applied Sciences (BSc)": [
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
    "Arts & Humanities (BA)": [
      "Humanities",
      "Social Sciences",
      "Languages",
      "Arts & Media",
      "Vocational/Applied",
    ],
    "Commerce & Business (BCom / BBA)": [
      "Accounting & Finance",
      "Business Administration",
      "Banking & Insurance",
      "Taxation",
      "Economics",
      "Sales & Marketing",
      "Computer Applications",
    ],
    "Education": ["General Teacher Training"],
    "Law": ["Civil Law", "Criminal Law", "Corporate Law"],
  };

  // Grouped domains according to Internship model enums
  const domainGroups = {
    "Computer Science & Engineering": [
      "Full Stack Development",
      "Frontend Development",
      "Backend Development",
      "Mobile App Development",
      "Data Science & Machine Learning",
      "Artificial Intelligence",
      "DevOps & Cloud Computing",
      "Cybersecurity",
      "Blockchain Development",
      "Web3 & Cryptocurrency",
      "Game Development",
      "IoT & Embedded Systems",
      "Software Testing & QA",
      "Database Administration",
      "UI/UX Design",
      "Other Tech",
    ],
    "Mechanical Engineering": [
      "Product Design & Development",
      "CAD/CAM Design",
      "Manufacturing & Production",
      "Automobile Engineering",
      "Thermal & HVAC Engineering",
      "Robotics & Automation",
      "Quality Control & Inspection",
      "Industrial Engineering",
      "Maintenance Engineering",
      "Energy & Power Systems",
      "3D Printing & Additive Manufacturing",
      "Project Management (Mechanical)",
      "Other Mechanical",
    ],
    "Civil Engineering": [
      "Structural Engineering",
      "Construction Management",
      "Urban Planning & Design",
      "Geotechnical Engineering",
      "Transportation Engineering",
      "Water Resources & Irrigation",
      "Environmental Engineering",
      "Surveying & GIS",
      "Building Information Modelling (BIM)",
      "Project Management (Civil)",
      "Other Civil",
    ],
    "Electrical Engineering": [
      "Power Systems & Grid Engineering",
      "Renewable Energy & Solar",
      "Control Systems & Automation",
      "Electrical Machine Design",
      "High Voltage & Power Electronics",
      "PLC & SCADA Programming",
      "Instrumentation & Measurement",
      "EV & Battery Technology",
      "Electrical Project Management",
      "Other Electrical",
    ],
    "Electronics & Communication": [
      "Embedded Systems & IoT",
      "VLSI Design",
      "PCB Design & Prototyping",
      "Signal Processing",
      "Telecommunications & Networking",
      "RF & Microwave Engineering",
      "Consumer Electronics Testing",
      "Firmware Development",
      "Other Electronics",
    ],
    "Chemical Engineering": [
      "Process Engineering",
      "Petroleum & Refinery",
      "Pharmaceutical Manufacturing",
      "Polymer & Materials Science",
      "Food Technology",
      "Environmental & Safety Engineering",
      "Quality Assurance (Chemical)",
      "Research & Development (Chemical)",
      "Other Chemical",
    ],
    "Data Science": [
      "Data Analysis & Visualization",
      "Machine Learning Engineering",
      "Business Intelligence",
      "Data Engineering & Pipelines",
      "AI Research",
      "Statistical Modelling",
      "Other Data Science",
    ],
    "Biotechnology": [
      "Molecular Biology Research",
      "Pharmaceutical Biotechnology",
      "Agricultural Biotechnology",
      "Bioinformatics",
      "Environmental Biotechnology",
      "Other Biotechnology",
    ],
    "Life Sciences": [
      "Clinical Microbiology",
      "Food & Beverage Microbiology",
      "Research & Development (Micro)",
      "Quality Control (Lab)",
      "Clinical Research",
      "Pharmaceutical R&D",
      "Nutrition & Dietetics",
      "Wildlife Conservation",
      "Veterinary Support",
      "Plant Research",
      "Horticulture",
      "Pharmaceutical Botany",
      "Other Life Sciences",
    ],
    "Pure Sciences": [
      "Research & Development",
      "Instrumentation",
      "Renewable Energy",
      "Analytical Chemistry",
      "Actuarial Science",
      "Quantitative Finance",
      "Market Research",
      "Other Sciences",
    ],
    "Agriculture": [
      "Agribusiness Management",
      "Agricultural Research",
      "Rural Development",
      "Other Agriculture",
    ],
    "Healthcare": [
      "Clinical Nursing",
      "Community Health",
      "Hospital Administration",
      "Other Healthcare",
    ],
    "Forensic": [
      "Crime Investigation Support",
      "Lab Analysis",
      "Legal Services",
      "Other Forensic",
    ],
    "Commerce / Finance / Business": [
      "Financial Analysis",
      "Accounting & Audit",
      "Taxation",
      "Investment Banking",
      "Financial Modelling",
      "Other Finance",
      "General Management",
      "Operations Management",
      "Project Management",
      "Entrepreneurship",
      "Other Business",
      "Banking Operations",
      "Insurance Sales & Advisory",
      "Risk Management",
      "Loan Processing",
      "GST & Indirect Taxation",
      "Direct Taxation",
      "Tax Audit & Compliance",
      "Economic Research & Policy",
      "Other Economics",
      "Digital Marketing",
      "Content Marketing",
      "Sales & Business Development",
      "Brand Management",
      "Social Media Marketing",
      "Other Marketing",
    ],
    "Arts / Humanities / Media": [
      "Content Writing",
      "Journalism & Media",
      "Public Relations",
      "Event Management",
      "Social Work & NGO",
      "Other Humanities",
      "Public Policy Research",
      "Community Development",
      "Other Social Sciences",
      "Translation & Interpretation",
      "Teaching & Tutoring",
      "Other Languages",
      "Graphic Design",
      "Photography & Videography",
      "Animation & VFX",
      "Film Production",
      "Other Media",
      "Tourism & Hospitality",
      "Retail Management",
      "Other Vocational",
    ],
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("adminData");
        if (stored) {
          const parsed = JSON.parse(stored);
          setAdminData(parsed);
          if (parsed && parsed._id) {
            setFormData((prev) => ({ ...prev, createdBy: parsed._id }));
          }
          if (parsed.role === "Instructor") {
            setActiveTab("content");
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const res = await fetch("/api/admin");
        const data = await res.json();
        if (data.success) {
          setAdminsList(data.data || []);
        }
      } catch (err) {
        console.error("Error fetching admins:", err);
      }
    };
    fetchAdmins();
  }, []);

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
    if (!formData.degree) {
      setError("Degree is required");
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
    if (!formData.instructors || formData.instructors.length === 0) {
      setError("At least one instructor is required");
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
        degree: formData.degree,
        certificateOffered: formData.certificateOffered,
        tags: formData.tags ? formData.tags.split(",").map((item) => item.trim()).filter(Boolean) : [],
        requirements: formData.requirements ? formData.requirements.split(",").map((item) => item.trim()).filter(Boolean) : [],
        skills: formData.skills ? formData.skills.split(",").map((item) => item.trim()).filter(Boolean) : [],
        responsibilities: formData.responsibilities ? formData.responsibilities.split(",").map((item) => item.trim()).filter(Boolean) : [],
        benefits: formData.benefits ? formData.benefits.split(",").map((item) => item.trim()).filter(Boolean) : [],
        perks: formData.perks ? formData.perks.split(",").map((item) => item.trim()).filter(Boolean) : [],
        instructor: formData.instructors.map(id => ({ id })),
        stipend: {
          amount: formData.stipendAmount,
        },
        RegistrationFee: {
          amount: formData.registrationFeeAmount || "0",
        },
        content: formData.contentItems,
        updates: formData.updates,
      };

      const res = await fetch("/api/internship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("Internship created successfully!");
        setTimeout(() => {
          router.push("/admin/auth/dashboard/internship");
        }, 1500);
      } else {
        setError(data.error || "Failed to create internship");
      }
    } catch (err) {
      setError("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-main">
            Create Internship
          </h1>
          <p className="text-text-muted text-sm sm:text-base">
            Create a new internship opportunity with professional details.
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
          {adminData?.role !== "Instructor" && (
            <button
              type="button"
              onClick={() => setActiveTab("basics")}
              className={`px-5 py-3 font-semibold transition-all ${activeTab === "basics" ? "border-b-2 border-brand-primary text-brand-primary -mb-4" : "border-transparent text-text-muted hover:text-text-main"}`}
            >
              Basic Details
            </button>
          )}
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

        {activeTab === "basics" && adminData?.role !== "Instructor" && (
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
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Target Degree *</label>
                <select
                  name="degree"
                  required
                  value={formData.degree}
                  onChange={handleBasicInputChange}
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                >
                  {degrees.map((deg) => (
                    <option key={deg} value={deg}>{deg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Department / Stream *</label>
                <select
                  name="department"
                  required
                  value={formData.department}
                  onChange={handleBasicInputChange}
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition text-sm"
                >
                  {Object.entries(departmentGroups).map(([group, list]) => (
                    <optgroup key={group} label={group}>
                      {list.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Internship Domain *</label>
                <select
                  name="domain"
                  required
                  value={formData.domain}
                  onChange={handleBasicInputChange}
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition text-sm"
                >
                  {Object.entries(domainGroups).map(([group, list]) => (
                    <optgroup key={group} label={group}>
                      {list.map((dom) => (
                        <option key={dom} value={dom}>{dom}</option>
                      ))}
                    </optgroup>
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

              {/* Internship Banner */}
              <div className="md:col-span-2 bg-bg-main/40 border border-dashed border-border-main rounded-xl p-4">
                <label className="block text-xs font-bold text-text-muted mb-3 uppercase tracking-wider">Internship Cover Banner Image</label>
                <MediaPicker
                  onFileSelect={handleThumbnailPickerSelect}
                  isUploading={uploadingThumbnail}
                  uploadedItems={[formData.thumbnail].filter(Boolean)}
                  maxSize={10}
                  multiple={false}
                />
              </div>

              <div className="md:col-span-2 space-y-3">
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Assigned Instructors *</label>
                
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.instructors && formData.instructors.map((instId) => {
                    const match = adminsList.find((admin) => admin._id === instId);
                    const displayName = match ? `${match.name} (ID: ${match._id})` : instId;
                    return (
                      <div key={instId} className="flex items-center gap-2 bg-brand-primary/10 border border-brand-primary/30 text-brand-primary font-medium px-3.5 py-1.5 rounded-xl text-sm">
                        <span>{displayName}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              instructors: prev.instructors.filter((id) => id !== instId),
                            }));
                          }}
                          className="hover:text-red-500 font-bold transition-all text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                  {(!formData.instructors || formData.instructors.length === 0) && (
                    <p className="text-xs text-red-500 font-medium italic">No instructors assigned yet.</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <select
                    className="flex-1 p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition text-sm text-text-main"
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      if (selectedId && !formData.instructors.includes(selectedId)) {
                        setFormData((prev) => ({
                          ...prev,
                          instructors: [...prev.instructors, selectedId],
                        }));
                      }
                      e.target.value = ""; // Reset dropdown selection
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>Add Instructor...</option>
                    {adminsList
                      .filter((admin) => admin.role === "Instructor" && !formData.instructors.includes(admin._id))
                      .map((admin) => (
                        <option key={admin._id} value={admin._id}>
                          {admin.name} (ID: {admin._id})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Stipend Description</label>
                <input
                  type="text"
                  name="stipendAmount"
                  value={formData.stipendAmount}
                  onChange={handleBasicInputChange}
                  placeholder="e.g. $500/month or Unpaid"
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>

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

              <div className="flex items-center gap-3 md:col-span-2">
                <label className="flex items-center gap-2 text-xs uppercase font-semibold text-text-muted cursor-pointer">
                  <input
                    type="checkbox"
                    name="certificateOffered"
                    checked={formData.certificateOffered}
                    onChange={handleBasicInputChange}
                    className="w-4 h-4 rounded border-border-main text-brand-primary"
                  />
                  Certificate Offered
                </label>
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

        <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-border-main sticky bottom-0 bg-bg-main p-6 rounded-2xl">
          <button
            type="button"
            disabled={isSubmitting || uploadingFile || uploadingThumbnail}
            onClick={() => router.push("/admin/auth/dashboard/internship")}
            className="flex-1 px-6 py-3 border-2 border-border-main text-text-main rounded-xl hover:bg-bg-card transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || uploadingFile || uploadingThumbnail}
            className="flex-1 px-6 py-3 bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 text-white font-semibold shadow transition disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploadingFile || uploadingThumbnail ? "Uploading..." : isSubmitting ? "Saving..." : "Create Internship"}
          </button>
        </div>
      </form>
    </div>
  );
}
