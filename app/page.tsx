import Image from "next/image";
import Link from "next/link";
import Header from "@/app/components/Header";
import Hero from "@/app/components/Hero";

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">
      {/* Header Navigation */}
      <Header />

      <main className="relative pt-20">
        {/* Hero Section Container */}
        <Hero />
      </main>
    </div>
  );
}
