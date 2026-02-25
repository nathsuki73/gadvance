import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">
      {/* Header Navigation */}
      <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-zinc-100">
        {/* Logo Section */}
        <div className="flex items-center gap-2">
          <div className="relative h-8 w-8">
            {/* Replace with your actual logo file path */}
            <div className="h-full w-full bg-gradient-to-tr from-teal-400 to-orange-400 rounded-full" />
          </div>
          <span className="text-xl font-semibold tracking-tight">Gadvance</span>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-10">
          <Link
            href="/about"
            className="text-zinc-600 hover:text-black transition-colors"
          >
            About
          </Link>
          <Link
            href="/courses"
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
            href="/signin"
            className="text-zinc-600 hover:text-black font-medium transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-[#00A9D1] px-6 py-2.5 text-white font-medium hover:bg-[#0089a8] transition-all"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* Main Content Hero */}
      <main className="flex flex-col items-center justify-center pt-32">
        <h1 className="text-4xl font-light text-zinc-400">
          Advancing Gender and Development.
        </h1>
      </main>
    </div>
  );
}
