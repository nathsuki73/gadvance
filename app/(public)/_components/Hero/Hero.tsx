"use client";

import React from "react";
import ProtectedButton from "../../../components/ProtectedButton";
import Image from "next/image";
import image1 from "@/app/(public)/assets/hero_image.png";
import image2 from "@/app/(public)/assets/Subtract.png";

const Hero = () => {
  return (
    <section className="mx-0 flex min-h-full max-w-full items-center justify-center overflow-hidden lg:pt-8
      bg-gradient-to-b from-white via-sky-50 to-sky-100">
      
      <div className="grid w-full grid-cols-1 items-center justify-items-center gap-12 text-center pt-10">
        
        {/* Content */}
        <div className="flex flex-col items-center justify-center space-y-6">
          
          <div className="space-y-4">
            <h1 className="text-4xl font-medium leading-tight tracking-tight text-zinc-900 sm:text-5xl md:text-6xl lg:text-7xl">
  <span className="text-[#00aeef]">Empower.</span> Educate. <br />
  Advance <span className="text-[#00aeef]">Gender Equality.</span>
</h1>

            <p className="mx-4 max-w-5xl text-base text-zinc-600 sm:text-lg">
              Join GADVance and turn learning into real change. Empower yourself with
              knowledge, build awareness, and take action toward a more equal and
              inclusive future.
            </p>
          </div>

          <div className="flex justify-center">
            <ProtectedButton
              onClick={() => {
                window.location.href = "/workspace";
              }}
              className="rounded-md bg-[#00aeef] px-8 py-3 text-base sm:text-lg font-medium text-white transition-colors hover:bg-[#0092c9]"
              redirectUrl="/workspace"
            >
              Get Started
            </ProtectedButton>
          </div>

          <Image
  src={image2}
  width={1200}
  height={1200}
  alt="Hero illustration"
  className="w-full max-w-lg sm:max-w-xl lg:max-w-2xl object-contain transform -translate-y-10 sm:-translate-y-16 lg:-translate-y-24 pointer-events-none"
/>
        </div>
      </div>
    </section>
  );
};

export default Hero;