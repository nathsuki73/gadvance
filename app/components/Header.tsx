"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import logoIcon from "@/app/assets/logo.ico";
import { handleSignOut } from "@/app/lib/auth";
import ConfirmDialog from "./ConfirmDialog";

const Header = () => {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const router = useRouter();
  const navMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogoClick = () => {
    router.push(isAuthenticated ? "/workspace" : "/");
  };

  useEffect(() => {
    if (!showMenu && !showProfileMenu) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        showMenu &&
        navMenuRef.current &&
        menuButtonRef.current &&
        !navMenuRef.current.contains(target) &&
        !menuButtonRef.current.contains(target)
      ) {
        setShowMenu(false);
      }

      if (
        showProfileMenu &&
        profileMenuRef.current &&
        profileButtonRef.current &&
        !profileMenuRef.current.contains(target) &&
        !profileButtonRef.current.contains(target)
      ) {
        setShowProfileMenu(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowMenu(false);
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showMenu, showProfileMenu]);

  return (
    <header className="relative z-60 flex items-center justify-between px-8 py-4 bg-white border-b border-zinc-100">
      {/* Clickable Logo Section */}
      <div className="flex-1">
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-0 padding-0"
        >
          <div className="relative h-9 w-9 shrink-0">
            <Image
              src={logoIcon.src}
              alt="GADVance logo"
              width={36}
              height={36}
              className="h-full w-full object-contain"
            />
          </div>
          <span className="text-xl font-semibold tracking-tight">GADvance</span>
        </button>
      </div>

      {/* Navigation Links */}
      {isAuthenticated ? (
        <div className="relative mr-6">
          <button
            ref={menuButtonRef}
            onClick={() => setShowMenu((prev) => !prev)}
            aria-expanded={showMenu}
            aria-haspopup="menu"
            aria-label="Open menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-zinc-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`h-5 w-5 transition-transform duration-300 ${showMenu ? "rotate-180" : ""}`}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
              />
            </svg>
          </button>

          {showMenu ? (
            <div
              ref={navMenuRef}
              className="pointer-events-auto absolute right-0 top-full z-70 mt-3 w-56 max-w-[calc(100vw-2rem)] rounded-xl border border-zinc-200 bg-white p-2 shadow-lg"
              role="menu"
              aria-label="Menu"
            >
              <Link
                href="/workspace/about"
                className="block rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-300"
                role="menuitem"
                onClick={() => setShowMenu(false)}
              >
                About
              </Link>
              <Link
                href="/workspace/courses"
                className="block rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-300"
                role="menuitem"
                onClick={() => setShowMenu(false)}
              >
                Courses
              </Link>
              <Link
                href="/workspace/community"
                className="block rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-300"
                role="menuitem"
                onClick={() => setShowMenu(false)}
              >
                Community
              </Link>
              <Link
                href="/workspace/support"
                className="block rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-300"
                role="menuitem"
                onClick={() => setShowMenu(false)}
              >
                Support
              </Link>
            </div>
          ) : null}
        </div>
      ) : (
        <nav className="hidden md:flex items-center gap-10 mr-15">
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
      )}

      {/* Auth Buttons */}
      <div className="flex items-center gap-6">
        {isAuthenticated ? (
          <div className="relative flex items-center">
            <button
              ref={profileButtonRef}
              onClick={() => setShowProfileMenu((prev) => !prev)}
              aria-expanded={showProfileMenu}
              aria-haspopup="menu"
              aria-label="Open profile options"
              title="Profile"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <circle cx="12" cy="8" r="3.5" />
                <path d="M4.5 19a7.5 7.5 0 0 1 15 0" />
              </svg>
            </button>

            {showProfileMenu ? (
              <div
                ref={profileMenuRef}
                className="pointer-events-auto absolute right-0 top-full z-70 mt-3 w-72 rounded-xl border border-zinc-200 bg-white p-4 shadow-lg"
                role="menu"
                aria-label="Profile menu"
              >
                <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 text-zinc-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="8" r="3.5" />
                      <path d="M4.5 19a7.5 7.5 0 0 1 15 0" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-zinc-900">
                      {session?.user?.name ?? "User"}
                    </p>
                    <p className="truncate text-xs text-zinc-500">
                      {session?.user?.email ?? "No email"}
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid gap-2">
                  <Link
                    href="/workspace/profile"
                    className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
                    role="menuitem"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/workspace/settings"
                    className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
                    role="menuitem"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    Settings
                  </Link>
                  <button
                    type="button"
                    className="rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                    role="menuitem"
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowLogoutDialog(true);
                    }}
                  >
                    Log out
                  </button>
                </div>
              </div>
            ) : null}
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
