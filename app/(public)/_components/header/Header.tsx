"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Menu, Search, X } from "lucide-react"; 

import logoIcon from "@/app/assets/logo.ico";
import { handleSignOut } from "@/app/lib/auth";
import ConfirmDialog from "../../../components/ConfirmDialog";

import { NavLink } from "./NavLink";
import { Button } from "../Button/button";
import { SearchBar } from "./SearchBar";

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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  
  const profileMenuRef = useRef<HTMLDivElement>(null);


  const toggleSearch = () => {
    const willBeShown = !showSearch;
    setShowSearch(willBeShown);
    
    // If opening search, close the burger menu
    if (willBeShown) {
      setShowMobileMenu(false);
    }
  };

  const toggleMobileMenu = () => {
    const willBeOpen = !showMobileMenu;
    setShowMobileMenu(willBeOpen);
    
    if (willBeOpen) {
      setShowSearch(false);
    }
  };
  
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white/80 px-4 py-3 backdrop-blur-md md:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        
        {/* LEFT: Logo (Icon only on mobile, text added on sm+) */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5 transition-transform active:scale-95">
          <Image src={logoIcon} alt="Logo" width={32} height={32} />
          <span className="hidden text-xl font-bold tracking-tight text-zinc-900 sm:block">
            GADvance
          </span>
        </Link>

        {/* CENTER/RIGHT: Search & Navigation */}
        <div className="flex flex-1 items-center justify-end gap-2 md:gap-4">
          
         {/* DESKTOP SEARCH */}
<div className="hidden sm:block sm:flex-1 sm:max-w-md">
  <SearchBar />
</div>

{/* MOBILE SEARCH TOGGLE */}
<button
  onClick={toggleSearch}
  className="rounded-full p-2 text-zinc-600 hover:bg-zinc-100 sm:hidden"
>
  {showSearch ? (
    <X className="h-5 w-5" />
  ) : (
    <Search className="h-5 w-5" />
  )}
</button>

          {/* DESKTOP NAV (xl only) */}
          {!isAuthenticated && (
            <nav className="hidden items-center gap-6 xl:flex">
              {PUBLIC_NAVS.map((link) => (
                <NavLink key={link.href} href={link.href}>{link.label}</NavLink>
              ))}
            </nav>
          )}

          {/* AUTH ACTIONS */}
          <div className="flex items-center gap-2">
            {!isAuthenticated && (
              <div className="hidden xl:flex items-center gap-2">
                <Button href="/auth/signin" variant="ghost">Log In</Button>
                <Button href="/auth/signup">Sign Up</Button>
              </div>
            )}

            {isAuthenticated && (
              <div className="flex items-center gap-3">
                <div className="hidden lg:block">
                  <Button href="/workspace/dashboard">Workspace</Button>
                </div>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 hover:border-[#00aeef]"
                  >
                    <span className="text-xs font-bold text-zinc-600">
                      {session.user?.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-zinc-100 bg-white p-2 shadow-xl">
                      <div className="px-3 py-2 text-xs font-medium uppercase text-zinc-400">Account</div>
                      <Link href="/workspace/profile" className="block rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50">Profile</Link>
                      <button onClick={() => setShowLogoutDialog(true)} className="w-full text-left rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50">Log out</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* BURGER MENU (Visible up to xl) */}
            <button 
              onClick={toggleMobileMenu} // Using the new handler
              className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-50 xl:hidden"
            >
              {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

<div
  className={`
     transition-all duration-300 ease-in-out md:hidden
    ${showSearch ? "max-h-24 opacity-100 mt-3" : "max-h-0 opacity-0"}
  `}
>
  <div className="border-t border-zinc-100 pt-3">
    <SearchBar />
  </div>
</div>

      {/* EXPANDABLE MOBILE/TABLET MENU */}
      <div className={`
        overflow-hidden transition-all duration-300 ease-in-out xl:hidden
        ${showMobileMenu ? "max-h-[500px] opacity-100 mt-4" : "max-h-0 opacity-0"}
      `}>
        <nav className="flex flex-col gap-2 border-t border-zinc-100 pt-4">
          {!isAuthenticated && (
            <>
              {PUBLIC_NAVS.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className="rounded-lg px-3 py-2 text-base font-medium text-zinc-600 hover:bg-zinc-50"
                  onClick={() => setShowMobileMenu(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 mt-2 pt-2">
                <Button href="/auth/signin" variant="ghost" className="justify-start">Log In</Button>
                <Button href="/auth/signup">Sign Up</Button>
              </div>
            </>
          )}
          {isAuthenticated && (
            <Link 
              href="/workspace/dashboard" 
              className="rounded-lg px-3 py-2 text-base font-medium text-zinc-600 hover:bg-zinc-50 lg:hidden" 
              onClick={() => setShowMobileMenu(false)}
            >
              Go to Workspace
            </Link>
          )}
        </nav>
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