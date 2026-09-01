"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { universitiesData } from "@/lib/data/universities";
import { DEGREE_LIST, getDegreesForUniversityAndCollege, getDepartmentsForCollegeAndDegree, normalizeDegree } from "@/lib/data/degreeDepartments";
import InvalidEmailModal, { validateEmailFormat } from "@/components/InvalidEmailModal";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [dbInternships, setDbInternships] = useState([]);
  const [isLoadingInternships, setIsLoadingInternships] = useState(true);

  const [purchaseType, setPurchaseType] = useState("internship");
  const [itemId, setItemId] = useState(null);
  const [selectedItemDetails, setSelectedItemDetails] = useState(null);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Info
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    parentName: "",
    // Academic Info
    university: "",
    college: "",
    degree: "",
    department: "",
    rollNumber: "",
    semester: "",
    session: "",
    registrationNumber: "",
    internshipId: "",
    internshipDomain: "",
    internshipStartDate: "",
    mode: "",
    universityCustom: "",
    collegeCustom: "",
    consent_letter: "",
    // Security
    password: "",
    confirmPassword: "",
    agreeTerms: true,
  });

  const [errors, setErrors] = useState({});
  const [showInvalidEmailModal, setShowInvalidEmailModal] = useState(false);
  const [completedPaymentDetails, setCompletedPaymentDetails] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [collegeRates, setCollegeRates] = useState({ registered: false, internshipRate: 0, courseRate: 0, internshipStartDate: null });

  const [uploadingConsentLetter, setUploadingConsentLetter] = useState(false);

  const handleConsentLetterUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("Invalid file format. Please upload a PDF or an image (JPEG, PNG, WEBP).");
      return;
    }

    setUploadingConsentLetter(true);
    try {
      const payload = new FormData();
      payload.append("file", file);

      const response = await fetch("/api/cloudinary?public=true", {
        method: "POST",
        body: payload,
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setFormData((prev) => ({
          ...prev,
          consent_letter: data.data.secure_url,
        }));
      } else {
        alert(data.error || "Failed to upload file. Please try again.");
      }
    } catch (err) {
      console.error("Error uploading consent letter:", err);
      alert("An error occurred during file upload.");
    } finally {
      setUploadingConsentLetter(false);
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const type = searchParams.get("type") || "internship";
    const id = searchParams.get("id");
    
    setPurchaseType(type);
    setItemId(id);
    
    if (type === "course" && id) {
      fetch(`/api/course?id=${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setSelectedItemDetails(data.data);
            setFormData((prev) => ({
              ...prev,
              internshipDomain: data.data.domain || "",
              mode: "online",
            }));
          }
        })
        .catch((err) => console.error("Error fetching course:", err));
    } else if (type === "internship" && id) {
      fetch(`/api/internship?id=${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setSelectedItemDetails(data.data);
            setFormData((prev) => ({
              ...prev,
              internshipId: data.data._id || "",
              internshipDomain: data.data.domain || "",
              mode: data.data.mode || "",
            }));
          }
        })
        .catch((err) => console.error("Error fetching internship:", err));
    }
  }, []);

  useEffect(() => {
    async function fetchDbInternships() {
      try {
        const res = await fetch("/api/internship");
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setDbInternships(data.data);
        }
      } catch (err) {
        console.error("Error fetching internships:", err);
      } finally {
        setIsLoadingInternships(false);
      }
    }
    fetchDbInternships();
  }, []);

  useEffect(() => {
    const fetchCollegeRates = async () => {
      if (!formData.college) {
        setCollegeRates({ registered: false, internshipRate: 0, courseRate: 0 });
        return;
      }
      const universityObj = universitiesData[formData.university];
      const collegeObj = universityObj?.colleges?.[formData.college];
      const resolvedCollege = formData.college === "others" ? formData.collegeCustom : (collegeObj ? collegeObj.name : formData.college);

      if (!resolvedCollege || resolvedCollege.trim() === "") {
        setCollegeRates({ registered: false, internshipRate: 0, courseRate: 0 });
        return;
      }

      try {
        const res = await fetch(`/api/college-rate?college=${encodeURIComponent(resolvedCollege.trim())}`);
        const data = await res.json();
        if (data.success) {
          const formattedDate = data.internshipStartDate
            ? new Date(data.internshipStartDate).toISOString().split("T")[0]
            : null;

          setCollegeRates({
            registered: data.registered,
            internshipRate: data.internshipRate || 0,
            courseRate: data.courseRate || 0,
            internshipStartDate: formattedDate,
          });

          if (data.registered && formattedDate) {
            setFormData((prev) => ({
              ...prev,
              internshipStartDate: formattedDate,
            }));
          }
        }
      } catch (err) {
        console.error("Error fetching college rates:", err);
      }
    };

    fetchCollegeRates();
  }, [formData.college, formData.collegeCustom, formData.university]);

  const getPayableAmount = () => {
    if (purchaseType === "course") {
      const originalPrice = selectedItemDetails?.price || 0;
      if (collegeRates.registered && typeof collegeRates.courseRate === "number" && collegeRates.courseRate >= 0) {
        return collegeRates.courseRate;
      }
      return originalPrice;
    }

    let originalPrice = 500;
    if (selectedItemDetails) {
      originalPrice = selectedItemDetails.RegistrationFee?.amount || 500;
    } else if (formData.internshipId) {
      const matched = dbInternships.find((item) => item._id === formData.internshipId);
      originalPrice = matched?.RegistrationFee?.amount !== undefined ? Number(matched.RegistrationFee.amount) : 500;
    } else if (formData.internshipDomain) {
      const matched = dbInternships.find(
        (item) => item.domain === formData.internshipDomain || item.category === formData.internshipDomain
      );
      originalPrice = matched?.RegistrationFee?.amount !== undefined ? Number(matched.RegistrationFee.amount) : 500;
    }

    if (collegeRates.registered && typeof collegeRates.internshipRate === "number" && collegeRates.internshipRate >= 0) {
      return collegeRates.internshipRate;
    }
    return originalPrice;
  };

  const totalSteps = 4;
  const stepTitles = ["Personal", "Academic", "Security & Payments", "Register"];

  const handlePayFee = async () => {
    setIsLoading(true);
    try {
      let finalItemId = itemId;
      if (!finalItemId && purchaseType === "internship") {
        finalItemId = formData.internshipId;
      }

      const payableAmount = getPayableAmount();

      // Resolve university and college names
      const universityObj = universitiesData[formData.university];
      const collegeObj = universityObj?.colleges?.[formData.college];
      const resolvedUniversity = formData.university === "others" ? formData.universityCustom : (universityObj ? universityObj.name : formData.university);
      const resolvedCollege = formData.college === "others" ? formData.collegeCustom : (collegeObj ? collegeObj.name : formData.college);

      const resOrder = await fetch("/api/payment/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type: purchaseType, 
          itemId: finalItemId,
          university: resolvedUniversity,
          college: resolvedCollege
        }),
      });

      const orderData = await resOrder.json();
      if (!resOrder.ok) {
        throw new Error(orderData.error || "Failed to initiate payment");
      }

      // If price is 0, bypass Razorpay payment modal
      if (orderData.amount === 0 || !orderData.orderId) {
        const paymentInfo = {
          type: purchaseType,
          itemId: finalItemId,
          amount: 0,
        };
        setCompletedPaymentDetails(paymentInfo);
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.payment;
          return newErrors;
        });
        setSuccessModal({
          isOpen: true,
          title: "Registration Fee Waived!",
          message: "No payment is required for this college partner rate. You can now proceed to the final registration step.",
          onAction: null,
        });
        setIsLoading(false);
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Failed to load payment gateway. Please check your internet connection.");
        setIsLoading(false);
        return;
      }

      const options = {
        key: orderData.key,
        amount: orderData.amount * 100,
        currency: orderData.currency,
        name: "KpInterns",
        description: `Payment for ${orderData.title}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          const paymentInfo = {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            type: purchaseType,
            itemId: finalItemId,
            amount: payableAmount,
          };
          setCompletedPaymentDetails(paymentInfo);
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.payment;
            return newErrors;
          });
          alert("Payment successful! You can now proceed to the next step.");
          setIsLoading(false);
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#2563eb",
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert(error.message || "An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (["university", "college", "degree", "internshipDomain", "internshipId"].includes(name)) {
      setCompletedPaymentDetails(null);
    }

    if (name === "university") {
      setFormData((prev) => ({
        ...prev,
        university: value,
        college: value === "others" ? "others" : "",
        degree: "",
        department: "",
        internshipId: "",
        internshipDomain: "",
        mode: "",
        universityCustom: "",
        collegeCustom: "",
      }));
    } else if (name === "college") {
      setFormData((prev) => ({
        ...prev,
        college: value,
        degree: "",
        department: "",
        internshipId: "",
        internshipDomain: "",
        mode: "",
        collegeCustom: "",
      }));
    } else if (name === "degree") {
      setFormData((prev) => ({
        ...prev,
        degree: value,
        department: "",
        internshipId: "",
        internshipDomain: "",
        mode: "",
      }));
    } else if (name === "department") {
      setFormData((prev) => ({
        ...prev,
        department: value,
        internshipId: "",
        internshipDomain: "",
        mode: "",
      }));
    } else if (name === "internshipId") {
      const selectedId = value;
      const matched = dbInternships.find((item) => item._id === selectedId);
      setFormData((prev) => ({
        ...prev,
        internshipId: selectedId,
        internshipDomain: matched ? matched.domain : "",
        mode: matched ? matched.mode : "",
      }));
    } else if (name === "internshipDomain") {
      const domainValue = value;
      const normDegree = normaliseDegree(formData.degree);
      setFormData((prev) => {
        const matchingInternships = dbInternships.filter(
          (item) =>
            (item.status === "Active" || item.status === "Published") &&
            (Array.isArray(item.degree) ? item.degree.includes(normDegree) : item.degree === normDegree) &&
            (Array.isArray(item.department) ? item.department.includes(prev.department) : item.department === prev.department) &&
            item.domain === domainValue
        );
        const modes = matchingInternships.map((item) => item.mode).filter(Boolean);
        const uniqueModes = [...new Set(modes)];

        let newMode = "";
        if (uniqueModes.length === 1) {
          newMode = uniqueModes[0];
        } else if (uniqueModes.length > 1) {
          newMode = uniqueModes.includes(prev.mode) ? prev.mode : uniqueModes[0];
        }

        return {
          ...prev,
          internshipDomain: domainValue,
          mode: newMode,
        };
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Get available colleges for selected university
  const getAvailableColleges = () => {
    if (!formData.university || formData.university === "others") return [];
    const universityData = universitiesData[formData.university];
    if (!universityData || !universityData.colleges) return [];
    return Object.entries(universityData.colleges).map(([key, college]) => ({
      id: key,
      name: college.name,
    }));
  };

  // Get available degrees for selected university and college
  const getAvailableDegrees = () => {
    return getDegreesForUniversityAndCollege(
      formData.university,
      formData.college
    );
  };

  // Get available departments for selected college and degree
  const getAvailableDepartments = () => {
    if (!formData.degree) return [];
    return getDepartmentsForCollegeAndDegree(
      formData.university,
      formData.college,
      formData.degree
    );
  };

  // Get available semesters count based on degree
  const getAvailableSemestersCount = () => {
    if (!formData.degree) return 0;
    const norm = normalizeDegree(formData.degree);
    if (norm === "Diploma") {
      return 6;
    } else if (["B.Tech", "BA", "BSc", "BCom", "Education", "Law"].includes(norm)) {
      return 8;
    }
    return 6;
  };

  const getAvailableSessions = (degree) => {
    if (!degree) return [];
    const norm = normalizeDegree(degree);
    if (norm === "Diploma") {
      return ["2023-26", "2024-27", "2025-28"];
    }
    return ["2023-27", "2024-28", "2025-29", "2026-30"];
  };

  // ── Degree normaliser: maps degree → canonical degree string ────────
  const normaliseDegree = (deg) => {
    return normalizeDegree(deg);
  };

  const getFilteredInternshipsForBranchDept = () => {
    if (!formData.department || !formData.degree) return [];
    const normDegree = normaliseDegree(formData.degree);
    return dbInternships.filter(
      (item) =>
        (item.status === "Active" || item.status === "Published") &&
        (Array.isArray(item.degree) ? item.degree.includes(normDegree) : item.degree === normDegree) &&
        (Array.isArray(item.department) ? item.department.includes(formData.department) : item.department === formData.department)
    );
  };

  const getAvailableInternshipDomains = () => {
    if (!formData.department || !formData.degree) return [];
    const normDegree = normaliseDegree(formData.degree);
    const matching = dbInternships.filter(
      (item) =>
        (item.status === "Active" || item.status === "Published") &&
        (Array.isArray(item.degree) ? item.degree.includes(normDegree) : item.degree === normDegree) &&
        (Array.isArray(item.department) ? item.department.includes(formData.department) : item.department === formData.department)
    );
    const domains = matching.map((item) => item.domain).filter(Boolean);
    return [...new Set(domains)].sort();
  };

  const getAvailableModes = () => {
    if (!formData.internshipDomain || !formData.department || !formData.degree) return [];
    const normDegree = normaliseDegree(formData.degree);
    const matching = dbInternships.filter(
      (item) =>
        (item.status === "Active" || item.status === "Published") &&
        (Array.isArray(item.degree) ? item.degree.includes(normDegree) : item.degree === normDegree) &&
        (Array.isArray(item.department) ? item.department.includes(formData.department) : item.department === formData.department) &&
        item.domain === formData.internshipDomain
    );
    const modes = matching.map((item) => item.mode).filter(Boolean);
    return [...new Set(modes)];
  };

  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.fullName.trim())
        newErrors.fullName = "Full name is required";
      if (!formData.email.trim() || !validateEmailFormat(formData.email)) {
        newErrors.email = "Invalid email format";
        setShowInvalidEmailModal(true);
      }
      if (!formData.phone.trim()) {
        newErrors.phone = "Phone number is required";
      } else if (!/^\d{10}$/.test(formData.phone.trim())) {
        newErrors.phone = "Phone number must be exactly 10 digits";
      }
      if (!formData.gender) newErrors.gender = "Please select gender";
      if (!formData.parentName.trim())
        newErrors.parentName = "Parent name is required";
    } else if (step === 2) {
      if (!formData.university) newErrors.university = "University is required";
      if (formData.university === "others" && !formData.universityCustom?.trim()) {
        newErrors.universityCustom = "Please enter university name";
      }
      if (!formData.college) newErrors.college = "College is required";
      if (formData.college === "others" && !formData.collegeCustom?.trim()) {
        newErrors.collegeCustom = "Please enter college name";
      }
      if (!formData.degree) newErrors.degree = "Degree is required";
      if (!formData.department) newErrors.department = "Department is required";
      if (!formData.rollNumber.trim()) newErrors.rollNumber = "Roll number is required";
      if (!formData.semester) newErrors.semester = "Semester is required";
      if (!formData.session) newErrors.session = "Session is required";
      if (!formData.registrationNumber.trim())
        newErrors.registrationNumber = "Registration number is required";
      
      if (purchaseType !== "course") {
        if (!formData.internshipId)
          newErrors.internshipId = "Internship is required";
        if (!formData.mode) newErrors.mode = "Mode is required";
      }
    } else if (step === 3) {
      if (purchaseType === "internship" && (!collegeRates.registered || !collegeRates.internshipStartDate)) {
        if (!formData.internshipStartDate) {
          newErrors.internshipStartDate = "Please select internship starting date";
        }
      }

      if (!formData.password) newErrors.password = "Password is required";
      if (formData.password.length < 6)
        newErrors.password = "Password must be at least 6 characters";
      if (formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = "Passwords do not match";
      
      const payableAmount = getPayableAmount();
      if (payableAmount > 0 && !completedPaymentDetails) {
        newErrors.payment = "Please complete the registration fee payment to proceed.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (validateStep()) {
      if (step === 1) {
        try {
          setIsLoading(true);
          const checkRes = await fetch("/api/user/check-exists", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: formData.email, phone: formData.phone }),
          });
          const checkData = await checkRes.json();
          setIsLoading(false);

          const existErrors = {};
          if (checkData.emailExists) {
            existErrors.email = "This email is already registered in the system. Please use a different email.";
          }
          if (checkData.phoneExists) {
            existErrors.phone = "This phone number is already registered in the system. Please use a different phone number.";
          }
          if (Object.keys(existErrors).length > 0) {
            setErrors((prev) => ({ ...prev, ...existErrors }));
            return;
          }
        } catch (err) {
          setIsLoading(false);
          console.error("Error checking user availability:", err);
        }
      }
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateStep()) {
      setIsLoading(true);
      try {
        let finalItemId = itemId;
        if (!finalItemId && purchaseType === "internship") {
          finalItemId = formData.internshipId;
        }

        const payableAmount = getPayableAmount();

        const hasValidExistingPayment = 
          completedPaymentDetails &&
          completedPaymentDetails.type === purchaseType &&
          completedPaymentDetails.itemId === finalItemId &&
          completedPaymentDetails.amount === payableAmount;

        if (payableAmount > 0 && !hasValidExistingPayment) {
          alert("Payment is required to complete registration. Please complete payment first.");
          setStep(3);
          setIsLoading(false);
          return;
        }

        const universityObj = universitiesData[formData.university];
        const collegeObj = universityObj?.colleges?.[formData.college];

        const { universityCustom, collegeCustom, ...restFormData } = formData;

        const userPayload = {
          ...restFormData,
          university: formData.university === "others" ? formData.universityCustom : (universityObj ? universityObj.name : formData.university),
          college: formData.college === "others" ? formData.collegeCustom : (collegeObj ? collegeObj.name : formData.college),
          courseId: purchaseType === "course" ? finalItemId : undefined,
          internshipId: purchaseType === "internship" ? finalItemId : undefined,
          internshipStartDate: formData.internshipStartDate || undefined,
          paymentDetails: hasValidExistingPayment ? completedPaymentDetails : undefined,
        };

        const token = localStorage.getItem("adminToken");
        const response = await fetch("/api/user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(userPayload),
        });

        const data = await response.json();

        if (response.ok) {
          alert("Student registration completed successfully!");
          router.push("/admin/auth/cybercafe-partner");
        } else {
          alert(data.error || "Registration failed. Please check details.");
        }
      } catch (error) {
        console.error("Registration error:", error);
        alert(error.message || "An error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-main">
          New Student Registration
        </h1>
        <p className="text-text-muted text-sm sm:text-base">
          Enroll a new student and associate their record with your Cybercafe Partner account.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          {stepTitles.map((title, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  index + 1 <= step
                    ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg"
                    : "bg-bg-card border-2 border-border-main text-text-muted"
                }`}
              >
                {index + 1 < step ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span className={`text-[10px] sm:text-xs mt-2 font-semibold text-center px-1 break-words ${index + 1 <= step ? "text-brand-primary" : "text-text-muted"}`}>
                {title}
              </span>
            </div>
          ))}
        </div>

        {/* Progress Line */}
        <div className="h-1 bg-border-main rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary transition-all duration-500"
            style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-bg-card rounded-3xl shadow-xl p-5 sm:p-8 border border-border-main backdrop-blur-sm">
        <form onSubmit={handleSubmit}>
          {/* Step 1: Personal Information */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold text-text-main border-b border-border-main pb-2">
                Personal Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-text-main mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Student's full name"
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main focus:outline-none focus:border-brand-primary font-poppins ${
                      errors.fullName ? "border-red-500" : "border-border-main"
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-main mb-2">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main focus:outline-none focus:border-brand-primary font-poppins ${
                      errors.gender ? "border-red-500" : "border-border-main"
                    }`}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && (
                    <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-text-main mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="student@example.com"
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main focus:outline-none focus:border-brand-primary font-poppins ${
                      errors.email ? "border-red-500" : "border-border-main"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>



                <div>
                  <label className="block text-sm font-semibold text-text-main mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="10-digit number"
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main focus:outline-none focus:border-brand-primary font-poppins ${
                      errors.phone ? "border-red-500" : "border-border-main"
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-text-main mb-2">
                    Parent/Guardian Name *
                  </label>
                  <input
                    type="text"
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleInputChange}
                    placeholder="Enter parent/guardian name"
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main focus:outline-none focus:border-brand-primary font-poppins ${
                      errors.parentName ? "border-red-500" : "border-border-main"
                    }`}
                  />
                  {errors.parentName && (
                    <p className="text-red-500 text-xs mt-1">{errors.parentName}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Academic Information */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold text-text-main border-b border-border-main pb-2">
                Academic Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-text-main mb-2">
                    University *
                  </label>
                  <select
                    name="university"
                    value={formData.university}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main focus:outline-none focus:border-brand-primary font-poppins ${
                      errors.university ? "border-red-500" : "border-border-main"
                    }`}
                  >
                    <option value="">Select University</option>
                    {Object.entries(universitiesData).map(([key, university]) => (
                      <option key={key} value={key}>
                        {university.name}
                      </option>
                    ))}
                    <option value="others">Others</option>
                  </select>
                  {errors.university && (
                    <p className="text-red-500 text-xs mt-1">{errors.university}</p>
                  )}
                  {formData.university === "others" && (
                    <div className="mt-3">
                      <label className="block text-sm font-semibold text-text-main mb-2">
                        Enter University Name *
                      </label>
                      <input
                        type="text"
                        name="universityCustom"
                        value={formData.universityCustom || ""}
                        onChange={handleInputChange}
                        placeholder="Enter your university name"
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main focus:outline-none focus:border-brand-primary font-poppins ${
                          errors.universityCustom ? "border-red-500" : "border-border-main"
                        }`}
                      />
                      {errors.universityCustom && (
                        <p className="text-red-500 text-xs mt-1">{errors.universityCustom}</p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-main mb-2">
                    College *
                  </label>
                  <select
                    name="college"
                    value={formData.college}
                    onChange={handleInputChange}
                    disabled={!formData.university}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main focus:outline-none focus:border-brand-primary font-poppins ${
                      errors.college ? "border-red-500" : "border-border-main"
                    } ${!formData.university ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <option value="">
                      {formData.university ? "Select College" : "Select University first"}
                    </option>
                    {getAvailableColleges().map((college) => (
                      <option key={college.id} value={college.id}>
                        {college.name}
                      </option>
                    ))}
                    {formData.university && (
                      <option value="others">Others</option>
                    )}
                  </select>
                  {errors.college && (
                    <p className="text-red-500 text-xs mt-1">{errors.college}</p>
                  )}
                  {formData.college === "others" && (
                    <div className="mt-3">
                      <label className="block text-sm font-semibold text-text-main mb-2">
                        Enter College Name *
                      </label>
                      <input
                        type="text"
                        name="collegeCustom"
                        value={formData.collegeCustom || ""}
                        onChange={handleInputChange}
                        placeholder="Enter your college name"
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main focus:outline-none focus:border-brand-primary font-poppins ${
                          errors.collegeCustom ? "border-red-500" : "border-border-main"
                        }`}
                      />
                      {errors.collegeCustom && (
                        <p className="text-red-500 text-xs mt-1">{errors.collegeCustom}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-text-main mb-2">
                    Degree *
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {getAvailableDegrees().map((degree) => (
                      <label key={degree} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="degree"
                          value={degree}
                          checked={formData.degree === degree}
                          onChange={handleInputChange}
                          className="w-4 h-4 accent-brand-primary cursor-pointer"
                        />
                        <span className="ml-2 text-sm font-medium text-text-main">{degree}</span>
                      </label>
                    ))}
                  </div>
                  {errors.degree && (
                    <p className="text-red-500 text-xs mt-1">{errors.degree}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-main mb-2">
                    Department *
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    disabled={!formData.college}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main focus:outline-none focus:border-brand-primary font-poppins ${
                      errors.department ? "border-red-500" : "border-border-main"
                    } ${!formData.college ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <option value="">
                      {formData.college ? "Select Department" : "Select College first"}
                    </option>
                    {getAvailableDepartments().map((dept, index) => (
                      <option key={`dept-${dept}-${index}`} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  {errors.department && (
                    <p className="text-red-500 text-xs mt-1">{errors.department}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-main mb-2">
                    Semester *
                  </label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    disabled={!formData.university || !formData.degree}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main focus:outline-none focus:border-brand-primary font-poppins ${
                      errors.semester ? "border-red-500" : "border-border-main"
                    } ${!formData.university || !formData.degree ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <option value="">
                      {formData.university && formData.degree
                        ? "Select Semester"
                        : "Select University & Degree first"}
                    </option>
                    {formData.university &&
                      Array.from(
                        { length: getAvailableSemestersCount() },
                        (_, i) => i + 1
                      ).map((sem) => {
                        const suffix = sem === 1 ? "st" : sem === 2 ? "nd" : sem === 3 ? "rd" : "th";
                        return (
                          <option key={sem} value={sem}>
                            {sem}
                            {suffix} Semester
                          </option>
                        );
                      })}
                  </select>
                  {errors.semester && (
                    <p className="text-red-500 text-xs mt-1">{errors.semester}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-main mb-2">
                    Session *
                  </label>
                  <select
                    name="session"
                    value={formData.session}
                    onChange={handleInputChange}
                    disabled={!formData.degree}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main focus:outline-none focus:border-brand-primary font-poppins ${
                      errors.session ? "border-red-500" : "border-border-main"
                    } ${!formData.degree ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <option value="">
                      {formData.degree ? "Select Session" : "Select Degree first"}
                    </option>
                    {getAvailableSessions(formData.degree).map((sess) => (
                      <option key={sess} value={sess}>
                        {sess}
                      </option>
                    ))}
                  </select>
                  {errors.session && (
                    <p className="text-red-500 text-xs mt-1">{errors.session}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-main mb-2">
                    Roll Number *
                  </label>
                  <input
                    type="text"
                    name="rollNumber"
                    value={formData.rollNumber}
                    onChange={handleInputChange}
                    placeholder="Roll number"
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main focus:outline-none focus:border-brand-primary font-poppins ${
                      errors.rollNumber ? "border-red-500" : "border-border-main"
                    }`}
                  />
                  {errors.rollNumber && (
                    <p className="text-red-500 text-xs mt-1">{errors.rollNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-main mb-2">
                    Registration Number *
                  </label>
                  <input
                    type="text"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleInputChange}
                    placeholder="Registration number"
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main focus:outline-none focus:border-brand-primary font-poppins ${
                      errors.registrationNumber ? "border-red-500" : "border-border-main"
                    }`}
                  />
                  {errors.registrationNumber && (
                    <p className="text-red-500 text-xs mt-1">{errors.registrationNumber}</p>
                  )}
                </div>

                {purchaseType === "course" ? (
                  selectedItemDetails && (
                    <div className="sm:col-span-2 p-4 rounded-xl border border-brand-primary/20 bg-brand-primary/5">
                      <h3 className="font-semibold text-brand-primary text-sm">Selected Course</h3>
                      <p className="text-text-main font-medium text-base mt-1">{selectedItemDetails.title}</p>
                      <p className="text-text-muted text-xs mt-0.5">Difficulty: {selectedItemDetails.difficultyLevel} | Department: {selectedItemDetails.department}</p>
                      <p className="text-brand-primary font-bold text-sm mt-2">Price: ₹{selectedItemDetails.price || 0}</p>
                    </div>
                  )
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-text-main mb-2">
                        Select Internship *
                      </label>
                      <select
                        name="internshipId"
                        value={formData.internshipId}
                        onChange={handleInputChange}
                        disabled={!formData.degree || !formData.department || isLoadingInternships || getFilteredInternshipsForBranchDept().length === 0}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main focus:outline-none focus:border-brand-primary font-poppins ${
                          errors.internshipId ? "border-red-500" : "border-border-main"
                        } ${(!formData.degree || !formData.department || isLoadingInternships || getFilteredInternshipsForBranchDept().length === 0) ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <option value="">
                          {isLoadingInternships
                            ? "Loading available internships..."
                            : !formData.degree
                              ? "Select Degree first"
                              : !formData.department
                                ? "Select Department first"
                                : getFilteredInternshipsForBranchDept().length === 0
                                  ? "No internships available for this branch & department"
                                  : `Select Internship (${getFilteredInternshipsForBranchDept().length} available)`}
                        </option>
                        {getFilteredInternshipsForBranchDept().map((item) => (
                          <option key={item._id} value={item._id}>
                            {item.title} ({item.position})
                          </option>
                        ))}
                      </select>
                      {formData.degree && formData.department && !isLoadingInternships && getFilteredInternshipsForBranchDept().length === 0 && (
                        <p className="text-amber-500 text-xs mt-2 font-semibold">
                          ⚠️ No internships available for this stream currently.
                        </p>
                      )}
                      {formData.degree && formData.department && getFilteredInternshipsForBranchDept().length > 0 && (
                        <p className="text-brand-primary text-xs mt-2 font-semibold">
                          ℹ️ {getFilteredInternshipsForBranchDept().length} internship(s) found for your branch & department.
                        </p>
                      )}
                      {errors.internshipId && (
                        <p className="text-red-500 text-xs mt-1">{errors.internshipId}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-text-main mb-2">
                        Internship Mode
                      </label>
                      {formData.internshipId && formData.mode ? (
                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-brand-primary/40 bg-brand-primary/5 w-full">
                          <span className="text-brand-primary text-sm font-bold">
                            ✓ {formData.mode}
                          </span>
                          <span className="ml-auto text-[11px] font-semibold text-brand-primary/70 uppercase tracking-wider bg-brand-primary/10 px-2 py-0.5 rounded-full">
                            Auto-filled
                          </span>
                          <input type="hidden" name="mode" value={formData.mode} />
                        </div>
                      ) : (
                        <input
                          type="text"
                          placeholder="Select internship first"
                          disabled
                          className="w-full px-4 py-3 rounded-xl border-2 border-border-main bg-bg-main opacity-50 cursor-not-allowed font-poppins"
                        />
                      )}
                      {errors.mode && (
                        <p className="text-red-500 text-xs mt-1">{errors.mode}</p>
                      )}
                    </div>
                  </>
                )}

                {/* Consent Letter Section */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-text-main mb-2">
                    Upload Consent Letter (Optional)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleConsentLetterUpload}
                      className="hidden"
                      id="consent-letter-upload"
                    />
                    <label
                      htmlFor="consent-letter-upload"
                      className="px-4 py-2.5 bg-bg-main border-2 border-dashed border-border-main hover:border-brand-primary text-text-muted hover:text-brand-primary rounded-xl cursor-pointer transition flex items-center gap-2 text-sm font-semibold"
                    >
                      📁 {formData.consent_letter ? "Change Consent Letter" : "Choose PDF/Image"}
                    </label>
                    {uploadingConsentLetter && (
                      <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                    )}
                    {formData.consent_letter && (
                      <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl">
                        <span className="text-emerald-500 font-bold text-xs">✓ Uploaded</span>
                        <a
                          href={formData.consent_letter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-brand-primary hover:underline font-semibold"
                        >
                          View Document
                        </a>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Step 3: Security & Payments */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold text-text-main border-b border-border-main pb-2">
                Security & Payments
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-border-main/50">
                {/* Internship Starting Date Selection or Partner College Designated Date */}
                {purchaseType === "internship" && (
                  <div className="sm:col-span-2 bg-brand-primary/5 border-2 border-brand-primary/30 rounded-2xl p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <label className="block text-sm font-bold text-text-main flex items-center gap-2">
                        <span>📅</span>
                        <span>Internship Starting Date</span>
                        {(!collegeRates.registered || !collegeRates.internshipStartDate) && <span>*</span>}
                      </label>
                      {collegeRates.registered && collegeRates.internshipStartDate && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Selected by your college
                        </span>
                      )}
                    </div>

                    {collegeRates.registered && collegeRates.internshipStartDate ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 bg-bg-main border-2 border-emerald-500/40 rounded-xl p-3 sm:w-2/3">
                          <span className="text-xl">🏛️</span>
                          <div>
                            <div className="font-bold text-text-main text-sm">
                              {new Date(collegeRates.internshipStartDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                            </div>
                            <div className="text-[11px] text-text-muted">
                              Standard schedule assigned by partner institution
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-text-muted mt-2 leading-relaxed">
                          ℹ️ This start date has been fixed and configured by the partner college. Official documents and daily logs will start on this date.
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs text-text-muted mb-3 leading-relaxed">
                          Choose when the student's internship begins. Official <strong>Offer Letter</strong>, <strong>Completion Certificate</strong>, <strong>Daily Attendance</strong>, and <strong>Log Book</strong> will start on this date.
                        </p>
                        <input
                          type="date"
                          name="internshipStartDate"
                          value={formData.internshipStartDate || ""}
                          onChange={handleInputChange}
                          required
                          className={`w-full sm:w-1/2 px-4 py-3 rounded-xl border-2 transition-all bg-bg-main focus:outline-none focus:border-brand-primary font-poppins text-text-main ${
                            errors.internshipStartDate ? "border-red-500" : "border-border-main"
                          }`}
                        />
                        {errors.internshipStartDate && (
                          <p className="text-red-500 text-xs mt-1 font-medium">
                            {errors.internshipStartDate}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-text-main mb-2">
                    Create Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Create a strong password"
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main focus:outline-none focus:border-brand-primary font-poppins ${
                        errors.password ? "border-red-500" : "border-border-main"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3.5 text-text-muted hover:text-text-main"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-text-main mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm password"
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main focus:outline-none focus:border-brand-primary font-poppins ${
                      errors.confirmPassword ? "border-red-500" : "border-border-main"
                    }`}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Payments */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-text-main font-poppins">
                  Registration Fee Payment
                </h3>

                {getPayableAmount() > 0 ? (
                  <div className="bg-gradient-to-br from-brand-primary/5 to-brand-secondary/5 border border-border-main rounded-2xl p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <span className="text-xs text-text-muted uppercase tracking-wider font-semibold block mb-1">Total Payable</span>
                        <span className="text-3xl font-extrabold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent font-poppins">
                          ₹{getPayableAmount()}
                        </span>
                      </div>

                      {completedPaymentDetails ? (
                        <div className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-xl px-4 py-3 text-sm font-semibold flex items-center gap-2">
                          <span>✅</span>
                          <div>
                            <span>Payment Successful</span>
                            <span className="block text-[10px] font-mono text-text-muted mt-0.5">Ref ID: {completedPaymentDetails.razorpay_payment_id}</span>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handlePayFee}
                          disabled={isLoading}
                          className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/95 hover:to-brand-secondary/95 text-white font-bold rounded-xl shadow-lg transition-all text-sm font-poppins"
                        >
                          Pay Registration Fee (₹{getPayableAmount()})
                        </button>
                      )}
                    </div>

                    {errors.payment && (
                      <p className="text-red-500 text-xs mt-3 font-semibold">
                        ⚠️ {errors.payment}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 flex items-center gap-3">
                    <span className="text-2xl">🎉</span>
                    <div>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 block">No Payment Required</span>
                      <span className="text-text-muted text-sm">This registration is free.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Review & Complete */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold text-text-main border-b border-border-main pb-2">
                Review & Register
              </h2>
              <p className="text-text-muted text-sm mb-4">
                Please review your details carefully before completing registration.
              </p>

              <div className="bg-bg-main border border-border-main rounded-2xl p-6 space-y-4 text-sm font-poppins">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4">
                  <div>
                    <span className="text-text-muted text-xs block">Full Name</span>
                    <span className="text-text-main font-semibold">{formData.fullName}</span>
                  </div>
                  <div>
                    <span className="text-text-muted text-xs block">Email</span>
                    <span className="text-text-main font-semibold break-all">{formData.email}</span>
                  </div>
                  <div>
                    <span className="text-text-muted text-xs block">Phone</span>
                    <span className="text-text-main font-semibold">{formData.phone}</span>
                  </div>
                  <div>
                    <span className="text-text-muted text-xs block">Parent's Name</span>
                    <span className="text-text-main font-semibold">{formData.parentName}</span>
                  </div>
                  <div className="sm:col-span-2 border-t border-border-main/50 my-1"></div>
                  <div>
                    <span className="text-text-muted text-xs block">College</span>
                    <span className="text-text-main font-semibold">{formData.college}</span>
                  </div>
                  <div>
                    <span className="text-text-muted text-xs block">Degree & Dept</span>
                    <span className="text-text-main font-semibold">{formData.degree} ({formData.department})</span>
                  </div>
                  <div>
                    <span className="text-text-muted text-xs block">Reg No / Sem</span>
                    <span className="text-text-main font-semibold">{formData.registrationNumber} (Sem {formData.semester})</span>
                  </div>
                  <div>
                    <span className="text-text-muted text-xs block">
                      {purchaseType === "course" ? "Selected Course" : "Selected Internship"}
                    </span>
                    <span className="text-brand-primary font-bold">
                      {purchaseType === "course"
                        ? (selectedItemDetails?.title || "Course")
                        : (dbInternships.find(item => item._id === formData.internshipId)?.title || formData.internshipDomain || "N/A")}
                    </span>
                  </div>
                  {purchaseType !== "course" && (
                    <div>
                      <span className="text-text-muted text-xs block">Internship Mode</span>
                      <span className="text-text-main font-semibold">
                        {formData.mode || "N/A"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {getPayableAmount() > 0 && completedPaymentDetails && (
                <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold block text-sm">✅ Payment Verified</span>
                    <span className="text-text-muted font-mono text-[10px]">Ref: {completedPaymentDetails.razorpay_payment_id}</span>
                  </div>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">₹{getPayableAmount()}</span>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-border-main">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 px-6 py-3 rounded-xl border-2 border-border-main text-text-main font-semibold hover:border-brand-primary hover:bg-bg-main transition-all"
              >
                ← Back
              </button>
            )}
            {step < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold hover:shadow-lg transition-all"
              >
                Next →
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Registering...</span>
                  </div>
                ) : (
                  "Complete Registration"
                )}
              </button>
            )}
          </div>
        </form>
      </div>
      <InvalidEmailModal
        isOpen={showInvalidEmailModal}
        onClose={() => setShowInvalidEmailModal(false)}
        emailEntered={formData.email}
      />
    </div>
  );
}
