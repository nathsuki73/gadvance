"use client";

import React from "react";
import Hero from "@/app/(public)/_components/Hero/Hero";
import TheChallengeSection from "./_components/sections/Challenge";
import TheVisionSection from "./_components/sections/Vision";
import WhyItMattersSection from "./_components/sections/Why";
import FinalCTA from "./_components/sections/FinalCTA";

export default function Home() {
  return (
    <main className="">
      <Hero />
      <TheChallengeSection />
      <TheVisionSection />
      <WhyItMattersSection />
      <FinalCTA />
    </main>
  );
}
