"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/(public)/_components/header/Header";
import Hero from "@/app/(public)/_components/Hero/Hero";
import Footer from "@/app/components/Footer";

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
      </main>
  );
}
