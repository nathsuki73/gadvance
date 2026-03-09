import Link from "next/link";
import React from "react";

const Header = () => {
  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-zinc-100">
      {/* Clickable Logo Section */}
      <Link
        href="/"
        className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
      >
        <div className="relative h-8 w-8">
          {/* Logo Gradient Circle */}
          <div className="h-full w-full bg-gradient-to-tr from-teal-400 to-orange-400 rounded-full" />
        </div>
        <span className="text-xl font-semibold tracking-tight">Gadvance</span>
      </Link>

      {/* Navigation Links */}
      <nav className="hidden md:flex items-center gap-10">
        <Link
          href="/about"
          className="text-zinc-600 hover:text-black transition-colors"
        >
          About
        </Link>
        <Link
          href="/workspace"
          className="text-zinc-600 hover:text-black transition-colors"
        >
          Courses
        </Link>
        <Link
          href="/community"
          className="text-zinc-600 hover:text-black transition-colors"
        >
          Community
        </Link>
        <Link
          href="/support"
          className="text-zinc-600 hover:text-black transition-colors"
        >
          Support
        </Link>
      </nav>

      {/* Auth Buttons */}
      <div className="flex items-center gap-6">
        <Link
          href="/auth/signin"
          className="text-zinc-600 hover:text-black font-medium transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/auth/signup"
          className="rounded-lg bg-[#00A9D1] px-6 py-2.5 text-white font-medium hover:bg-[#0089a8] transition-all"
        >
          Sign Up
        </Link>
      </div>
    </header>
  );
};

export default Header;
