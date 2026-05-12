import React from "react";
import Header from "@/app/(public)/_components/header/Header";
import Footer from "@/app/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-zinc-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">About Us</h1>
        <p className="text-lg">
          Welcome to our platform! We are dedicated to providing the best
          learning experience for everyone.
        </p>
      </main>

      {/* Footer added here */}
      <Footer />
    </div>
  );
};

export default About;
