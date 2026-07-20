"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SuccessAlertModal from "@/components/SuccessAlertModal";

import { universitiesData } from "@/lib/data/universities";

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
    mode: "",
    universityCustom: "",
    collegeCustom: "",
    consent_letter: "",
    // Security
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [completedPaymentDetails, setCompletedPaymentDetails] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onAction: null,
  });

  // Email Verification states
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpVerifyLoading, setOtpVerifyLoading] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [collegeRates, setCollegeRates] = useState({ registered: false, internshipRate: 0, courseRate: 0 });
  const [otpError, setOtpError] = useState("");
  // true when the API tells us this email is already in use — blocks the whole OTP flow
  const [emailAlreadyRegistered, setEmailAlreadyRegistered] = useState(false);

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
          setCollegeRates({
            registered: data.registered,
            internshipRate: data.internshipRate || 0,
            courseRate: data.courseRate || 0
          });
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
      if (collegeRates.registered && collegeRates.courseRate > 0) {
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

    if (collegeRates.registered && collegeRates.internshipRate > 0) {
      return collegeRates.internshipRate;
    }
    return originalPrice;
  };



  useEffect(() => {
    let timer;
    if (otpCooldown > 0) {
      timer = setTimeout(() => setOtpCooldown(otpCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCooldown]);

  const handleSendOtp = async () => {
    setOtpError("");
    setEmailAlreadyRegistered(false);
    if (!formData.email.trim()) {
      setErrors((prev) => ({ ...prev, email: "Email is required to send OTP" }));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrors((prev) => ({ ...prev, email: "Invalid email format" }));
      return;
    }

    setOtpLoading(true);
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOtpSent(true);
        setOtpCooldown(60);
        alert(data.message || "OTP sent successfully!");
        if (data.otp) {
          console.log(`[DEV ONLY] OTP Code: ${data.otp}`);
        }
      } else {
        const errMsg = data.error || "Failed to send OTP.";
        setOtpError(errMsg);
        // If the server explicitly says the email is already registered,
        // flag it so the UI blocks further attempts on this email.
        if (
          errMsg.toLowerCase().includes("already registered") ||
          errMsg.toLowerCase().includes("already in use")
        ) {
          setEmailAlreadyRegistered(true);
        }
      }
    } catch (err) {
      console.error(err);
      setOtpError(`Failed to request OTP. Please try again.`);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpError("");
    if (otpInput.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP code");
      return;
    }

    setOtpVerifyLoading(true);
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp: otpInput }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsEmailVerified(true);
        setOtpSent(false);
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.email;
          return newErrors;
        });
      } else {
        setOtpError(data.error || "Invalid OTP code.");
      }
    } catch (err) {
      console.error(err);
      setOtpError("Verification failed. Please try again.");
    } finally {
      setOtpVerifyLoading(false);
    }
  };

  const totalSteps = 4;
  const stepTitles = ["Personal", "Academic", "Security & Payments","Register"];

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
          setSuccessModal({
            isOpen: true,
            title: "Payment Successful!",
            message: "Your payment was processed successfully. You can now proceed to the final registration step.",
            onAction: null,
          });
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
      // Reset college, department, internshipId, internshipDomain, and mode when university changes
      setFormData((prev) => ({
        ...prev,
        university: value,
        college: value === "others" ? "others" : "",
        department: "",
        internshipId: "",
        internshipDomain: "",
        mode: "",
        universityCustom: "",
        collegeCustom: "",
      }));
    } else if (name === "college") {
      // Reset department, internshipId, internshipDomain, and mode when college changes
      setFormData((prev) => ({
        ...prev,
        college: value,
        department: "",
        internshipId: "",
        internshipDomain: "",
        mode: "",
        collegeCustom: "",
      }));
    } else if (name === "degree") {
      // Reset internshipId, internship domain and mode when degree changes (since domains differ by tech/non-tech)
      setFormData((prev) => ({
        ...prev,
        degree: value,
        internshipId: "",
        internshipDomain: "",
        mode: "",
      }));
    } else if (name === "department") {
      // Reset internshipId, internship domain and mode when department changes
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
        // Preserve original casing from the DB (Online / Offline / Hybrid)
        const modes = matchingInternships.map((item) => item.mode).filter(Boolean);
        const uniqueModes = [...new Set(modes)];

        // Always auto-pick: if only 1 mode exists use it; if current mode is still valid keep it
        let newMode = "";
        if (uniqueModes.length === 1) {
          newMode = uniqueModes[0]; // auto-select the single mode
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

  const getDepartmentsForDegreeFallback = (deg) => {
    if (!deg) return [];
    if (deg === "Diploma" || deg === "B.Tech") {
      return [
        "Civil Engineering",
        "Mechanical Engineering",
        "Electrical Engineering",
        "Electronics & Communication",
        "Computer Science & Engineering",
        "Chemical Engineering",
      ];
    } else if (deg === "BA") {
      return ["Arts","Ancient indian history","Anthropology","Bojpuri","Economics","English","Geography","History","Political Science","Psychology","Sociology","Urdu","Maithili","Hindi","Sanskrit","Music","Rural Economics"];
    } else if (deg === "Bsc" || deg === "BSc") {
      return ["Physics","Chemistry","Mathematics","Statistics","Botany","Zoology","Microbiology","Biotechnology","Biochemistry","Computer Science","Data Science","Agriculture","Nursing","Forensic Science"];
    } else if (deg === "Bcom" || deg === "BCom") {
      return ["Commerce","Accounting & Finance","Business Administration","Banking & Insurance","Taxation","Economics","Sales & Marketing","Computer Applications"];
    }
    return [];
  };

  // Get available colleges for selected university
  const getAvailableColleges = () => {
    if (!formData.university || formData.university === "others") return [];
    const universityData = universitiesData[formData.university];
    if (!universityData) return [];
    return Object.entries(universityData.colleges).map(([key, college]) => ({
      id: key,
      name: college.name,
    }));
  };

  // Get available departments for selected college
  const getAvailableDepartments = () => {
    if (!formData.university || !formData.college || !formData.degree) return [];

    if (formData.university === "others" || formData.college === "others") {
      return getDepartmentsForDegreeFallback(formData.degree);
    }

    const universityData = universitiesData[formData.university];
    if (!universityData) return getDepartmentsForDegreeFallback(formData.degree);
    const collegeData = universityData.colleges[formData.college];
    if (!collegeData) return getDepartmentsForDegreeFallback(formData.degree);
    
    let degreeKey = formData.degree;
    if (degreeKey === "Bcom") degreeKey = "BCom";
    if (degreeKey === "Bsc") degreeKey = "BSc";
    
    const depts = collegeData.departments?.[degreeKey];
    return Array.isArray(depts) && depts.length > 0 ? depts : getDepartmentsForDegreeFallback(formData.degree);
  };

  // Get available semesters count based on degree
  const getAvailableSemestersCount = () => {
    if (!formData.degree) return 0;

    if (formData.degree === "Diploma") {
      return 6; // 3-year diploma program (6 semesters)
    } else if (["B.Tech", "BA", "Bcom", "Bsc"].includes(formData.degree)) {
      return 8; // 4-year programs (8 semesters)
    } else if (formData.degree === "Master") {
      return 4; // 2-year master program (4 semesters)
    }
    return 0;
  };

  const getAvailableSessions = (degree) => {
    if (!degree) return [];
    if (["B.Tech", "BA", "Bcom", "Bsc"].includes(degree)) {
      return ["2023-27", "2024-28", "2025-29"];
    } else if (degree === "Diploma") {
      return ["2023-26", "2024-27", "2025-28"];
    }
    return ["2024-25", "2025-26"]; // fallback
  };

  // ── Degree normaliser: maps form radio values → Internship model enum ────────
  const normaliseDegree = (deg) => {
    if (!deg) return "";
    const map = { "B.Tech": "BTech", "Bcom": "BCom", "Bsc": "BSc" };
    return map[deg] ?? deg; // Diploma / BA stay as-is
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

  // Get available internship domains: exact match on degree + department from admin-created internships
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

  // Get available modes for the selected internship domain (exact degree + department match)
  // Returns original DB casing: "Online" | "Offline" | "Hybrid"
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
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Invalid email format";
      } else if (!isEmailVerified) {
        newErrors.email = "Please verify your email address using OTP.";
      }
      if (!formData.phone.trim()) {
        newErrors.phone = "Phone number is required";
      } else {
        const cleanedPhone = formData.phone.replace(/\D/g, "");
        let normalizedPhone = cleanedPhone;
        if (cleanedPhone.length === 12 && cleanedPhone.startsWith("91")) {
          normalizedPhone = cleanedPhone.substring(2);
        } else if (cleanedPhone.length === 11 && cleanedPhone.startsWith("0")) {
          normalizedPhone = cleanedPhone.substring(1);
        }

        if (!/^[6-9]\d{9}$/.test(normalizedPhone)) {
          newErrors.phone = "Please enter a valid 10-digit Indian mobile number (should start with 6, 7, 8 or 9)";
        } else {
          formData.phone = normalizedPhone;
        }
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
      if (!formData.password) newErrors.password = "Password is required";
      if (formData.password.length < 6)
        newErrors.password = "Password must be at least 6 characters";
      if (formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = "Passwords do not match";
      
      const payableAmount = getPayableAmount();
      if (payableAmount > 0 && !completedPaymentDetails) {
        newErrors.payment = "Please complete the registration fee payment to proceed.";
      }
    } else if (step === 4) {
      if (!formData.agreeTerms)
        newErrors.agreeTerms = "You must agree to terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

        // Resolve full names for university and college before sending to backend
        const universityObj = universitiesData[formData.university];
        const collegeObj = universityObj?.colleges?.[formData.college];

        const { universityCustom, collegeCustom, ...restFormData } = formData;

        // Register directly
        const userPayload = {
          ...restFormData,
          university: formData.university === "others" ? formData.universityCustom : (universityObj ? universityObj.name : formData.university),
          college: formData.college === "others" ? formData.collegeCustom : (collegeObj ? collegeObj.name : formData.college),
          courseId: purchaseType === "course" ? finalItemId : undefined,
          internshipId: purchaseType === "internship" ? finalItemId : undefined,
          paymentDetails: hasValidExistingPayment ? completedPaymentDetails : undefined,
        };

        const response = await fetch("/api/user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userPayload),
        });

        const data = await response.json();

        if (response.ok) {
          setSuccessModal({
            isOpen: true,
            title: "Registration Successful!",
            message: "Your account has been created successfully. Redirecting you to the login page...",
            onAction: () => {
              router.push("/login");
            },
          });
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        } else {
          alert(data.error || "Registration failed. Please check your details.");
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
    <div className="min-h-screen bg-gradient-to-br from-bg-main via-bg-main to-bg-main dark:from-bg-card-900 dark:via-blue-50-900 dark:to-bg-main-800 py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 animate-fade-in">
          <div className="text-xl font-extrabold tracking-tight text-text-main mb-4">
            <span className="text-bg-main bg-text-main rounded-full p-2">
              Kp
            </span>
            <span className="text-brand-primary">Interns</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-text-main mb-3 font-poppins">
            Student Registration
          </h1>
          <p className="text-sm sm:text-lg text-text-muted px-4">
            Complete your registration for the UGC-mandated internship program
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
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`text-[10px] sm:text-xs mt-2 font-semibold transition-colors text-center px-1 break-words ${index + 1 <= step ? "text-brand-primary" : "text-text-muted"}`}
                >
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
        <div className="bg-bg-card rounded-3xl shadow-xl p-5 sm:p-12 border border-border-main backdrop-blur-sm">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-text-main mb-8">
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
                      placeholder="Enter your full name"
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main focus:outline-none focus:border-brand-primary font-poppins ${
                        errors.fullName
                          ? "border-red-500"
                          : "border-border-main"
                      }`}
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.fullName}
                      </p>
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
                      <p className="text-red-500 text-xs mt-1">
                        {errors.gender}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-text-main mb-2">
                      Email Address *
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={(e) => {
                          // Clear the registered-email block when the user types a new address
                          if (emailAlreadyRegistered) {
                            setEmailAlreadyRegistered(false);
                            setOtpError("");
                          }
                          handleInputChange(e);
                        }}
                        disabled={isEmailVerified}
                        placeholder="you@example.com"
                        className={`w-full sm:flex-1 px-4 py-3 rounded-xl border-2 transition-all bg-bg-main focus:outline-none focus:border-brand-primary font-poppins ${
                          errors.email || emailAlreadyRegistered
                            ? "border-red-500"
                            : "border-border-main"
                        } ${isEmailVerified ? "opacity-60 cursor-not-allowed bg-emerald-500/5 border-emerald-500/30" : ""}`}
                      />
                      {!isEmailVerified && (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={otpLoading || otpCooldown > 0 || emailAlreadyRegistered}
                          className={`w-full sm:w-auto px-4 py-3 rounded-xl font-semibold font-poppins text-sm transition-all disabled:cursor-not-allowed flex items-center justify-center sm:min-w-[110px] ${
                            emailAlreadyRegistered
                              ? "bg-red-100 text-red-600 border-2 border-red-300 opacity-70"
                              : "bg-brand-primary hover:bg-brand-primary/90 text-white disabled:opacity-50"
                          }`}
                        >
                          {otpLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : emailAlreadyRegistered ? (
                            "Already Registered"
                          ) : otpCooldown > 0 ? (
                            `Resend in ${otpCooldown}s`
                          ) : (
                            "Send OTP"
                          )}
                        </button>
                      )}
                    </div>

                    {/* Inline OTP error shown immediately (before OTP input appears) */}
                    {otpError && !otpSent && (
                      <div className="mt-3 flex items-start gap-2.5 p-3.5 bg-red-500/8 border border-red-500/25 rounded-xl animate-fade-in">
                        <span className="text-red-500 text-base mt-0.5 shrink-0">⚠️</span>
                        <div>
                          <p className="text-red-600 text-sm font-semibold">{otpError}</p>
                          {emailAlreadyRegistered && (
                            <p className="text-red-500/80 text-xs mt-1">
                              Please{" "}
                              <a href="/login" className="underline font-bold hover:text-red-600 transition-colors">
                                log in
                              </a>{" "}
                              or use a different email address to register.
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.email}
                      </p>
                    )}
                    {isEmailVerified && (
                      <p className="text-brand-success text-xs mt-1 flex items-center gap-1 font-semibold">
                        <span>✓</span> Email verified successfully!
                      </p>
                    )}
                  </div>

                  {otpSent && !isEmailVerified && (
                    <div className="sm:col-span-2 bg-brand-primary/5 border border-brand-primary/10 rounded-2xl p-5 animate-fade-in space-y-3">
                      <label className="block text-sm font-semibold text-text-main">
                        Enter Verification Code *
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={otpInput}
                          onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                          placeholder="Enter 6-digit OTP"
                          className="w-full sm:flex-1 px-4 py-3 rounded-xl border-2 border-border-main focus:outline-none focus:border-brand-primary bg-bg-main font-mono text-center tracking-widest text-lg font-bold"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={otpInput.length !== 6 || otpVerifyLoading}
                          className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold font-poppins text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {otpVerifyLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            "Verify Code"
                          )}
                        </button>
                      </div>
                      {otpError && (
                        <p className="text-red-500 text-xs mt-1 font-medium">
                          {otpError}
                        </p>
                      )}
                      <p className="text-text-muted text-[11px] font-poppins">
                        An OTP code was sent to <span className="font-semibold text-text-main">{formData.email}</span>. Please check your inbox or spam folder.
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 98765 43210"
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main focus:outline-none focus:border-brand-primary font-poppins ${
                        errors.phone ? "border-red-500" : "border-border-main"
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.phone}
                      </p>
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
                        errors.parentName
                          ? "border-red-500"
                          : "border-border-main"
                      }`}
                    />
                    {errors.parentName && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.parentName}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Academic Information */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-text-main mb-8">
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
                        errors.university
                          ? "border-red-500"
                          : "border-border-main"
                      }`}
                    >
                      <option value="">Select University</option>
                      {Object.entries(universitiesData).map(
                        ([key, university]) => (
                          <option key={key} value={key}>
                            {university.name}
                          </option>
                        ),
                      )}
                      <option value="others">Others</option>
                    </select>
                    {errors.university && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.university}
                      </p>
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
                          <p className="text-red-500 text-xs mt-1">
                            {errors.universityCustom}
                          </p>
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
                        {formData.university
                          ? "Select College"
                          : "Select University first"}
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
                      <p className="text-red-500 text-xs mt-1">
                        {errors.college}
                      </p>
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
                          <p className="text-red-500 text-xs mt-1">
                            {errors.collegeCustom}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-2">
                      Degree *
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {["Diploma", "B.Tech", "BA", "Bcom","Bsc"].map(
                        (degree) => (
                          <label
                            key={degree}
                            className="flex items-center cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="degree"
                              value={degree}
                              checked={formData.degree === degree}
                              onChange={handleInputChange}
                              className="w-4 h-4 accent-brand-primary cursor-pointer"
                            />
                            <span className="ml-2 text-sm font-medium text-text-main">
                              {degree}
                            </span>
                          </label>
                        ),
                      )}
                    </div>
                    {errors.degree && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.degree}
                      </p>
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
                        errors.department
                          ? "border-red-500"
                          : "border-border-main"
                      } ${!formData.college ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <option value="">
                        {formData.college
                          ? "Select Department"
                          : "Select College first"}
                      </option>
                      {getAvailableDepartments().map((dept, index) => (
                        <option key={index} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                    {errors.department && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.department}
                      </p>
                    )}
                  </div>

                  {/* Dynamically Generated Semester Options */}
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
                        errors.semester
                          ? "border-red-500"
                          : "border-border-main"
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
                          (_, i) => i + 1,
                        ).map((sem) => {
                          // Appends correct ordinal suffix (1st, 2nd, 3rd, 4th...)
                          const suffix =
                            sem === 1
                              ? "st"
                              : sem === 2
                                ? "nd"
                                : sem === 3
                                  ? "rd"
                                  : "th";
                          return (
                            <option key={sem} value={sem}>
                              {sem}
                              {suffix} Semester
                            </option>
                          );
                        })}
                    </select>
                    {errors.semester && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.semester}
                      </p>
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
                      <p className="text-red-500 text-xs mt-1">
                        {errors.session}
                      </p>
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
                      placeholder="Enter roll number"
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main focus:outline-none focus:border-brand-primary font-poppins ${
                        errors.rollNumber ? "border-red-500" : "border-border-main"
                      }`}
                    />
                    {errors.rollNumber && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.rollNumber}
                      </p>
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
                      placeholder="Enter registration number"
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main focus:outline-none focus:border-brand-primary font-poppins ${
                        errors.registrationNumber
                          ? "border-red-500"
                          : "border-border-main"
                      }`}
                    />
                    {errors.registrationNumber && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.registrationNumber}
                      </p>
                    )}
                  </div>

                  {purchaseType === "course" ? (
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-text-main mb-2">
                        Selected Course
                      </label>
                      <div className="w-full px-4 py-3 rounded-xl border-2 border-border-main bg-bg-main font-poppins font-medium text-brand-primary">
                        📚 {selectedItemDetails?.title || "Loading course..."}
                      </div>
                    </div>
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
                            errors.internshipId
                              ? "border-red-500"
                              : "border-border-main"
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
                          <p className="text-red-500 text-xs mt-1">
                            {errors.internshipId}
                          </p>
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
                    </>
                  )}
                </div>
              </div>
            )}
            {/* Step 3: Security & Payments */}
            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-text-main mb-8">
                  Security & Payments
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-border-main/50">
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
                          errors.password
                            ? "border-red-500"
                            : "border-border-main"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-3 text-text-muted hover:text-text-main"
                      >
                        {showPassword ? (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.password}
                      </p>
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
                      placeholder="Confirm your password"
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-bg-main focus:outline-none focus:border-brand-primary font-poppins ${
                        errors.confirmPassword
                          ? "border-red-500"
                          : "border-border-main"
                      }`}
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                {/* Payments Block */}
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
                              <span className="block text-[10px] font-mono text-text-muted mt-0.5 select-all">Ref ID: {completedPaymentDetails.razorpay_payment_id}</span>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={handlePayFee}
                            disabled={isLoading}
                            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/95 hover:to-brand-secondary/95 text-white font-bold rounded-xl shadow-lg hover:shadow-brand-primary/25 active:scale-95 transition-all text-sm font-poppins"
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
                        <span className="text-text-muted text-sm">This internship/course registration is free. You can proceed directly.</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Register & Review */}
            {step === 4 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-text-main mb-6">
                  Review & Register
                </h2>
                <p className="text-text-muted text-sm mb-6">
                  Please review your details carefully before completing registration.
                </p>

                {/* Summary Details Grid */}
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
                      <span className="text-text-muted text-xs block">{purchaseType === "course" ? "Selected Course" : "Selected Internship"}</span>
                      <span className="text-brand-primary font-bold">
                        {purchaseType === "course" 
                          ? (selectedItemDetails?.title || "Selected Course")
                          : `${dbInternships.find(item => item._id === formData.internshipId)?.title || selectedItemDetails?.title || formData.internshipDomain || "N/A"} (${formData.mode})`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Status Summary */}
                {getPayableAmount() > 0 && completedPaymentDetails && (
                  <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold block text-sm">✅ Payment Verified</span>
                      <span className="text-text-muted font-mono text-[10px] select-all">Ref: {completedPaymentDetails.razorpay_payment_id}</span>
                    </div>
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">₹{getPayableAmount()}</span>
                  </div>
                )}

                {/* Terms Checkbox */}
                <label className="flex items-start cursor-pointer p-4 rounded-xl border-2 border-border-main hover:border-brand-primary transition-colors group">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleInputChange}
                    className="w-5 h-5 rounded accent-brand-primary cursor-pointer mt-1 flex-shrink-0"
                  />
                  <span className="ml-3 text-sm text-text-muted group-hover:text-text-main transition-colors">
                    I agree to the{" "}
                    <Link
                      href="/terms-of-use"
                      target="_blank"
                      className="text-brand-primary hover:underline font-semibold"
                    >
                      Terms & Privacy Policy
                    </Link>{" "}
                    and internship terms.
                  </span>
                </label>
                {errors.agreeTerms && (
                  <p className="text-red-500 text-xs">{errors.agreeTerms}</p>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8 pt-8 border-t border-border-main">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 px-6 py-3 rounded-xl border-2 border-border-main text-text-main font-semibold hover:border-brand-primary hover:bg-bg-main transition-all hover:shadow-md"
                >
                  ← Back
                </button>
              )}
              {step < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold hover:shadow-lg hover:shadow-brand-primary/30 transition-all transform hover:scale-105"
                >
                  Next →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold hover:shadow-lg hover:shadow-brand-primary/30 transition-all transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
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

            {/* Login Link */}
            <p className="text-center mt-6 text-text-muted text-sm">
              Already registered?{" "}
              <Link
                href="/login"
                className="text-brand-primary font-semibold hover:underline"
              >
                Login here
              </Link>
            </p>
          </form>
        </div>
      </div>
      <SuccessAlertModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal((prev) => ({ ...prev, isOpen: false }))}
        title={successModal.title}
        message={successModal.message}
        onAction={successModal.onAction}
      />
    </div>
  );
}
