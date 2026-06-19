"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ScrollReveal from "./ScrollReveal.jsx";

const FeaturedSpotlight = () => {
  const [activeTab, setActiveTab] = useState("internships");
  const [courses, setCourses] = useState([]);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef(null);

  // Reset activeIndex when tab changes
  useEffect(() => {
    setActiveIndex(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, [activeTab]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    if (scrollWidth === clientWidth) return;
    const itemsCount = activeTab === "internships" ? activeInternships.length : activeCourses.length;
    const newIndex = Math.min(
      Math.max(Math.round((scrollLeft / (scrollWidth - clientWidth)) * (itemsCount - 1)), 0),
      itemsCount - 1
    );
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  // Read logged-in student data to display personalized enrollment states
  useEffect(() => {
    const userJson = localStorage.getItem("userData");
    if (userJson) {
      try {
        setUserData(JSON.parse(userJson));
      } catch (e) {
        console.error("Error parsing user data in spotlight:", e);
      }
    }
  }, []);

  // Fallback courses structured exactly like the Course Mongoose model
  const fallbackCourses = [
    {
      _id: "fb-c-1",
      title: "Full-Stack Web Development Masterclass",
      shortDescription: "Master React, Next.js, Node.js, and MongoDB. Design and deploy production-ready web apps from scratch with hands-on labs.",
      department: "Technical",
      difficultyLevel: "Intermediate",
      isFree: false,
      price: 499,
      duration: "6 Weeks",
      thumbnail: "",
    },
    {
      _id: "fb-c-2",
      title: "Python for AI & Data Science",
      shortDescription: "Learn Python fundamentals, data structures, and dive deep into data analysis with Pandas, NumPy, and basic machine learning algorithms.",
      department: "Technical",
      difficultyLevel: "Beginner",
      isFree: false,
      price: 399,
      duration: "4 Weeks",
      thumbnail: "",
    },
    {
      _id: "fb-c-3",
      title: "BCom Financial Analyst & Excel Program",
      shortDescription: "Advance your commerce skills. Learn financial modeling, standard accounting guidelines, tax structures, and business dashboard analysis in Excel.",
      department: "NonTechnical",
      difficultyLevel: "Advanced",
      isFree: false,
      price: 399,
      duration: "4 Weeks",
      thumbnail: "",
    },
  ];

  // Fallback internships structured exactly like the Internship Mongoose model
  const fallbackInternships = [
    {
      _id: "fb-i-1",
      title: "Software Engineering & Web Design Internship",
      shortDescription: "Build interactive components, handle API routing, and learn design practices under NEP choice-based credit guidance.",
      company: "Kp Technology Solutions",
      domain: "Full Stack Development",
      degree: "BTech",
      department: "Computer Science & Engineering",
      internshipType: "Project-Based",
      mode: "Online",
      RegistrationFee: { amount: 499 },
      stipend: { amount: 0 },
      thumbnail: "",
    },
    {
      _id: "fb-i-2",
      title: "BA Digital Marketing & Content Strategy",
      shortDescription: "Learn SEO optimization, modern content calendars, brand guidelines, and run real-world social campaigns during this flexible program.",
      company: "Kp Media Network",
      domain: "Digital Marketing",
      degree: "BA",
      department: "Arts & Media",
      internshipType: "Part-Time",
      mode: "Online",
      RegistrationFee: { amount: 399 },
      stipend: { amount: 0 },
      thumbnail: "",
    },
    {
      _id: "fb-i-3",
      title: "Embedded Systems & IoT Projects",
      shortDescription: "Design microcontroller layouts, program sensors, and build IoT automation modules with expert industry engineers.",
      company: "Kp Hardware Labs",
      domain: "Embedded Systems & IoT",
      degree: "Diploma",
      department: "Electronics & Communication",
      internshipType: "Full-Time",
      mode: "Online",
      RegistrationFee: { amount: 499 },
      stipend: { amount: 0 },
      thumbnail: "",
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch real courses
        const courseRes = await fetch("/api/course");
        if (courseRes.ok) {
          const courseData = await courseRes.json();
          if (courseData.success && courseData.data && courseData.data.length > 0) {
            // Filter only Published courses and take top 3
            setCourses(courseData.data.filter(c => c.status === "Published").slice(0, 3));
          }
        }

        // Fetch real internships
        const internRes = await fetch("/api/internship");
        if (internRes.ok) {
          const internData = await internRes.json();
          if (internData.success && internData.data && internData.data.length > 0) {
            // Filter only active/published internships and take top 3
            setInternships(internData.data.filter(i => i.status === "Active" || i.status === "Published").slice(0, 3));
          }
        }
      } catch (err) {
        console.error("Error fetching homepage spotlight data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const activeCourses = courses.length > 0 ? courses : fallbackCourses;
  const activeInternships = internships.length > 0 ? internships : fallbackInternships;

  return (
    <section className="relative px-4 sm:px-8 lg:px-[60px] py-8 bg-bg-main overflow-hidden border-t border-border-main/30">
      {/* Background Ornamentations */}
      <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] bg-gradient-to-tr from-brand-primary/10 to-transparent rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] bg-gradient-to-br from-brand-secondary/10 to-transparent rounded-full blur-3xl -z-10 animate-pulse"></div>

      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <ScrollReveal className="text-center mb-10" direction="fade">
          <p className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-brand-primary mb-3">
            Spotlight Programs
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-text-main leading-tight mb-4">
            Explore Our{" "}
            <span className="bg-linear-to-r from-brand-primary via-brand-secondary to-brand-primary bg-clip-text text-transparent bg-300% animate-gradient">
              Trending Paths
            </span>
          </h2>
          <p className="text-base sm:text-lg text-text-muted max-w-2xl mx-auto font-medium">
            Jumpstart your compliance credit tracking or learn high-income skills directly from industry professionals.
          </p>

          {/* Toggle Tabs Selector */}
          <div className="inline-flex bg-bg-card border border-border-main p-1.5 rounded-2xl shadow-md mt-8">
            <button
              onClick={() => setActiveTab("internships")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${
                activeTab === "internships"
                  ? "bg-brand-primary text-white shadow-lg"
                  : "text-text-muted hover:text-text-main"
              }`}
            >
              <span>💼</span> Internships
            </button>
            <button
              onClick={() => setActiveTab("courses")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${
                activeTab === "courses"
                  ? "bg-brand-primary text-white shadow-lg"
                  : "text-text-muted hover:text-text-main"
              }`}
            >
              <span>🎓</span> Courses
            </button>
          </div>
        </ScrollReveal>

        {/* Display Grid of Cards */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex items-stretch overflow-x-auto snap-x snap-mandatory gap-6 pb-6 mt-12 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 md:pb-0 scrollbar-hide"
        >
          {activeTab === "internships"
            ? activeInternships.map((internship, index) => {
                const isEnrolled = userData?.ActiveInternship?.some(
                  (i) => (i.internship?._id || i.internship) === internship._id
                );

                return (
                  <ScrollReveal
                    key={internship._id}
                    className="flex flex-col flex-shrink-0 w-[290px] sm:w-[330px] md:w-auto md:flex-shrink snap-center"
                    direction="up"
                    delay={index * 80}
                  >
                    <div className="group bg-bg-card border-2 border-border-main rounded-2xl overflow-hidden hover:border-brand-primary hover:shadow-xl transition-all duration-300 flex flex-col flex-1">
                      {/* Visual Header / Thumbnail (Matches Internship Page Card layout) */}
                      <div className="relative h-48 bg-gradient-to-br from-brand-secondary/20 via-brand-primary/20 to-brand-secondary/10 flex items-center justify-center overflow-hidden border-b border-border-main">
                        {internship.thumbnail ? (
                          <img
                            src={internship.thumbnail}
                            alt={internship.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350"
                            loading="lazy"
                          />
                        ) : (
                          <>
                            <div className="absolute inset-0 bg-brand-secondary/10 group-hover:scale-105 transition-transform duration-350"></div>
                            <span className="text-5xl group-hover:-rotate-6 transition-transform duration-350 select-none">💼</span>
                          </>
                        )}

                        {/* Badges Overlay */}
                        <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
                          <span className="bg-bg-card/90 text-text-main text-[11px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full shadow border border-border-main">
                            {Array.isArray(internship.degree) ? internship.degree.join(", ") : internship.degree}
                          </span>
                          <span className="bg-brand-primary text-white text-[11px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full shadow">
                            {internship.mode || "Online"}
                          </span>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-bold text-brand-secondary uppercase tracking-wider">
                            {internship.domain}
                          </span>
                          <span className="bg-brand-success/15 text-brand-success text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-brand-success/20">
                            {internship.internshipType}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-text-main group-hover:text-brand-secondary transition-colors line-clamp-1 mb-1">
                          {internship.title}
                        </h3>

                        <span className="text-sm font-semibold text-text-muted mb-1 block">
                          🏢 {internship.company || "KpInterns"}
                        </span>

                        <span className="text-xs font-semibold text-text-muted mb-4 block line-clamp-1" title={Array.isArray(internship.department) ? internship.department.join(", ") : internship.department}>
                          📚 {Array.isArray(internship.department) ? internship.department.join(", ") : internship.department}
                        </span>

                        <p className="text-text-muted text-sm line-clamp-3 mb-6 flex-1 font-semibold leading-relaxed">
                          {internship.shortDescription || internship.description}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-border-main mt-auto">
                          {/* Fee and Stipend */}
                          <div className="flex flex-col">
                            <span className="text-xs text-text-muted uppercase font-bold tracking-wider">Registration Fee</span>
                            <span className="text-lg font-black text-text-main">
                              {internship.RegistrationFee?.amount ? `₹${internship.RegistrationFee.amount}` : "Free"}
                            </span>
                          </div>

                          <div className="flex flex-col text-right">
                            <span className="text-xs text-text-muted uppercase font-bold tracking-wider">Stipend</span>
                            <span className="text-sm font-semibold text-brand-success">
                              {internship.stipend?.amount ? `₹${internship.stipend.amount}/mo` : "Unpaid"}
                            </span>
                          </div>
                        </div>

                        <Link
                          href={`/internship/${internship._id}`}
                          className={`w-full mt-6 font-bold py-3 px-4 rounded-xl text-center shadow transition-all block ${
                            isEnrolled
                              ? "bg-brand-success hover:bg-brand-success/95 text-white"
                              : "bg-brand-primary hover:bg-brand-primary/95 text-white"
                          }`}
                        >
                          {isEnrolled ? "Start Learning" : "View Details"}
                        </Link>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })
            : activeCourses.map((course, index) => {
                const isEnrolled = userData?.ActiveCources?.some(
                  (c) => (c.course?._id || c.course) === course._id
                );

                return (
                  <ScrollReveal
                    key={course._id}
                    className="flex flex-col flex-shrink-0 w-[290px] sm:w-[330px] md:w-auto md:flex-shrink snap-center"
                    direction="up"
                    delay={index * 80}
                  >
                    <div className="group bg-bg-card border-2 border-border-main rounded-2xl overflow-hidden hover:border-brand-primary hover:shadow-xl transition-all duration-300 flex flex-col flex-1">
                      {/* Visual Header / Thumbnail (Matches Courses Page Card layout) */}
                      <div className="relative h-48 bg-gradient-to-br from-brand-primary/20 via-brand-secondary/20 to-brand-primary/10 flex items-center justify-center overflow-hidden border-b border-border-main">
                        {course.thumbnail ? (
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350"
                            loading="lazy"
                          />
                        ) : (
                          <>
                            <div className="absolute inset-0 bg-brand-primary/10 group-hover:scale-105 transition-transform duration-350"></div>
                            <span className="text-5xl group-hover:rotate-6 transition-transform duration-350 select-none">🎓</span>
                          </>
                        )}

                        {/* Badges Overlay */}
                        <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
                          <span className="bg-bg-card/90 text-text-main text-[11px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full shadow border border-border-main">
                            {course.department}
                          </span>
                          <span className={`text-white text-[11px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full shadow ${
                            course.difficultyLevel === "Beginner" ? "bg-brand-success" :
                            course.difficultyLevel === "Intermediate" ? "bg-brand-primary" : "bg-orange-500"
                          }`}>
                            {course.difficultyLevel}
                          </span>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-6 flex flex-col flex-1">
                        <h3 className="text-xl font-bold text-text-main group-hover:text-brand-primary transition-colors line-clamp-1 mb-2">
                          {course.title}
                        </h3>

                        <p className="text-text-muted text-sm line-clamp-3 mb-6 flex-1 font-semibold leading-relaxed">
                          {course.shortDescription || course.description}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-border-main mt-auto">
                          {/* Price & Duration */}
                          <div className="flex flex-col">
                            <span className="text-xs text-text-muted uppercase font-bold tracking-wider">Price</span>
                            <span className="text-lg font-black text-text-main">
                              {course.isFree ? "Free" : `₹${course.price}`}
                            </span>
                          </div>

                          <div className="flex flex-col text-right">
                            <span className="text-xs text-text-muted uppercase font-bold tracking-wider">Duration</span>
                            <span className="text-sm font-semibold text-text-main capitalize">
                              {course.duration ? course.duration.replace("-", " ") : "1 month"}
                            </span>
                          </div>
                        </div>

                        <Link
                          href={`/courses/${course._id}`}
                          className={`w-full mt-6 font-bold py-3 px-4 rounded-xl text-center shadow transition-all block ${
                            isEnrolled
                              ? "bg-brand-success hover:bg-brand-success/95 text-white"
                              : "bg-brand-primary hover:bg-brand-primary/95 text-white"
                          }`}
                        >
                          {isEnrolled ? "Start Learning" : "View Details"}
                        </Link>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-1.5 mt-2 md:hidden mb-6">
          {(activeTab === "internships" ? activeInternships : activeCourses).map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeIndex === idx ? "bg-brand-primary w-5" : "bg-border-main w-2"
              }`}
            />
          ))}
        </div>

        {/* View All CTA Links */}
        <div className="text-center mt-4 animate-fade-in">
          <Link
            href={activeTab === "internships" ? "/internship" : "/courses"}
            className="group inline-flex items-center gap-2 text-sm font-extrabold text-brand-primary hover:text-brand-secondary transition-all"
          >
            Explore all {activeTab === "internships" ? "internships" : "courses"}
            <svg
              className="w-4 h-4 group-hover:translate-x-1.5 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSpotlight;
