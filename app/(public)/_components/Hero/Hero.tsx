"use client";

import React from "react";
import ProtectedButton from "../../../components/ProtectedButton";
import Slideshow from "../../../components/slideshow/page";

const Hero = () => {
  return (
    <section className="relative mx-auto flex min-h-[85vh] max-w-7xl flex-col justify-center px-8  lg:px-12 overflow-hidden">
      {/* Background Decorative Shapes */}
      <div className="absolute inset-0 -z-10 bg-[#e0f7f4] [clip-path:polygon(0_0,_85%_0,_75%_100%,_0%_100%)] md:block hidden" />
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
            <ProtectedButton
              onClick={() => {
                window.location.href = "/workspace";
              }}
              className="inline-block rounded-md bg-[#00aeef] px-8 py-3 text-lg font-medium text-white transition-colors hover:bg-[#0092c9]"
              redirectUrl="/workspace"
            >
              Get Started
            </ProtectedButton>
          </div>

          {/* Key Statistics Summary */}
          <div className="flex flex-wrap items-center gap-x-12 lg:gap-x-24 pt-4">
            <StatItem
              label="Courses"
              value="500+"
              color="text-[#00aeef]"
              icon={<BookIcon />}
            />
            <StatItem
              label="Learners"
              value="50K+"
              color="text-[#ef8700]"
              icon={<UsersIcon />}
            />
            <StatItem
              label="Success Rate"
              value="95%"
              color="text-[#00ef9f]"
              icon={<CheckIcon />}
            />
          </div>
        </div>

        {/* Right Side: Slideshow */}
        <div className="relative flex items-center justify-center lg:justify-end">
          <Slideshow />
        </div>
      </div>
    </section>
  );
};

// Small Sub-components for cleaner code
const StatItem = ({ label, value, color, icon }: any) => (
  <div className="flex flex-col items-start space-y-2">
    <div className={`${color}`}>{icon}</div>
    <div className="text-3xl font-bold text-zinc-900">{value}</div>
    <div className="text-sm text-zinc-600">{label}</div>
  </div>
);

const BookIcon = () => (
  <svg
    className="h-8 w-8"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
    />
  </svg>
);
const UsersIcon = () => (
  <svg
    className="h-8 w-8"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);
const CheckIcon = () => (
  <svg
    className="h-8 w-8"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
    />
  </svg>
);

export default Hero;
