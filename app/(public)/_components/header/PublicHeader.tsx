"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";

import logoIcon from "@/app/assets/logo.ico";

import { NavLink } from "./NavLink";
import { Button } from "../Button/button";

const PUBLIC_NAVS = [
  { href: "/about", label: "About" },
  { href: "/explore", label: "Explore" },
  { href: "/community-forum", label: "Community" },
  { href: "/support", label: "Support" },
  { href: "/organization", label: "Organizations" },
];

export default function PublicHeader() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const headerRef = useRef<HTMLElement>(null);
  const pointerOrigin = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerOrigin.current = { x: e.clientX, y: e.clientY };
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      selection.removeAllRanges();
    }
  };

  const handleSafeLinkClick = (
    e: React.MouseEvent<HTMLElement>,
    href: string,
  ) => {
    // Allow opening in a new tab via Ctrl/Cmd + Click
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) {
      return;
    }

    // Ignore drag-clicks to prevent freezes
    const moveX = Math.abs(e.clientX - pointerOrigin.current.x);
    const moveY = Math.abs(e.clientY - pointerOrigin.current.y);
    if (moveX > 6 || moveY > 6) {
      e.preventDefault();
      return;
    }

    // Prevent rapid-click thread locks
    if (isPending) {
      e.preventDefault();
      return;
    }

    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }

    setShowMobileMenu(false);
    setShowSearch(false);

    e.preventDefault();
    startTransition(() => {
      router.push(href);
    });
  };

  const toggleMobileMenu = () => {
    const willBeOpen = !showMobileMenu;
    setShowMobileMenu(willBeOpen);

    if (willBeOpen) {
      setShowSearch(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: PointerEvent) => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        return;
      }

      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setShowSearch(false);
        setShowMobileMenu(false);
      }
    };

    document.addEventListener("pointerdown", handleClickOutside);

    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, []);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b border-zinc-100 bg-white/80 px-4 py-3 backdrop-blur-md md:px-6"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        {/* LEFT: Logo with Safe Link Handler */}
        <Link
          href="/"
          draggable={false}
          onPointerDown={handlePointerDown}
          onClick={(e) => handleSafeLinkClick(e, "/")}
          className="flex shrink-0 items-center gap-2.5 transition-transform active:scale-95 select-none cursor-pointer"
        >
          <Image src={logoIcon} alt="Logo" width={32} height={32} />
          <span className="text-xl font-bold tracking-tight text-zinc-900 block">
            GADvance
          </span>
        </Link>

        {/* CENTER/RIGHT: Search & Navigation */}
        <div className="flex flex-1 items-center justify-end gap-2 md:gap-4">
          {/* DESKTOP NAV */}
          <nav className="hidden items-center gap-6 xl:flex">
            {PUBLIC_NAVS.map((link) => (
              <NavLink key={link.href} href={link.href}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* AUTH ACTIONS (Using the safe Button component naturally with href) */}
          <div className="flex items-center gap-2">
            <div className="hidden xl:flex items-center gap-2">
              <Button href="/auth/signin" variant="ghost">
                Log In
              </Button>
              <Button href="/auth/signup">Sign Up</Button>
            </div>

            {/* BURGER MENU */}
            <button
              onClick={toggleMobileMenu}
              className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-50 xl:hidden"
              aria-label="Toggle menu"
            >
              {showMobileMenu ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* EXPANDABLE MOBILE/TABLET MENU */}
      <div
        className={`
        overflow-hidden transition-all duration-300 ease-in-out xl:hidden
        ${showMobileMenu ? "max-h-125 opacity-100 mt-4" : "max-h-0 opacity-0"}
      `}
      >
        <nav className="flex flex-col gap-2 border-t border-zinc-100 pt-4">
          <>
            {PUBLIC_NAVS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                draggable={false}
                onPointerDown={handlePointerDown}
                onClick={(e) => handleSafeLinkClick(e, link.href)}
                className="rounded-lg px-3 py-2 text-base font-medium text-zinc-600 hover:bg-zinc-50 select-none"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 mt-2 pt-2">
              <Button
                href="/auth/signin"
                variant="ghost"
                className="justify-center"
              >
                Log In
              </Button>
              <Button href="/auth/signup">Sign Up</Button>
            </div>
          </>
        </nav>
      </div>
    </header>
  );
}
