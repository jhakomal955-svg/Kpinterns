"use client";

import React, { useState, useEffect } from "react";
import ScrollReveal from "./ScrollReveal.jsx";

const Testimonials = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Auth state
  const [token, setToken] = useState("");
  const [userData, setUserData] = useState(null);
  
  // Form input state
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const fallbackReviews = [
    {
      name: "Abyab",
      role: "Student | Batch 01",
      university: "Patna University",
      rating: 5,
      comment: "An amazing platform that helped me complete my mandatory college internship project and transfer my academic credits successfully. The mentor support was exceptional!",
      initial: "A",
      gradient: "from-brand-primary to-brand-secondary",
    },
    {
      name: "Nisha Kumari",
      role: "Student | Batch 02",
      university: "LNMU Darbhanga",
      rating: 5,
      comment: "I completed the Python for AI program. The live classes on Google Meet were highly interactive, and the certificate QR code verification worked instantly when my college verified it.",
      initial: "N",
      gradient: "from-brand-secondary to-brand-success",
    },
    {
      name: "Rishabh Raj",
      role: "Student | Batch 01",
      university: "Magadh University",
      rating: 5,
      comment: "Top-notch technical training at a highly affordable price (₹400-₹500). My mentor guided me through WhatsApp and live calls to deploy my final capstone project.",
      initial: "R",
      gradient: "from-brand-success to-brand-primary",
    },
    {
      name: "Priya Singh",
      role: "Student | Batch 03",
      university: "BRABU Muzaffarpur",
      rating: 5,
      comment: "Because the program fits our semester calendar, I didn't face any academic workload. My 4 credits got successfully validated by my department head.",
      initial: "P",
      gradient: "from-brand-primary to-brand-success",
    },
  ];

  // Fetch testimonials list
  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/testimonial");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data && data.data.length > 0) {
          // Format testimonials data to match review visual cards
          const formatted = data.data.map(item => ({
            _id: item._id,
            name: item.name,
            role: item.role,
            university: item.university,
            rating: item.rating,
            comment: item.comment,
            initial: item.name?.charAt(0).toUpperCase() || "S",
            gradient: getRandomGradient(item.name)
          }));
          setReviews(formatted);
        } else {
          setReviews(fallbackReviews);
        }
      } else {
        setReviews(fallbackReviews);
      }
    } catch (err) {
      console.error("Error fetching testimonials:", err);
      setReviews(fallbackReviews);
    } finally {
      setLoading(false);
    }
  };

  // Helper to generate consistent color gradient based on student's name
  const getRandomGradient = (name) => {
    const code = name ? name.charCodeAt(0) % 3 : 0;
    if (code === 0) return "from-brand-primary to-brand-secondary";
    if (code === 1) return "from-brand-secondary to-brand-success";
    return "from-brand-success to-brand-primary";
  };

  useEffect(() => {
    fetchTestimonials();

    // Check login state
    const userToken = localStorage.getItem("userToken");
    const userJson = localStorage.getItem("userData");
    if (userToken && userJson) {
      setToken(userToken);
      try {
        setUserData(JSON.parse(userJson));
      } catch (e) {
        console.error("Failed to parse user data in testimonials:", e);
      }
    }
  }, []);

  const handleRatingClick = (val) => {
    setFormError("");
    setRating(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!comment || comment.trim().length < 10) {
      setFormError("Feedback must be at least 10 characters long.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/testimonial", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          comment: comment,
          rating: rating
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFormSuccess(data.message || "Thank you! Your testimonial has been saved.");
        setComment("");
        // Reload testimonials list
        await fetchTestimonials();
      } else {
        setFormError(data.error || "Failed to submit testimonial. Please try again.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      setFormError("An error occurred. Please verify your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative px-4 sm:px-8 lg:px-[60px] py-16 bg-bg-main overflow-hidden border-t border-border-main/40">
      {/* Background decoration */}
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-gradient-to-tl from-brand-primary/10 to-transparent rounded-full blur-3xl -z-10"></div>

      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <ScrollReveal className="text-center mb-12" direction="fade">
          <p className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-brand-primary mb-3">
            Student Success
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-text-main leading-tight mb-4">
            Loved by Thousands of{" "}
            <span className="bg-linear-to-r from-brand-primary via-brand-secondary to-brand-primary bg-clip-text text-transparent bg-300% animate-gradient">
              Bihar Students
            </span>
          </h2>
          <p className="text-base sm:text-lg text-text-muted max-w-2xl mx-auto font-medium">
            Hear from undergraduates across various universities who have accelerated their learning and credit compliance with KpInterns.
          </p>
        </ScrollReveal>

        {/* Testimonial Cards Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {reviews.map((review, index) => (
            <ScrollReveal
              key={review._id || index}
              className="h-full"
              direction="up"
              delay={index * 60}
            >
              <div className="group bg-bg-card border border-border-main hover:border-brand-primary/40 rounded-2xl p-6 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col h-full justify-between relative overflow-hidden">
                {/* Accent bar on hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-primary to-brand-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>

                <div>
                  {/* Rating Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-4.5 h-4.5 text-yellow-500 fill-current group-hover:scale-110 transition-transform"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="text-sm text-text-muted leading-relaxed font-semibold mb-6 flex-1">
                    &quot;{review.comment}&quot;
                  </p>
                </div>

                {/* Profile Details */}
                <div className="flex items-center gap-3 pt-4 border-t border-border-main/30">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${review.gradient} text-white font-extrabold flex items-center justify-center text-sm shadow-md`}>
                    {review.initial}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-black text-text-main leading-tight truncate">
                      {review.name}
                    </h4>
                    <p className="text-[11px] font-extrabold text-brand-primary leading-normal mt-0.5 truncate">
                      {review.role}
                    </p>
                    <p className="text-[10px] text-text-muted font-bold leading-normal truncate">
                      {review.university}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}

          {/* Form input Card for Logged in User */}
          {token && userData && (
            <ScrollReveal
              className="h-full"
              direction="up"
              delay={reviews.length * 60}
            >
              <div className="bg-bg-card border-2 border-dashed border-brand-primary/40 hover:border-brand-primary/70 rounded-2xl p-6 shadow-md flex flex-col justify-between h-full relative overflow-hidden transition-all duration-300">
                <form onSubmit={handleSubmit} className="space-y-4 flex flex-col h-full justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 border-b border-border-main pb-2">
                      <span className="text-lg">✍️</span>
                      <h3 className="text-sm font-black text-text-main">
                        Submit Your Testimonial
                      </h3>
                    </div>

                    {/* Star selector */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                        Your Rating
                      </label>
                      <div className="flex gap-1.5 pt-0.5">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleRatingClick(val)}
                            className="cursor-pointer transition-transform hover:scale-125 focus:outline-none"
                          >
                            <svg
                              className={`w-6 h-6 ${
                                val <= rating ? "text-yellow-500 fill-current" : "text-border-main/50 stroke-border-main"
                              }`}
                              viewBox="0 0 24 24"
                              fill={val <= rating ? "currentColor" : "none"}
                              stroke="currentColor"
                              strokeWidth={1.5}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Review text editor */}
                    <div className="flex flex-col gap-1">
                      <label htmlFor="testimonial-comment" className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                        Review Message
                      </label>
                      <textarea
                        id="testimonial-comment"
                        rows={3}
                        value={comment}
                        onChange={(e) => {
                          setFormError("");
                          setComment(e.target.value);
                        }}
                        placeholder="Share your learning experience, credits transfer validation, or mentor guidance details..."
                        className="w-full p-3 bg-bg-main border border-border-main rounded-xl text-xs text-text-main placeholder-text-muted/50 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition-all font-semibold resize-none"
                      />
                    </div>

                    {/* Messages feedback */}
                    {formError && (
                      <p className="text-[10px] font-bold text-red-500 animate-pulse">
                        ⚠️ {formError}
                      </p>
                    )}
                    {formSuccess && (
                      <p className="text-[10px] font-bold text-brand-success">
                        ✓ {formSuccess}
                      </p>
                    )}
                  </div>

                  {/* Submission CTA */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold text-xs rounded-xl shadow hover:shadow-lg transition-all hover:scale-102 active:scale-98 disabled:opacity-50 cursor-pointer text-center"
                  >
                    {submitting ? "Saving feedback..." : "Submit Review"}
                  </button>
                </form>
              </div>
            </ScrollReveal>
          )}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
