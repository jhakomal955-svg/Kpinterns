import React from "react";
import Hero from "@/components/Hero";
import Question from "@/components/Question";
import How from "@/components/How";
import Why from "@/components/Why";
import BranchesStreams from "@/components/BranchesStreams";
import TrustMarquee from "@/components/TrustMarquee";
import FeaturedSpotlight from "@/components/FeaturedSpotlight";
import DashboardPreview from "@/components/DashboardPreview";
import Testimonials from "@/components/Testimonials";

const page = () => {
  return (
    <>
      <Hero />
      <TrustMarquee />
      <Why />
      <BranchesStreams />
      <FeaturedSpotlight />
      <How />
      <DashboardPreview />
      <Testimonials />
      <Question />
    </>
  );
};

export default page;
