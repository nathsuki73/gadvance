import React from "react";
import Image from "next/image";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="mx-auto flex min-h-[85vh] max-w-7xl flex-col justify-between px-8 py-12 lg:px-12">
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

          {/* Statistics Section */}
          <div className="flex flex-wrap items-center gap-x-36 pt-4">
            {/* 500+ Courses */}
            <div className="flex flex-col items-start space-y-2">
              <div className="flex items-center justify-start">
                <svg
                  className="h-8 w-8 text-[#00aeef]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div className="text-3xl font-bold text-zinc-900">500+</div>
              <div className="text-sm text-zinc-600">Courses</div>
            </div>

            {/* 50K+ Learners */}
            <div className="flex flex-col items-start space-y-2">
              <div className="flex items-center justify-start">
                <svg
                  className="h-8 w-8 text-[#ef8700]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div className="text-3xl font-bold text-zinc-900">50K+</div>
              <div className="text-sm text-zinc-600">Learners</div>
            </div>

            {/* 95% Success Rate */}
            <div className="flex flex-col items-start space-y-2">
              <div className="flex items-center justify-start">
                <svg
                  className="h-8 w-8 text-[#00ef9f]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <div className="text-3xl font-bold text-zinc-900">95%</div>
              <div className="text-sm text-zinc-600">Success Rate</div>
            </div>
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

      {/* Educational Programs Section - Bottom Center */}
      <div className="mt-50 flex w-full flex-col items-center space-y-4 text-center">
        {/* Icon */}
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-50">
          <svg
            className="h-7 w-7 text-orange-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-4xl font-bold text-zinc-900">
          Educational Programs
        </h2>

        {/* Description */}
        <p className="max-w-2xl text-base text-zinc-600">
          Comprehensive courses designed to empower and educate on gender
          equality, professional development, and personal growth.
        </p>
      </div>

      {/* Courses Grid Section */}
      <div className="mt-20 w-full">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Course Card 1 - Gender Equality Fundamentals */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 21a9 9 0 100-18 9 9 0 000 18zm0 0a8.956 8.956 0 01-6.364-2.636m12.728 0A8.956 8.956 0 0021 12a9 9 0 11-9 9 9.009 9.009 0 001.636-.636m0-15.464A8.956 8.956 0 0112 3a9 9 0 109 9 9.009 9.009 0 00-1.636-.636"
                  />                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v18M3 12h18"
                  />                </svg>
              </div>
              <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-800">
                Foundational
              </span>
            </div>
            <h3 className="mb-3 text-xl font-bold text-zinc-900">
              Gender Equality Fundamentals
            </h3>
            <p className="mb-4 text-sm text-zinc-600">
              Understanding the principles and importance of gender equality in
              modern society.
            </p>
            <div className="mb-4 flex gap-4 text-sm text-zinc-600">
              <div className="flex items-center gap-1">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                4 weeks
              </div>
              <div className="flex items-center gap-1">
                <svg
                  className="h-4 w-4"
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
                12,500 enrolled
              </div>
            </div>
            <div className="mb-4">
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-semibold text-zinc-900">Your Progress</span>
                <span className="font-semibold text-teal-600">65%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-teal-500"
                  style={{ width: "65%" }}
                />
              </div>
            </div>
            <Link
              href="/course"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-lg bg-teal-600 px-4 py-2 text-center font-semibold text-white transition hover:bg-teal-700"
            >
              Continue Learning →
            </Link>
          </div>

          {/* Course Card 2 - Women in Leadership */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500">
                <svg
                  className="h-6 w-6 text-white"
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
              </div>
              <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-800">
                Professional
              </span>
            </div>
            <h3 className="mb-3 text-xl font-bold text-zinc-900">
              Women in Leadership
            </h3>
            <p className="mb-4 text-sm text-zinc-600">
              Developing leadership skills and breaking barriers in professional
              environments.
            </p>
            <div className="mb-4 flex gap-4 text-sm text-zinc-600">
              <div className="flex items-center gap-1">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                6 weeks
              </div>
              <div className="flex items-center gap-1">
                <svg
                  className="h-4 w-4"
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
                8,900 enrolled
              </div>
            </div>
            <div className="mb-4">
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-semibold text-zinc-900">Your Progress</span>
                <span className="font-semibold text-teal-600">45%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-orange-500"
                  style={{ width: "45%" }}
                />
              </div>
            </div>
            <button className="w-full rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white transition hover:bg-teal-700">
              Continue Learning →
            </button>
          </div>

          {/* Course Card 3 - Workplace Rights & Advocacy */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-800">
                Legal
              </span>
            </div>
            <h3 className="mb-3 text-xl font-bold text-zinc-900">
              Workplace Rights & Advocacy
            </h3>
            <p className="mb-4 text-sm text-zinc-600">
              Learn about workplace rights, discrimination prevention, and
              advocacy strategies.
            </p>
            <div className="mb-4 flex gap-4 text-sm text-zinc-600">
              <div className="flex items-center gap-1">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                5 weeks
              </div>
              <div className="flex items-center gap-1">
                <svg
                  className="h-4 w-4"
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
                10,200 enrolled
              </div>
            </div>
            <div className="mb-4">
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-semibold text-zinc-900">Your Progress</span>
                <span className="font-semibold text-teal-600">80%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-teal-500"
                  style={{ width: "80%" }}
                />
              </div>
            </div>
            <button className="w-full rounded-lg bg-teal-600 px-4 py-2 font-semibold text-white transition hover:bg-teal-700">
              Continue Learning →
            </button>
          </div>

          {/* Course Card 4 - Mental Health & Wellness */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pink-500">
                <svg
                  className="h-6 w-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-800">
                Wellness
              </span>
            </div>
            <h3 className="mb-3 text-xl font-bold text-zinc-900">
              Mental Health & Wellness
            </h3>
            <p className="mb-4 text-sm text-zinc-600">
              Supporting mental well-being and building resilience in
              challenging environments.
            </p>
            <div className="mb-4 flex gap-4 text-sm text-zinc-600">
              <div className="flex items-center gap-1">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                3 weeks
              </div>
              <div className="flex items-center gap-1">
                <svg
                  className="h-4 w-4"
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
                15,800 enrolled
              </div>
            </div>
            <div className="mb-4">
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-semibold text-zinc-900">Your Progress</span>
                <span className="font-semibold text-teal-600">30%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-pink-500"
                  style={{ width: "30%" }}
                />
              </div>
            </div>
            <button className="w-full rounded-lg bg-pink-500 px-4 py-2 font-semibold text-white transition hover:bg-pink-600">
              Continue Learning →
            </button>
          </div>
        </div>

        {/* View All Courses Button */}
        <div className="mt-12 flex justify-center">
          <button className="rounded-lg border-2 border-gray-300 px-8 py-3 font-semibold text-gray-500 transition hover:text-orange-400 hover:border-orange-400">
            View All Courses
          </button>
        </div>

        {/* Impact Dashboard Section */}
        <div className="mt-50 flex flex-col items-center space-y-4 text-center">
          {/* Icon */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
            <svg
              className="h-8 w-8 text-teal-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-4xl font-bold text-zinc-900">
            Impact Dashboard
          </h2>

          {/* Description */}
          <p className="max-w-2xl text-base text-zinc-600">
            Track progress, measure impact, and visualize gender participation
            metrics across our platform.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
