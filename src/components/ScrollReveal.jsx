"use client";

import React, { useEffect, useRef, useState } from "react";

export default function ScrollReveal({
  children,
  className = "",
  direction = "up", // 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade'
  delay = 0,
  duration = 750,
  threshold = 0.1,
  ...props
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target); // Unobserve once animated
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -40px 0px", // Reveal slightly before the component enters fully
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);

  const getTransitionStyle = () => {
    let transform = "translateY(0) translateX(0) scale(1)";

    if (!isVisible) {
      // On mobile view, force slide/scale animations to slide in from the right
      const activeDirection = isMobile && direction !== "fade" ? "left" : direction;
      switch (activeDirection) {
        case "up":
          transform = "translateY(24px) scale(0.99)";
          break;
        case "down":
          transform = "translateY(-24px) scale(0.99)";
          break;
        case "left":
          transform = "translateX(32px)";
          break;
        case "right":
          transform = "translateX(-32px)";
          break;
        case "scale":
          transform = "scale(0.95)";
          break;
        case "fade":
        default:
          transform = "none";
          break;
      }
    }

    return {
      opacity: isVisible ? 1 : 0,
      transform,
      transitionProperty: "opacity, transform",
      transitionDuration: `${duration}ms`,
      transitionDelay: `${delay}ms`,
      transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)", // Smooth easeOutExpo
      willChange: "opacity, transform",
    };
  };

  return (
    <div ref={ref} className={className} style={getTransitionStyle()} {...props}>
      {children}
    </div>
  );
}
