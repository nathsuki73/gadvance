"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

import logoIcon from "@/app/assets/logo.ico";
import { handleSignOut } from "@/app/lib/auth";
import ConfirmDialog from "../../../components/ConfirmDialog";

// Shared Components
import { NavLink } from "./NavLink";
import { Button } from "../Button/button";

const PUBLIC_NAVS = [
  { href: "/workspace/about", label: "About" },
  { href: "/workspace/courses", label: "Courses" },
  { href: "/workspace/community", label: "Community" },
  { href: "/workspace/support", label: "Support" },
];

export default function Header() {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-zinc-100 bg-white/80 px-8 py-4 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Left: Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-transform active:scale-95"
        >
          <Image src={logoIcon} alt="Logo" width={32} height={32} />
          <span className="text-xl font-bold tracking-tight text-zinc-900">
            GADvance
          </span>
        </Link>

        {/* Center: Navs (Only show if logged out) */}
        {!isAuthenticated && (
          <nav className="hidden items-center gap-8 md:flex">
            {PUBLIC_NAVS.map((link) => (
              <NavLink key={link.href} href={link.href}>
                {link.label}
              </NavLink>
            ))}
          </nav>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Button href="/workspace/dashboard">Go to Workspace</Button>

              {/* Simple Profile Trigger */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 transition-colors hover:bg-zinc-50"
                >
                  <span className="text-xs font-bold text-zinc-500">
                    {session.user?.name?.charAt(0) || "U"}
                  </span>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-zinc-100 bg-white p-2 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-3 py-2 text-xs text-zinc-400 font-medium uppercase tracking-wider">
                      Account
                    </div>
                    <Link
                      href="/workspace/profile"
                      className="block rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => setShowLogoutDialog(true)}
                      className="w-full text-left rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <Button href="/auth/signin" variant="ghost">
                Log In
              </Button>
              <Button href="/auth/signup">Sign Up</Button>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showLogoutDialog}
        title="Log out?"
        description="Are you sure you want to end your session?"
        confirmLabel="Log out"
        cancelLabel="Cancel"
        onCancel={() => setShowLogoutDialog(false)}
        onConfirm={() => handleSignOut({ callbackUrl: "/" })}
      />
    </header>
  );
}
