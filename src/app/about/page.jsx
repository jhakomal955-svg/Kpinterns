"use client";

import Image from "next/image";
import React, { useState, useRef } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import { useRouter } from "next/navigation";

export default function AboutPage() {
  const router = useRouter();

  const achievements = [
    {
      icon: "🎓",
      title: "50,000+ Students Guided",
      description:
        "We have successfully trained and verified over 50,000 undergraduates, assisting them in transferring academic credits smoothly.",
    },
    {
      icon: "📜",
      title: "UGC & NEP-2020 Aligned",
      description:
        "Our curriculum complies with CCFUP Choice Based Credit System (CBCS) rules, recognized by college heads for credit validation.",
    },
    {
      icon: "🔍",
      title: "Verifiable Digital Portals",
      description:
        "Every certificate is issued with a unique verification code and secure QR seal to ensure zero credential forgery.",
    },
    {
      icon: "🤝",
      title: "University Recognitions",
      description:
        "We are trusted across major state universities in Bihar and other regions, adapting to local academic calendars.",
    },
  ];

  const goals = [
    {
      icon: "💡",
      title: "Bridge Theory & Practice",
      description:
        "We complement university learning with project-based, hands-on exposure to make students industry-ready.",
    },
    {
      icon: "🪙",
      title: "Democratize Education",
      description:
        "We offer premium mentor-guided programs at highly affordable fees (₹400-₹500), ensuring equal opportunities.",
    },
    {
      icon: "📝",
      title: "Enable Credit Compliance",
      description:
        "We simplify college submissions by offering authorized onboarding letters, attendance sheets, and verified grades.",
    },
    {
      icon: "🚀",
      title: "Strengthen Employability",
      description:
        "We help students build real-world portfolios, project profiles, and core skills to stand out in hiring drives.",
    },
  ];

  const [activeAchievement, setActiveAchievement] = useState(0);
  const [activeGoal, setActiveGoal] = useState(0);
  const [activeValue, setActiveValue] = useState(0);
  const [activeStat, setActiveStat] = useState(0);

  const achievementRef = useRef(null);
  const goalRef = useRef(null);
  const valueRef = useRef(null);
  const statRef = useRef(null);

  const handleScroll = (ref, setter, totalCount) => {
    if (!ref.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = ref.current;
    if (scrollWidth === clientWidth) return;
    const newIndex = Math.min(
      Math.max(Math.round((scrollLeft / (scrollWidth - clientWidth)) * (totalCount - 1)), 0),
      totalCount - 1
    );
    setter(newIndex);
  };

  return (
    <div className="min-h-screen bg-bg-main">
      {/* Hero Section */}
  

      {/* Main Content */}
      <div className=" mx-auto px-4 sm:px-8 lg:px-[60px]">
        {/* About Section */}
        <section className="py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-extrabold text-text-main mb-6">
                About <span className="text-bg-main bg-text-main rounded-full p-2"> Kp</span><span className="text-brand-primary">Interns</span>
              </h2>
              <p className="text-lg text-text-muted leading-relaxed mb-4">
                Welcome to Kp Interns, India's leading compliance and up-skilling platform designed for undergraduate and diploma students. We focus on bridging the gap between university syllabus requirements and real-world industrial skills, enabling students across state universities to seamlessly complete mandatory credit-bearing internships.
              </p>
              <p className="text-lg text-text-muted leading-relaxed mb-4">
                Our mission is to democratize professional training. We provide structured online programs aligned with the NEP-2020 Choice Based Credit System (CBCS) / CCFUP guidelines, offering a 120-hour academic coursework structure that fits perfectly with your college calendar.
              </p>
              <p className="text-lg text-text-muted leading-relaxed">
                Whether you are pursuing a Technical degree (B.Tech, Diploma, BCA, BSc) or a Non-Technical stream (BA, BCom, BBA), our project-based curriculum, interactive live sessions on Google Meet, and dedicated WhatsApp mentoring will guide you to academic excellence and placement readiness.
              </p>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl p-1 shadow-2xl">
                <div style={{ position: 'relative' }} className="relative p-12 animate-bounce flex items-center justify-center min-h-96">
                   <Image
                                  src="/banner.png"
                                  alt="Transform Your Skills and Career"
                                  fill
                                  priority
                                  sizes="(max-width: 768px) 100vw, 50vw"
                                  className="object-contain object-center group-hover:scale-110 transition-transform duration-700"
                                />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Achievements Section */}
        <section className="py-20 border-t border-border-main">
          <div className="mb-16">
            <h2 className="text-4xl font-extrabold text-text-main mb-4">
              Achievements
            </h2>
            <p className="text-lg text-text-muted max-w-3xl">
              Our commitment to excellence has resulted in achievements that
              reflect our journey. Here are some of our notable accomplishments.
            </p>
          </div>

          <div
            ref={achievementRef}
            onScroll={() => handleScroll(achievementRef, setActiveAchievement, achievements.length)}
            className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 md:grid md:grid-cols-2 md:gap-8 md:pb-0 scrollbar-hide"
          >
            {achievements.map((achievement, index) => (
              <ScrollReveal
                key={index}
                className="flex-shrink-0 w-[285px] sm:w-[320px] md:w-auto md:flex-shrink snap-center h-full"
                direction="up"
                delay={index * 80}
              >
                <div
                  className="bg-bg-card border border-border-main rounded-2xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full"
                >
                  <div className="text-5xl mb-4">{achievement.icon}</div>
                  <h3 className="text-xl font-bold text-text-main mb-3">
                    {achievement.title}
                  </h3>
                  <p className="text-text-muted leading-relaxed">
                    {achievement.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-1.5 mt-2 md:hidden">
            {achievements.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeAchievement === idx ? "bg-brand-primary w-5" : "bg-border-main w-2"
                }`}
              />
            ))}
          </div>
        </section>

        {/* Goals Section */}
        <section className="py-20 border-t border-border-main">
          <div className="mb-16">
            <h2 className="text-4xl font-extrabold text-text-main mb-4">
              Our Goals
            </h2>
            <p className="text-lg text-text-muted max-w-3xl">
              We are committed to delivering educational excellence and shaping
              the future of design and development. We believe that education
              should be accessible and transformative. Through our carefully
              crafted courses and mentorship, we aim to help you reach your full
              potential.
            </p>
          </div>

          <div
            ref={goalRef}
            onScroll={() => handleScroll(goalRef, setActiveGoal, goals.length)}
            className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 md:grid md:grid-cols-2 md:gap-8 md:pb-0 scrollbar-hide"
          >
            {goals.map((goal, index) => (
              <ScrollReveal
                key={index}
                className="flex-shrink-0 w-[285px] sm:w-[320px] md:w-auto md:flex-shrink snap-center h-full"
                direction="up"
                delay={index * 80}
              >
                <div
                  className="bg-bg-card border border-border-main rounded-2xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full"
                >
                  <div className="text-5xl mb-4">{goal.icon}</div>
                  <h3 className="text-xl font-bold text-text-main mb-3">
                    {goal.title}
                  </h3>
                  <p className="text-text-muted leading-relaxed">
                    {goal.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 border-t border-border-main">
          <h2 className="text-4xl font-extrabold text-text-main mb-12 text-center">
            Our Core Values
          </h2>
          <div
            ref={valueRef}
            onScroll={() => handleScroll(valueRef, setActiveValue, 3)}
            className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 md:grid md:grid-cols-3 md:gap-8 md:pb-0 scrollbar-hide"
          >
            <ScrollReveal direction="up" delay={50} className="flex-shrink-0 w-[285px] sm:w-[320px] md:w-auto md:flex-shrink snap-center h-full">
              <div className="bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 border border-brand-primary/20 rounded-2xl p-8 h-full">
                <div className="text-4xl mb-4">🎓</div>
                <h3 className="text-xl font-bold text-text-main mb-3">
                  Excellence in Education
                </h3>
                <p className="text-text-muted">
                  We maintain the highest standards in curriculum design,
                  instruction quality, and student outcomes through continuous
                  improvement and innovation.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={150} className="flex-shrink-0 w-[285px] sm:w-[320px] md:w-auto md:flex-shrink snap-center h-full">
              <div className="bg-gradient-to-br from-brand-secondary/10 to-brand-secondary/5 border border-brand-secondary/20 rounded-2xl p-8 h-full">
                <div className="text-4xl mb-4">🤲</div>
                <h3 className="text-xl font-bold text-text-main mb-3">
                  Accessibility & Inclusivity
                </h3>
                <p className="text-text-muted">
                  We believe learning should be accessible to everyone, regardless
                  of their background, location, or financial situation.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={250} className="flex-shrink-0 w-[285px] sm:w-[320px] md:w-auto md:flex-shrink snap-center h-full">
              <div className="bg-gradient-to-br from-brand-success/10 to-brand-success/5 border border-brand-success/20 rounded-2xl p-8 h-full">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-xl font-bold text-text-main mb-3">
                  Innovation & Growth
                </h3>
                <p className="text-text-muted">
                  We continuously evolve and adapt to industry changes, ensuring
                  our students are always equipped with the most current and
                  relevant skills.
                </p>
              </div>
            </ScrollReveal>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-1.5 mt-2 md:hidden">
            {[...Array(3)].map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeValue === idx ? "bg-brand-primary w-5" : "bg-border-main w-2"
                }`}
              />
            ))}
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-20 border-t border-border-main">
          <div
            ref={statRef}
            onScroll={() => handleScroll(statRef, setActiveStat, 4)}
            className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 md:grid md:grid-cols-4 md:gap-8 md:pb-0 scrollbar-hide"
          >
            <ScrollReveal direction="scale" delay={50} className="flex-shrink-0 w-[200px] sm:w-[240px] md:w-auto md:flex-shrink snap-center h-full">
              <div className="bg-bg-card border border-border-main rounded-2xl p-8 text-center h-full">
                <div className="text-5xl font-bold text-brand-primary mb-2">
                  50K+
                </div>
                <p className="text-text-muted font-semibold">Students Trained</p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="scale" delay={120} className="flex-shrink-0 w-[200px] sm:w-[240px] md:w-auto md:flex-shrink snap-center h-full">
              <div className="bg-bg-card border border-border-main rounded-2xl p-8 text-center h-full">
                <div className="text-5xl font-bold text-brand-primary mb-2">
                  200+
                </div>
                <p className="text-text-muted font-semibold">Courses Available</p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="scale" delay={190} className="flex-shrink-0 w-[200px] sm:w-[240px] md:w-auto md:flex-shrink snap-center h-full">
              <div className="bg-bg-card border border-border-main rounded-2xl p-8 text-center h-full">
                <div className="text-5xl font-bold text-brand-primary mb-2">
                  95%
                </div>
                <p className="text-text-muted font-semibold">
                  Student Satisfaction
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="scale" delay={260} className="flex-shrink-0 w-[200px] sm:w-[240px] md:w-auto md:flex-shrink snap-center h-full">
              <div className="bg-bg-card border border-border-main rounded-2xl p-8 text-center h-full">
                <div className="text-5xl font-bold text-brand-primary mb-2">
                  100+
                </div>
                <p className="text-text-muted font-semibold">Industry Partners</p>
              </div>
            </ScrollReveal>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-1.5 mt-2 md:hidden">
            {[...Array(4)].map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeStat === idx ? "bg-brand-primary w-5" : "bg-border-main w-2"
                }`}
              />
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 border-t border-border-main">
          <h2 className="text-4xl font-extrabold text-text-main mb-12 text-center">
            Why Choose Kp Interns?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <ScrollReveal direction="up" delay={50}>
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-brand-primary/20">
                    <svg
                      className="h-6 w-6 text-brand-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-main mb-2">
                    Expert Domain Mentors
                  </h3>
                  <p className="text-text-muted">
                    Learn from industry professionals with years of hands-on experience who guide you step-by-step through WhatsApp groups and live sessions.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={100}>
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-brand-secondary/20">
                    <svg
                      className="h-6 w-6 text-brand-secondary"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-main mb-2">
                    Academic-Aligned Projects
                  </h3>
                  <p className="text-text-muted">
                    Work on practical, domain-specific capstone projects that fulfill your mandatory university credit requirements.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={150}>
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-brand-success/20">
                    <svg
                      className="h-6 w-6 text-brand-success"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-main mb-2">
                    Credit Validation Support
                  </h3>
                  <p className="text-text-muted">
                    We provide authorized onboarding letters, evaluations, and verifiable grade-card sheets needed for college submissions.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={200}>
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-brand-primary/20">
                    <svg
                      className="h-6 w-6 text-brand-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-main mb-2">
                    Flexible Virtual Schedule
                  </h3>
                  <p className="text-text-muted">
                    Complete your coursework and projects online. Attend live Meet calls from your mobile phone without affecting your exam schedules.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 border-t border-border-main">
          <ScrollReveal direction="scale">
            <div className="bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 rounded-3xl p-12 text-center">
              <h2 className="text-4xl md:text-5xl font-extrabold text-text-main mb-6">
                <span className="text-brand-primary">Together,</span> let's shape
                the future of
                <br />
                <span className="text-brand-secondary">digital innovation</span>
              </h2>
              <p className="text-xl text-text-muted max-w-2xl mx-auto mb-8">
                Join us on this exciting learning journey and unlock your
                potential in the world of design and development.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => router.push('/internship')} className="bg-brand-primary text-white font-semibold px-8 py-3 rounded-lg hover:bg-brand-primary/90 transition-all shadow-md">
                  Start internships today
                </button>
                <button onClick={() => router.push('/courses')} className="border-2 border-brand-primary text-brand-primary font-semibold px-8 py-3 rounded-lg hover:bg-brand-primary/5 transition-all">
                  Learn course
                </button>
              </div>
            </div>
          </ScrollReveal>
        </section>
      </div>
    </div>
  );
}
