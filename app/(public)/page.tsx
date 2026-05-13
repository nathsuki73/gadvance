"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/(public)/_components/header/Header";
import Hero from "@/app/(public)/_components/Hero/Hero";
import Programs from "./_components/sections/Programs";
import TheChallengeSection from "./_components/sections/Challenge";
import TheVisionSection from "./_components/sections/Vision";
import WhyItMattersSection from "./_components/sections/Why";
import CurriculumAccess from "./_components/sections/CurriculumnAccess";
import FinalCTA from "./_components/sections/FinalCTA";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      router.push("/workspace");
    }
  }, [status, session, router]);

  if (status === "authenticated") {
    return null;
  }

  return (
      <main className="">
        <Hero />
        {/* <Programs /> */}
        <TheChallengeSection />
        <TheVisionSection />
        <WhyItMattersSection />
        <CurriculumAccess />
        <FinalCTA />
      </main>
  );
}
