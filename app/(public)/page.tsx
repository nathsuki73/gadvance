"use client";

import React from "react";
import Hero from "@/app/(public)/_components/Hero/Hero";
import TheChallengeSection from "./_components/sections/Challenge";
import TheVisionSection from "./_components/sections/Vision";
import WhyItMattersSection from "./_components/sections/Why";
import FinalCTA from "./_components/sections/FinalCTA";
import CurriculumAccess from "./_components/sections/CurriculumnAccess";

export default function Home() {
  return (
    <main className="">
      <Hero />
      <TheChallengeSection />
      <TheVisionSection />
      <WhyItMattersSection />
      {/* <CurriculumAccess /> */}
      <FinalCTA />
    </main>
  );
}
