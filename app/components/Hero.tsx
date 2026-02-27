import React from "react";
import Image from "next/image";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="mx-auto flex min-h-[85vh] max-w-7xl items-center px-8 lg:px-12">
      {/* Background Decorative Shape (The Mint Area) */}
      <div className="absolute inset-0 -z-10 bg-[#e0f7f4] [clip-path:polygon(0_0,_85%_0,_75%_100%,_0%_100%)] md:block hidden" />
      {/* Fallback for mobile: full background or different clip */}
      <div className="absolute inset-0 -z-10 bg-[#e0f7f4] md:hidden" />

      <div className="grid w-full grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Left Content */}
        <div className="flex flex-col justify-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-medium leading-tight tracking-tight text-zinc-900 md:text-6xl lg:text-7xl">
              Empower. Educate. <br />
              Advance Gender Equality.
            </h1>
            <p className="max-w-md text-lg text-zinc-500">
              Join GADVance and turn learning into real change.
            </p>
          </div>

          <div>
            <Link
              href="/get-started"
              className="inline-block rounded-md bg-[#00aeef] px-8 py-3 text-lg font-medium text-white transition-colors hover:bg-[#0092c9]"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Right Side: Geometric Graphic */}
        <div className="relative flex items-center justify-center lg:justify-end">
          {/* Tip: For the geometric art, you can export it as an SVG or PNG from your design tool. 
                I'm using an <img> tag here as a placeholder for that specific asset.
              */}
          <div className="relative h-[400px] w-full max-w-[500px] md:h-[500px]">
            {/* Replace '/hero-shapes.svg' with your actual image path */}
            <Image
              src="/hero-shapes.png"
              alt="Geometric abstract art"
              fill
              priority
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
