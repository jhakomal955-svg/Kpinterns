"use client";

import { useState, useEffect } from "react";
import { universitiesData } from "@/lib/data/universities";

export default function EditProfileModal({ isOpen, onClose, profileData, onSaveSuccess }) {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    gender: "Male",
    parentName: "",
    university: "",
    universityCustom: "",
    college: "",
    collegeCustom: "",
    rollNumber: "",
    semester: "1st",
    session: "2023-2027",
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (profileData && isOpen) {
      // Determine if existing university is in universitiesData
      let matchedUnivKey = "";
      let isCustomUniv = false;
      let matchedCollegeKey = "";
      let isCustomCollege = false;

      if (profileData.university) {
        const foundU = Object.entries(universitiesData).find(
          ([key, u]) => u.name?.trim().toLowerCase() === profileData.university.trim().toLowerCase() || key === profileData.university
        );
        if (foundU) {
          matchedUnivKey = foundU[0];
        } else {
          matchedUnivKey = "others";
          isCustomUniv = true;
        }
      }

      if (profileData.college) {
        if (matchedUnivKey && matchedUnivKey !== "others") {
          const colleges = universitiesData[matchedUnivKey]?.colleges || {};
          const foundC = Object.entries(colleges).find(
            ([key, c]) => c.name?.trim().toLowerCase() === profileData.college.trim().toLowerCase() || key === profileData.college
          );
          if (foundC) {
            matchedCollegeKey = foundC[0];
          } else {
            matchedCollegeKey = "others";
            isCustomCollege = true;
          }
        } else {
          matchedCollegeKey = "others";
          isCustomCollege = true;
        }
      }

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        fullName: profileData.fullName || "",
        phone: profileData.phone || "",
        gender: profileData.gender || "Male",
        parentName: profileData.parentName || "",
        university: matchedUnivKey || "others",
        universityCustom: isCustomUniv ? profileData.university : "",
        college: matchedCollegeKey || "others",
        collegeCustom: isCustomCollege ? profileData.college : "",
        rollNumber: profileData.rollNumber || "",
        semester: profileData.semester || "1st",
        session: profileData.session || "2023-2027",
      });
      setErrors({});
      setApiError("");
    }
  }, [profileData, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "university") {
      setFormData((prev) => ({
        ...prev,
        university: value,
        universityCustom: value === "others" ? prev.universityCustom : "",
        college: value === "others" ? "others" : "",
        collegeCustom: value === "others" ? prev.collegeCustom : "",
      }));
    } else if (name === "college") {
      setFormData((prev) => ({
        ...prev,
        college: value,
        collegeCustom: value === "others" ? prev.collegeCustom : "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const getAvailableColleges = () => {
    if (!formData.university || formData.university === "others") return [];
    const univObj = universitiesData[formData.university];
    if (!univObj || !univObj.colleges) return [];
    return Object.entries(univObj.colleges).map(([key, col]) => ({
      id: key,
      name: col.name,
    }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = "Full name is required";
    
    const cleanedPhone = formData.phone.replace(/\D/g, "");
    if (!cleanedPhone) {
      errs.phone = "Phone number is required";
    } else if (cleanedPhone.length !== 10) {
      errs.phone = "Phone number must be exactly 10 digits";
    }

    if (!formData.gender) errs.gender = "Gender is required";
    if (!formData.parentName.trim()) errs.parentName = "Parent/Guardian name is required";

    if (!formData.university) errs.university = "University selection is required";
    if (formData.university === "others" && !formData.universityCustom.trim()) {
      errs.universityCustom = "Please enter your university name";
    }

    if (!formData.college) errs.college = "College selection is required";
    if (formData.college === "others" && !formData.collegeCustom.trim()) {
      errs.collegeCustom = "Please enter your college name";
    }

    if (!formData.rollNumber.trim()) errs.rollNumber = "Roll number is required";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    setApiError("");

    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        throw new Error("Session expired. Please log in again.");
      }

      // Resolve final university & college names
      const universityObj = universitiesData[formData.university];
      const collegeObj = universityObj?.colleges?.[formData.college];
      const resolvedUniversity = formData.university === "others"
        ? formData.universityCustom.trim()
        : (universityObj ? universityObj.name : formData.university);
      const resolvedCollege = formData.college === "others"
        ? formData.collegeCustom.trim()
        : (collegeObj ? collegeObj.name : formData.college);

      const payload = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.replace(/\D/g, ""),
        gender: formData.gender,
        parentName: formData.parentName.trim(),
        university: resolvedUniversity,
        college: resolvedCollege,
        rollNumber: formData.rollNumber.trim(),
        semester: formData.semester,
        session: formData.session,
      };

      const res = await fetch(`/api/user?id=${profileData._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || result.details || "Failed to update profile");
      }

      // Update storage and dispatch event
      const updatedUser = result.data;
      localStorage.setItem("userData", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("user-login-change"));

      if (onSaveSuccess) {
        onSaveSuccess(updatedUser);
      }
      onClose();
    } catch (err) {
      console.error("Error updating profile:", err);
      setApiError(err.message || "An error occurred while saving profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const availableColleges = getAvailableColleges();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-bg-card border border-border-main rounded-2xl shadow-2xl p-6 sm:p-8 my-8 text-text-main animate-fade-in font-poppins">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-main pb-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <span>✏️</span> Edit Basic Information
            </h2>
            <p className="text-xs sm:text-sm text-text-muted mt-0.5">
              Update your personal and academic information below.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-bg-main hover:bg-border-main text-text-muted hover:text-text-main transition font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {apiError && (
          <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-xs sm:text-sm font-medium">
            ⚠️ {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Personal Details */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-primary mb-3">
              1. Personal Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  className={`w-full p-2.5 bg-bg-main border-2 rounded-xl text-sm outline-none transition focus:border-brand-primary ${
                    errors.fullName ? "border-red-500" : "border-border-main"
                  }`}
                />
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">
                  Phone (10 Digits) *
                </label>
                <input
                  type="tel"
                  name="phone"
                  maxLength={10}
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="10-digit mobile number"
                  className={`w-full p-2.5 bg-bg-main border-2 rounded-xl text-sm outline-none transition focus:border-brand-primary ${
                    errors.phone ? "border-red-500" : "border-border-main"
                  }`}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl text-sm outline-none transition focus:border-brand-primary cursor-pointer"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
              </div>

              {/* Parent Name */}
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">
                  Parent / Guardian Name *
                </label>
                <input
                  type="text"
                  name="parentName"
                  value={formData.parentName}
                  onChange={handleInputChange}
                  placeholder="Parent or Guardian name"
                  className={`w-full p-2.5 bg-bg-main border-2 rounded-xl text-sm outline-none transition focus:border-brand-primary ${
                    errors.parentName ? "border-red-500" : "border-border-main"
                  }`}
                />
                {errors.parentName && <p className="text-red-500 text-xs mt-1">{errors.parentName}</p>}
              </div>
            </div>
          </div>

          {/* Section 2: Academic Details */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-primary mb-3">
              2. Academic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* University */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">
                  University *
                </label>
                <select
                  name="university"
                  value={formData.university}
                  onChange={handleInputChange}
                  className={`w-full p-2.5 bg-bg-main border-2 rounded-xl text-sm outline-none transition focus:border-brand-primary cursor-pointer ${
                    errors.university ? "border-red-500" : "border-border-main"
                  }`}
                >
                  <option value="">Select University</option>
                  {Object.entries(universitiesData).map(([key, u]) => (
                    <option key={key} value={key}>
                      {u.name}
                    </option>
                  ))}
                  <option value="others">Others (Enter University)</option>
                </select>
                {errors.university && <p className="text-red-500 text-xs mt-1">{errors.university}</p>}

                {formData.university === "others" && (
                  <div className="mt-2.5">
                    <input
                      type="text"
                      name="universityCustom"
                      value={formData.universityCustom}
                      onChange={handleInputChange}
                      placeholder="Type your university name here"
                      className={`w-full p-2.5 bg-bg-main border-2 rounded-xl text-sm outline-none transition focus:border-brand-primary ${
                        errors.universityCustom ? "border-red-500" : "border-border-main"
                      }`}
                    />
                    {errors.universityCustom && (
                      <p className="text-red-500 text-xs mt-1">{errors.universityCustom}</p>
                    )}
                  </div>
                )}
              </div>

              {/* College */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">
                  College *
                </label>
                <select
                  name="college"
                  value={formData.college}
                  onChange={handleInputChange}
                  disabled={!formData.university}
                  className={`w-full p-2.5 bg-bg-main border-2 rounded-xl text-sm outline-none transition focus:border-brand-primary cursor-pointer ${
                    errors.college ? "border-red-500" : "border-border-main"
                  } ${!formData.university ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <option value="">
                    {formData.university ? "Select College" : "Select University first"}
                  </option>
                  {availableColleges.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                  {formData.university && (
                    <option value="others">Others (Enter College)</option>
                  )}
                </select>
                {errors.college && <p className="text-red-500 text-xs mt-1">{errors.college}</p>}

                {formData.college === "others" && (
                  <div className="mt-2.5">
                    <input
                      type="text"
                      name="collegeCustom"
                      value={formData.collegeCustom}
                      onChange={handleInputChange}
                      placeholder="Type your college name here"
                      className={`w-full p-2.5 bg-bg-main border-2 rounded-xl text-sm outline-none transition focus:border-brand-primary ${
                        errors.collegeCustom ? "border-red-500" : "border-border-main"
                      }`}
                    />
                    {errors.collegeCustom && (
                      <p className="text-red-500 text-xs mt-1">{errors.collegeCustom}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Roll Number */}
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">
                  Roll Number *
                </label>
                <input
                  type="text"
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleInputChange}
                  placeholder="Student Roll No."
                  className={`w-full p-2.5 bg-bg-main border-2 rounded-xl text-sm outline-none transition focus:border-brand-primary ${
                    errors.rollNumber ? "border-red-500" : "border-border-main"
                  }`}
                />
                {errors.rollNumber && <p className="text-red-500 text-xs mt-1">{errors.rollNumber}</p>}
              </div>

              {/* Semester */}
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">
                  Semester *
                </label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl text-sm outline-none transition focus:border-brand-primary cursor-pointer"
                >
                  {["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"].map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
              </div>

              {/* Session */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">
                  Academic Session *
                </label>
                <select
                  name="session"
                  value={formData.session}
                  onChange={handleInputChange}
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl text-sm outline-none transition focus:border-brand-primary cursor-pointer"
                >
                  {["2021-2025", "2022-2026", "2023-2027", "2024-2028", "2025-2029", "2024-2027", "2025-2028"].map(
                    (sess) => (
                      <option key={sess} value={sess}>
                        {sess}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Account Identifiers Notice */}
          <div className="p-3 bg-bg-main border border-border-main rounded-xl flex items-center justify-between text-xs text-text-muted">
            <span>Email: <strong className="text-text-main">{profileData.email}</strong></span>
            <span>Reg No: <strong className="text-text-main">{profileData.registrationNumber}</strong></span>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-main">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl border border-border-main text-text-muted hover:text-text-main font-semibold text-sm transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-secondary text-white font-semibold text-sm shadow-md hover:shadow-lg transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
