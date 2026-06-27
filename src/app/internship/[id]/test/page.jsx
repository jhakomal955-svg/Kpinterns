"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";

export default function InternshipTestPage() {
  const params = useParams();
  const router = useRouter();
  const internshipId = params.id;

  const [internship, setInternship] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Quiz State
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("userToken");
        const savedUser = localStorage.getItem("userData");
        if (!token || !savedUser) {
          router.push("/login");
          return;
        }

        const parsedUser = JSON.parse(savedUser);

        // Fetch fresh profile data to get latest enrollment status
        const profileRes = await fetch(`/api/user?id=${parsedUser._id}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const profileData = await profileRes.json();
        
        if (!profileRes.ok || !profileData.success) {
          throw new Error(profileData.error || "Failed to fetch profile details");
        }

        const userEnrollment = profileData.data.ActiveInternship?.find(
          (i) => (i.internship?._id || i.internship)?.toString() === internshipId
        );

        if (!userEnrollment) {
          setError("You are not enrolled in this internship.");
          setIsLoading(false);
          return;
        }

        setEnrollment(userEnrollment);

        if (userEnrollment.internshipStatus !== "Completed") {
          setError("You must complete the internship requirements and progress before appearing for this test.");
          setIsLoading(false);
          return;
        }

        if (userEnrollment.testTaken) {
          setTestResult({
            score: userEnrollment.testScore,
            alreadyTaken: true,
          });
          setIsLoading(false);
          return;
        }

        // Fetch internship test questions (which strips correctOptionIndex for students)
        const internRes = await fetch(`/api/internship?id=${internshipId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const internData = await internRes.json();

        if (!internRes.ok || !internData.success) {
          throw new Error(internData.error || "Failed to load test questions");
        }

        if (!internData.data?.test || internData.data.test.status !== "Published") {
          setError("The test is currently not available for this internship.");
          setIsLoading(false);
          return;
        }

        setInternship(internData.data);
      } catch (err) {
        console.error(err);
        setError(err.message || "An error occurred while loading the test.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [internshipId, router]);

  const handleSelectOption = (optIdx) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIdx]: optIdx,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(currentQuestionIdx - 1);
    }
  };

  const handleSubmitTest = async () => {
    const unansweredCount = questions.length - Object.keys(selectedAnswers).length;
    if (unansweredCount > 0) {
      const confirmSubmit = window.confirm(
        `You have ${unansweredCount} unanswered questions. Are you sure you want to submit?`
      );
      if (!confirmSubmit) return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("userToken");
      
      const answersArray = questions.map((_, idx) => 
        selectedAnswers[idx] !== undefined ? selectedAnswers[idx] : null
      );

      const res = await fetch("/api/internship/submit-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          internshipId,
          answers: answersArray
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          score: data.score,
          alreadyTaken: false,
        });

        // Trigger local storage user data sync back
        const savedUser = localStorage.getItem("userData");
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          if (parsed.ActiveInternship) {
            const idx = parsed.ActiveInternship.findIndex(
              (i) => (i.internship?._id || i.internship)?.toString() === internshipId
            );
            if (idx !== -1) {
              parsed.ActiveInternship[idx].testTaken = true;
              parsed.ActiveInternship[idx].testScore = data.score;
              localStorage.setItem("userData", JSON.stringify(parsed));
            }
          }
        }
      } else {
        alert(data.error || "Failed to submit test. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting test.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-main dark:bg-bg-main flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
          <p className="mt-4 text-text-muted font-poppins">Loading test details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-main dark:bg-bg-main flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-bg-card rounded-2xl border border-border-main p-8 shadow-xl text-center space-y-5 animate-fade-in">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto text-2xl">
            ⚠️
          </div>
          <h2 className="text-2xl font-bold text-text-main font-poppins">Access Restriction</h2>
          <p className="text-sm text-text-muted leading-relaxed font-poppins">{error}</p>
          <Link
            href="/profile"
            className="inline-block w-full py-3 bg-brand-primary text-white rounded-xl hover:shadow-lg transition font-semibold font-poppins"
          >
            Return to Profile
          </Link>
        </div>
      </div>
    );
  }

  // Result display
  if (testResult) {
    const isPassed = testResult.score >= 50; // passing criteria
    return (
      <div className="min-h-screen bg-gradient-to-br from-bg-main to-bg-card flex items-center justify-center px-4 py-8">
        <ScrollReveal direction="up" duration={600}>
          <div className="max-w-md w-full bg-bg-card rounded-3xl border border-border-main p-8 shadow-2xl text-center space-y-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner ${
              isPassed ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
            }`}>
              {isPassed ? "🏆" : "🎯"}
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-text-main font-poppins">Test Result</h2>
              <p className="text-sm text-text-muted font-poppins">
                {testResult.alreadyTaken 
                  ? "You have already completed this assessment." 
                  : "Thank you for completing the final assessment!"}
              </p>
            </div>

            <div className="bg-bg-main/50 p-6 rounded-2xl border border-border-main/50 space-y-2">
              <span className="text-xs uppercase font-extrabold tracking-widest text-text-muted block">Your Score</span>
              <span className={`text-5xl font-black font-poppins ${isPassed ? "text-emerald-500" : "text-amber-500"}`}>
                {testResult.score}%
              </span>
              <p className="text-xs text-text-muted pt-2">
                This score has been recorded and printed on your internship completion certificate.
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/profile"
                className="block w-full py-3 bg-brand-primary text-white rounded-xl hover:shadow-lg transition font-semibold font-poppins text-sm"
              >
                Go to My Profile & Certificate
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    );
  }

  const questions = internship.test?.questions || [];
  const currentQuestion = questions[currentQuestionIdx];
  const progressPercent = Math.round(((currentQuestionIdx + 1) / questions.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-main to-bg-card py-12 px-4">
      <div className="max-w-3xl mx-auto w-full space-y-6">
        
        {/* Header Block */}
        <div className="bg-bg-card rounded-2xl border border-border-main p-6 shadow-md flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-text-main font-poppins line-clamp-1">{internship.title}</h1>
            <p className="text-xs text-text-muted font-poppins">Final Assessment Test</p>
          </div>
          <Link
            href="/profile"
            className="text-xs text-text-muted hover:text-brand-primary font-semibold font-poppins border border-border-main hover:border-brand-primary px-3 py-1.5 rounded-lg transition"
          >
            Exit Test
          </Link>
        </div>

        {/* Quiz Box */}
        <div className="bg-bg-card rounded-3xl border border-border-main p-8 shadow-xl space-y-6 relative overflow-hidden">
          {/* Top Progress Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-border-main">
            <div 
              className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-xs text-text-muted font-semibold font-poppins">
            <span>QUESTION {currentQuestionIdx + 1} OF {questions.length}</span>
            <span>{progressPercent}% COMPLETE</span>
          </div>

          {currentQuestion && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-text-main font-poppins leading-relaxed">
                {currentQuestion.questionText}
              </h2>

              <div className="grid grid-cols-1 gap-3">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedAnswers[currentQuestionIdx] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      className={`text-left p-4 rounded-xl border-2 transition-all duration-200 font-poppins font-medium flex items-center justify-between group ${
                        isSelected 
                          ? "bg-brand-primary/5 border-brand-primary text-brand-primary"
                          : "bg-bg-main/30 border-border-main text-text-main hover:border-border-main/80 hover:bg-bg-main/60"
                      }`}
                    >
                      <span>{option}</span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected 
                          ? "border-brand-primary bg-brand-primary text-white"
                          : "border-border-main group-hover:border-text-muted"
                      }`}>
                        {isSelected && <span className="text-[10px]">✓</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-border-main/50">
            <button
              onClick={handlePrev}
              disabled={currentQuestionIdx === 0}
              className="px-5 py-2.5 bg-bg-main border border-border-main text-text-main hover:bg-bg-card rounded-xl font-semibold transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentQuestionIdx === questions.length - 1 ? (
              <button
                onClick={handleSubmitTest}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-brand-primary hover:bg-brand-primary/95 text-white rounded-xl font-semibold shadow transition text-sm flex items-center gap-1.5 animate-pulse"
              >
                {isSubmitting ? "Submitting..." : "Submit Test"}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-2.5 bg-brand-primary hover:bg-brand-primary/95 text-white rounded-xl font-semibold shadow transition text-sm"
              >
                Next Question
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
