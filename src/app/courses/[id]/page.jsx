"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import VideoPlayer from "@/components/VideoPlayer";
import SuccessAlertModal from "@/components/SuccessAlertModal";

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

const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  let videoId = null;
  try {
    const urlObj = new URL(url.trim());
    if (urlObj.hostname.includes("youtube.com") || urlObj.hostname.includes("youtu.be")) {
      if (urlObj.hostname.includes("youtu.be")) {
        const segment = urlObj.pathname.split("/").filter(Boolean)[0];
        if (segment) videoId = segment.split(/[?#]/)[0];
      } else if (urlObj.pathname.includes("/embed/")) {
        videoId = urlObj.pathname.split("/embed/")[1]?.split(/[?#]/)[0];
      } else if (urlObj.pathname.includes("/shorts/")) {
        videoId = urlObj.pathname.split("/shorts/")[1]?.split(/[?#]/)[0];
      } else if (urlObj.pathname.includes("/live/")) {
        videoId = urlObj.pathname.split("/live/")[1]?.split(/[?#]/)[0];
      } else {
        videoId = urlObj.searchParams.get("v");
      }
    }
  } catch (e) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|live\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2] && match[2].length === 11) {
      videoId = match[2];
    }
  }
  if (videoId && videoId.length === 11) {
    return `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&controls=1&showinfo=0&iv_load_policy=3&fs=1`;
  }
  return null;
};

export default function CourseDetailLearnPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id;

  const [course, setCourse] = useState(null);
  const [selectedModuleIndex, setSelectedModuleIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [showAllUpdates, setShowAllUpdates] = useState(false);
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });
  const [collegeRates, setCollegeRates] = useState({ registered: false, internshipRate: 0, courseRate: 0 });

  const userCourseData = userData?.ActiveCources?.find(
    (c) => (c.course?._id || c.course) === courseId
  );

  const handleToggleModuleComplete = async (moduleId) => {
    if (!userData || !courseId || !moduleId) return;

    setIsUpdatingProgress(true);
    try {
      const isCompleted = userCourseData?.completedModules?.includes(moduleId);
      const token = localStorage.getItem("userToken");
      const res = await fetch("/api/user/progress", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: userData._id,
          itemId: courseId,
          type: "course",
          moduleId: moduleId,
          completed: !isCompleted,
        }),
      });

      const result = await res.json();
      if (res.ok && result.success && result.data) {
        setUserData(result.data);
        localStorage.setItem("userData", JSON.stringify(result.data));
      } else {
        alert(result.error || "Failed to update module progress");
      }
    } catch (err) {
      console.error("Error toggling module progress:", err);
      alert("An error occurred while updating your progress.");
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  useEffect(() => {
    // Check if user is logged in and enrolled
    const token = localStorage.getItem("userToken");
    const userJson = localStorage.getItem("userData");

    if (userJson) {
      try {
        const parsedUser = JSON.parse(userJson);
        setTimeout(() => {
          setUserData(parsedUser);

          // Check if this course id is in their ActiveCources
          const enrolled = (parsedUser.ActiveCources || []).some(
            c => (c.course?._id || c.course) === courseId
          );
          setIsEnrolled(enrolled);
        }, 0);

        // Fetch fresh profile details from DB to sync
        fetch(`/api/user?id=${parsedUser._id}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })
          .then(res => res.json())
          .then(result => {
            if (result.success && result.data) {
              setTimeout(() => {
                setUserData(result.data);
                localStorage.setItem("userData", JSON.stringify(result.data));
                const freshEnrolled = (result.data.ActiveCources || []).some(
                  c => (c.course?._id || c.course) === courseId
                );
                setIsEnrolled(freshEnrolled);
              }, 0);
            }
          })
          .catch(err => console.error("Error syncing profile:", err));
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }

    const fetchCourse = async () => {
      try {
        const res = await fetch(`/api/course?id=${courseId}`);
        const data = await res.json();
        if (data.success && data.data) {
          setCourse(data.data);
        } else {
          setError(data.error || "Failed to load course details");
        }
      } catch (err) {
        console.error(err);
        setError("An error occurred while loading course content.");
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  useEffect(() => {
    const fetchCollegeRates = async () => {
      if (!userData?.college) return;
      try {
        const res = await fetch(`/api/college-rate?college=${encodeURIComponent(userData.college.trim())}`);
        const data = await res.json();
        if (data.success && data.registered) {
          setCollegeRates({
            registered: true,
            internshipRate: data.internshipRate || 0,
            courseRate: data.courseRate || 0
          });
        }
      } catch (err) {
        console.error("Error fetching college rates:", err);
      }
    };
    if (userData?.college) {
      fetchCollegeRates();
    }
  }, [userData?.college]);

  const handleEnrollMock = async () => {
    if (!userData) {
      router.push(`/register?type=course&id=${courseId}`);
      return;
    }

    const originalPrice = course.price || 0;
    const price = (collegeRates.registered && collegeRates.courseRate > 0)
      ? collegeRates.courseRate
      : originalPrice;

    try {
      setIsLoading(true);

      if (price === 0) {
        // Free course enrollment - direct PUT update
        const updatedActiveCourses = [
          ...(userData.ActiveCources || []),
          {
            course: courseId,
            courseStatus: "Active",
            progress: 0,
            paymentStatus: true,
            paymentDate: new Date(),
            amount: 0,
          },
        ];

        const token = localStorage.getItem("userToken");
        const res = await fetch(`/api/user?id=${userData._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ ActiveCources: updatedActiveCourses }),
        });

        const data = await res.json();
        if (data.success) {
          localStorage.setItem("userData", JSON.stringify(data.data));
          setIsEnrolled(true);
          setSuccessModal({
            isOpen: true,
            title: "Enrollment Successful!",
            message: `Successfully enrolled in the course: ${course.title}!`,
          });
        } else {
          alert(data.error || "Failed to enroll in course");
        }
      } else {
        // Paid course enrollment - Razorpay flow
        const token = localStorage.getItem("userToken");
        const headers = { "Content-Type": "application/json" };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        const resOrder = await fetch("/api/payment/order", {
          method: "POST",
          headers,
          body: JSON.stringify({ 
            type: "course", 
            itemId: courseId,
            university: userData?.university,
            college: userData?.college
          }),
        });

        const orderData = await resOrder.json();
        if (!resOrder.ok) {
          throw new Error(orderData.error || "Failed to initiate payment");
        }

        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          alert("Failed to load payment gateway. Please check your internet connection.");
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
            try {
              setIsLoading(true);
              const token = localStorage.getItem("userToken");
              const verifyRes = await fetch("/api/payment/verify", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  userId: userData._id,
                  type: "course",
                  itemId: courseId,
                }),
              });

              const verifyData = await verifyRes.json();

              if (verifyRes.ok && verifyData.success) {
                localStorage.setItem("userData", JSON.stringify(verifyData.data));
                setIsEnrolled(true);
                setSuccessModal({
                  isOpen: true,
                  title: "Enrollment Successful!",
                  message: `Successfully paid and enrolled in the course: ${course.title}!`,
                });
              } else {
                alert(verifyData.error || "Payment verification failed.");
              }
            } catch (err) {
              console.error("Verification error:", err);
              alert("An error occurred during payment verification.");
            } finally {
              setIsLoading(false);
            }
          },
          prefill: {
            name: userData.fullName,
            email: userData.email,
            contact: userData.phone,
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
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Error enrolling in course");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
          <p className="mt-4 text-text-muted">Loading learning portal...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center px-4">
        <div className="text-center bg-bg-card border-2 border-border-main p-8 rounded-2xl max-w-md">
          <span className="text-4xl block mb-4">⚠️</span>
          <p className="text-red-500 font-bold mb-4">{error || "Course not found"}</p>
          <Link href="/courses" className="px-6 py-2.5 bg-brand-primary text-white rounded-xl shadow font-semibold">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const currentModule = course.content?.[selectedModuleIndex];

  return (
    <div className="min-h-screen bg-bg-main text-text-main flex flex-col">
      {/* Course Title Header */}
      <div className="bg-bg-card border-b border-border-main py-6 px-4 sm:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-brand-primary/10 text-brand-primary text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                {course.department}
              </span>
              <span className="bg-bg-main text-text-muted text-xs font-semibold px-2.5 py-1 rounded-md border border-border-main">
                {course.domain}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-poppins">{course.title}</h1>
          </div>

          <div>
            {!isEnrolled ? (
              <button
                onClick={handleEnrollMock}
                className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-2.5 px-6 rounded-xl shadow transition"
              >
                Enroll Now {course.isFree ? "(Free)" : `- ₹${(collegeRates.registered && collegeRates.courseRate > 0) ? collegeRates.courseRate : course.price}`}
              </button>
            ) : (
              <span className="bg-brand-success/10 border border-brand-success/30 text-brand-success font-bold py-2 px-4 rounded-xl flex items-center gap-2 text-sm">
                <span className="w-2 h-2 bg-brand-success rounded-full animate-pulse"></span>
                Active Learning Profile
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Learning Hub Layout */}
      {!isEnrolled ? (
        /* Preview Layout */
        <div className="max-w-4xl mx-auto py-12 px-4 flex-1 w-full">
          <div className="bg-bg-card border-2 border-border-main rounded-2xl p-8 shadow-md space-y-8">

            {/* Course Overview */}
            <div>
              <h2 className="text-2xl font-bold mb-4 font-poppins">Course Overview</h2>
              <p className="text-text-muted leading-relaxed">{course.description}</p>
            </div>

            {/* Instructor Details Section */}
            {course.instructor && course.instructor.length > 0 && (
              console.log(course.instructor),
              <div className="pt-6 border-t border-border-main/60">
                <h3 className="text-lg font-bold mb-4 font-poppins">Meet your Instructors</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {course.instructor.map((inst, idx) => (
                    <div key={inst._id || idx} className="flex items-center space-x-3 bg-bg-main p-4 rounded-xl border border-border-main">
                      {/* Avatar Icon */}
                      <div className="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary font-bold flex items-center justify-center border border-brand-primary/20 shrink-0">
                        {inst.id?.name ? inst.id.name.charAt(0).toUpperCase() : "I"}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-text-main">
                          {inst.id?.name || "Expert Faculty"}
                        </h4>
                        {inst.id?.role && (
                          <p className="text-xs text-text-muted capitalize">
                            {inst.id.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* What you will learn */}
            <div className="pt-6 border-t border-border-main/60">
              <h3 className="text-lg font-bold mb-4 font-poppins">What you will learn</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(course.learningOutcomes || []).map((outcome, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-text-muted">
                    <span className="text-brand-success font-bold text-lg leading-none">✓</span>
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Syllabus Outline */}
            <div className="pt-6 border-t border-border-main/60">
              <h3 className="text-lg font-bold mb-4 font-poppins">Syllabus Outline</h3>
              <div className="space-y-3">
                {(course.content || []).map((mod, idx) => (
                  <div key={idx} className="bg-bg-main border border-border-main p-4 rounded-xl flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="font-semibold text-sm">{mod.title}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* Enrolled Learning Dashboard */
        <div className="flex-1 max-w-8xl w-full mx-auto flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
          {/* Progress Section */}
          <div className="bg-bg-card border-2 border-border-main rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in animate-gradient">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold font-poppins text-text-muted">Course Completion Progress</span>
                <span className="text-sm font-bold font-poppins text-brand-primary">{userCourseData?.progress || 0}%</span>
              </div>
              <div className="w-full bg-border-main rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full transition-all duration-500"
                  style={{ width: `${userCourseData?.progress || 0}%` }}
                ></div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border ${userCourseData?.courseStatus === "Completed"
                ? "bg-brand-success/15 border-brand-success/30 text-brand-success"
                : "bg-brand-primary/15 border-brand-primary/30 text-brand-primary"
                }`}>
                {userCourseData?.courseStatus === "Completed" ? "🏆 Completed" : "⚡ In Progress"}
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar - Modules list */}
            <div className="w-full md:w-80 shrink-0 space-y-4">
              <div className="bg-bg-card border-2 border-border-main rounded-2xl p-4 shadow-sm">
                <h3 className="font-bold text-sm uppercase tracking-wider text-text-muted mb-4 px-2">
                  Lessons Map
                </h3>

                {/* Course Updates */}
                {course.updates && course.updates.length > 0 && (
                  <div className="mb-4 p-3 bg-brand-primary/5 border border-brand-primary/20 rounded-xl space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand-primary flex items-center gap-1 px-1">
                      📢 Updates
                    </h4>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {(course.updates || []).slice(-2).reverse().map((update, idx) => (
                        <div key={idx} className="text-xs leading-relaxed border-b border-border-main/40 pb-1.5 last:border-b-0 last:pb-0">
                          {update.externalLink ? (
                            <a
                              href={update.externalLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-text-main hover:text-brand-primary font-medium hover:underline block"
                            >
                              {update.title} 🔗
                            </a>
                          ) : (
                            <span className="text-text-muted block">{update.title}</span>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setShowAllUpdates(true)}
                      className="text-xs font-bold text-brand-primary hover:underline mt-2 block w-full text-left cursor-pointer"
                    >
                      All Updates →
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  {(course.content || []).map((mod, idx) => {
                    const isCompleted = userCourseData?.completedModules?.includes(mod._id);
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedModuleIndex(idx);
                          setShowAllUpdates(false);
                        }}
                        className={`w-full text-left p-3 rounded-xl border text-sm font-semibold transition-all flex items-start gap-3 ${selectedModuleIndex === idx
                          ? "bg-brand-primary/10 border-brand-primary text-brand-primary shadow-sm"
                          : "bg-bg-card border-border-main hover:bg-bg-main text-text-muted hover:text-text-main"
                          }`}
                      >
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${isCompleted
                          ? "bg-brand-success text-white"
                          : selectedModuleIndex === idx
                            ? "bg-brand-primary text-white"
                            : "bg-bg-main"
                          }`}>
                          {isCompleted ? "✓" : idx + 1}
                        </span>
                        <span className="line-clamp-2 mt-0.5">{mod.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Module Content Pane */}
            <div className="flex-1 bg-bg-card border-2 border-border-main rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col min-w-0">
              {showAllUpdates ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-border-main">
                    <div>
                      <span className="text-xs font-bold text-brand-primary uppercase tracking-widest block mb-1">
                        Announcements
                      </span>
                      <h2 className="text-2xl font-bold font-poppins">All Course Updates</h2>
                    </div>
                    <button
                      onClick={() => setShowAllUpdates(false)}
                      className="px-4 py-2 bg-bg-main hover:bg-border-main text-text-muted hover:text-text-main rounded-xl border border-border-main text-xs font-bold transition cursor-pointer"
                    >
                      Back to Lesson
                    </button>
                  </div>

                  <div className="space-y-4">
                    {(course.updates || []).slice().reverse().map((update, idx) => (
                      <div key={idx} className="p-5 bg-bg-main border border-border-main rounded-2xl space-y-2 animate-fade-in">
                        <span className="text-xs font-semibold text-text-muted">
                          Update #{course.updates.length - idx}
                        </span>
                        <h3 className="font-bold text-base text-text-main">{update.title}</h3>
                        {update.externalLink && (
                          <a
                            href={update.externalLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 px-3 py-1.5 rounded-lg border border-brand-primary/20 transition mt-2"
                          >
                            🔗 Attachment Link
                          </a>
                        )}
                      </div>
                    ))}
                    {(!course.updates || course.updates.length === 0) && (
                      <div className="text-center py-12 text-text-muted">
                        <span className="text-3xl block mb-2">📢</span>
                        <p>No updates published yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : currentModule ? (
                <div className="space-y-6">

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-main">
                    <div>
                      <span className="text-xs font-bold text-brand-primary uppercase tracking-widest block mb-1">
                        Lesson {selectedModuleIndex + 1}
                      </span>
                      <h2 className="text-2xl font-bold font-poppins">{currentModule.title}</h2>
                    </div>
                    <div>
                      <button
                        onClick={() => handleToggleModuleComplete(currentModule._id)}
                        disabled={isUpdatingProgress}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition duration-200 border cursor-pointer ${userCourseData?.completedModules?.includes(currentModule._id)
                          ? "bg-brand-success/10 border-brand-success/30 text-brand-success hover:bg-brand-success/20"
                          : "bg-brand-primary text-white border-brand-primary hover:bg-brand-primary/90"
                          }`}
                      >
                        {userCourseData?.completedModules?.includes(currentModule._id)
                          ? "✓ Completed"
                          : "Mark as Complete"}
                      </button>
                    </div>
                  </div>

                  {/* Video Player */}
                  {(currentModule.VideoUrl || (currentModule.externalink && getYouTubeEmbedUrl(currentModule.externalink))) && (
                    <VideoPlayer videoUrl={currentModule.VideoUrl || currentModule.externalink} />
                  )}

                  {/* Text Content */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold font-poppins">Lesson Context</h3>
                    <p className="text-text-muted text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                      {currentModule.textContent || "No text description provided for this lesson."}
                    </p>
                  </div>

                  {/* Resources */}
                  {(currentModule.pdfurl || (currentModule.externalink && !getYouTubeEmbedUrl(currentModule.externalink))) && (
                    <div className="pt-6 border-t border-border-main space-y-3">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-text-muted">
                        Study Materials & Resource Links
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {currentModule.pdfurl && (
                          <a
                            href={currentModule.pdfurl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-xs font-bold text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 px-4 py-2 rounded-lg border border-brand-primary/20 transition"
                          >
                            📄 Download Notes / PDF
                          </a>
                        )}
                        {currentModule.externalink && !getYouTubeEmbedUrl(currentModule.externalink) && (
                          <a
                            href={currentModule.externalink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-xs font-bold text-brand-secondary bg-brand-secondary/10 hover:bg-brand-secondary/20 px-4 py-2 rounded-lg border border-brand-secondary/20 transition"
                          >
                            🔗 External Reference Link
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-20 text-text-muted">
                  <span className="text-4xl block mb-4">📔</span>
                  <p>No content available for this lesson.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <SuccessAlertModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal((prev) => ({ ...prev, isOpen: false }))}
        title={successModal.title}
        message={successModal.message}
      />
    </div>
  );
}