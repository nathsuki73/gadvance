"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import logoIcon from "@/app/assets/logo.ico";
import { handleSignOut } from "@/app/lib/auth";
import ConfirmDialog from "./ConfirmDialog";

const Header = () => {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const router = useRouter();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogoClick = () => {
    router.push(isAuthenticated ? "/workspace" : "/");
  };

  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-zinc-100">
      {/* Clickable Logo Section */}
      <button
        onClick={handleLogoClick}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-0 padding-0"
      >
        <div className="relative h-9 w-9 shrink-0">
          <img
            src={logoIcon.src}
            alt="GADVance logo"
            className="h-full w-full object-contain"
          />
        </div>
        <span className="text-xl font-semibold tracking-tight">GADVance</span>
      </button>

      {/* Navigation Links */}
      <nav className="hidden md:flex items-center gap-10">
        <Link
          href="/workspace/about"
          className="text-zinc-600 hover:text-black transition-colors"
        >
          About
        </Link>
        <Link
          href="/workspace/courses"
          className="text-zinc-600 hover:text-black transition-colors"
        >
          Courses
        </Link>
        <Link
          href="/workspace/community"
          className="text-zinc-600 hover:text-black transition-colors"
        >
          Community
        </Link>
        <Link
          href="/workspace/support"
          className="text-zinc-600 hover:text-black transition-colors"
        >
          Support
        </Link>
      </nav>

      {/* Auth Buttons */}
      <div className="flex items-center gap-6">
        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-zinc-900">
                {session?.user?.name}
              </p>
              <p className="text-xs text-zinc-500">{session?.user?.email}</p>
            </div>
            <button
              onClick={() => setShowLogoutDialog(true)}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
            >
              Log Out
            </button>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>

      <ConfirmDialog
        open={showLogoutDialog}
        title="Log out of your account?"
        description="You will be signed out and returned to the home page. You can always sign back in again.
        "
        confirmLabel="Log out"
        cancelLabel="Stay signed in"
        onCancel={() => setShowLogoutDialog(false)}
        onConfirm={() => {
          setShowLogoutDialog(false);
          handleSignOut({ callbackUrl: "/" });
        }}
      />
    </header>
  );
};

export default Header;
