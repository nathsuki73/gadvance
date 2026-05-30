"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation"; // 🎯 Added for programmatic navigation on item select
import {
  Menu,
  Search,
  X,
  Bell,
  LogOut,
  BookOpen,
  Settings,
  User2Icon,
} from "lucide-react";

import Notification from "../Notification";

import logoIcon from "@/app/assets/logo.ico";

import { NavLink } from "./NavLink";
import SearchBar from "./SearchBar";
import LogoutConfirmationDialog from "./LogoutConfirmation";
import { getUserProfile } from "../../service";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

function resolveAvatarSrc(avatar?: string | null) {
  if (!avatar) {
    return null;
  }

  const trimmedAvatar = avatar.trim();

  if (
    trimmedAvatar.startsWith("http://") ||
    trimmedAvatar.startsWith("https://") ||
    trimmedAvatar.startsWith("data:")
  ) {
    return trimmedAvatar;
  }

  const storagePath = trimmedAvatar.startsWith("/")
    ? trimmedAvatar
    : `/${trimmedAvatar}`;

  if (apiBaseUrl) {
    return `${apiBaseUrl}${storagePath}`;
  }

  return storagePath;
}

function getInitials(name?: string | null) {
  const trimmedName = name?.trim();

  if (!trimmedName) {
    return "U";
  }

  return trimmedName.charAt(0).toUpperCase();
}

const mockUser = {
  name: "Learner",
  email: "gadvanceproject@gmail.com",
  avatar: null,
};

const AUTH_NAVS = [
  { href: "/workspace", label: "Workspace" },
  { href: "/workspace/courses", label: "My Courses" },
  { href: "/explore", label: "Explore" },
  { href: "/workspace/certificates", label: "Certificates" },
];

export default function AuthHeader() {
  const router = useRouter();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const headerRef = useRef<HTMLElement>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [avatarFallbackIndex, setAvatarFallbackIndex] = useState(0);
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);
  const { data: session } = useSession();

  // 🎯 Search State Sub-Hook Management Arrays
  const [searchResults, setSearchResults] = useState<{ title: string; type: string; url: string; description?: string }[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const currentUser = {
    name: session?.user?.name || mockUser.name,
    email: session?.user?.email || mockUser.email,
    avatarSources: [
      resolveAvatarSrc(profileAvatar || session?.user?.image),
      resolveAvatarSrc(session?.user?.googleImage),
      null,
    ],
  };

  const activeAvatarSource = useMemo(() => {
    return currentUser.avatarSources[avatarFallbackIndex] || null;
  }, [avatarFallbackIndex, currentUser.avatarSources]);

  // 🎯 Instant Search Auto-fetching Pipeline with 250ms Debounce Protection
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      if (!apiBaseUrl) return;

      try {
        const response = await fetch(`${apiBaseUrl}/api/global-search?q=${encodeURIComponent(searchQuery)}`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${session?.laravelJwt}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSearchResults(data);
          setIsSearchOpen(true);
        }
      } catch (error) {
        console.error("Global search fetch execution failed:", error);
      }
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, session, apiBaseUrl]);

  useEffect(() => {
    let isMounted = true;

    const loadProfileAvatar = async () => {
      if (profileAvatar || !session?.user) {
        return;
      }

      const response = await getUserProfile();
      if (!isMounted || !response.success) {
        return;
      }

      const resolvedAvatar = resolveAvatarSrc(response.data.avatar ?? null);
      if (resolvedAvatar) {
        setProfileAvatar(resolvedAvatar);
      }
    };

    loadProfileAvatar();

    return () => {
      isMounted = false;
    };
  }, [profileAvatar, session?.user]);

  const toggleSearch = () => {
    const willBeShown = !showSearch;
    setShowSearch(willBeShown);
    if (!willBeShown) {
      setSearchQuery("");
      setIsSearchOpen(false);
    }
    if (willBeShown) {
      setShowMobileMenu(false);
      setShowProfileDropdown(false);
    }
  };

  const toggleMobileMenu = () => {
    const willBeOpen = !showMobileMenu;
    setShowMobileMenu(willBeOpen);
    if (willBeOpen) {
      setShowSearch(false);
      setShowProfileDropdown(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setShowSearch(false);
        setShowMobileMenu(false);
        setShowProfileDropdown(false);
        setShowNotifications(false);
        setIsSearchOpen(false); // Closes spotlight wrapper when clicking canvas body
      }
    };

    document.addEventListener("pointerdown", handleClickOutside);
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, []);

  // Shared result click handler to perform seamless route redirect cleanups
  const handleResultClick = (url: string) => {
    setIsSearchOpen(false);
    setShowSearch(false);
    setSearchQuery("");
    router.push(url);
  };

  const userAvatarKey = `${session?.user?.image || ""}-${session?.user?.googleImage || ""}-${session?.user?.name || ""}`;

  const renderAvatar = (sizeClassName: string, textClassName: string) => {
    if (activeAvatarSource) {
      return (
        <Image
          key={userAvatarKey}
          src={activeAvatarSource}
          alt={`${currentUser.name} avatar`}
          width={40}
          height={40}
          sizes="40px"
          unoptimized={activeAvatarSource.startsWith("data:")}
          className={sizeClassName}
          onError={() =>
            setAvatarFallbackIndex((currentIndex) =>
              Math.min(currentIndex + 1, currentUser.avatarSources.length - 1),
            )
          }
        />
      );
    }

    return (
      <span className={textClassName}>{getInitials(currentUser.name)}</span>
    );
  };

  // Shared Sub-component template for Search Dropdown Layouts
  const renderSearchDropdown = () => {
    if (!isSearchOpen || searchResults.length === 0) return null;
    return (
      <div className="absolute top-full left-0 mt-2 w-full max-w-[400px] rounded-2xl border border-zinc-100 bg-white p-2 shadow-2xl z-50 max-h-[350px] overflow-y-auto">
        {searchResults.map((item, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleResultClick(item.url)}
            className="flex w-full flex-col gap-0.5 rounded-xl px-4 py-2 text-left text-sm hover:bg-zinc-50 transition-all group"
          >
            <div className="flex justify-between items-center w-full">
              <span className="font-semibold text-zinc-800 group-hover:text-primary transition-colors">
                {item.title}
              </span>
            </div>
            {item.description && (
              <p className="text-xs text-zinc-400 truncate w-full">{item.description}</p>
            )}
          </button>
        ))}
      </div>
    );
  };

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b border-zinc-100 bg-white/80 px-4 py-3 backdrop-blur-md md:px-6"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        {/* LEFT: Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 transition-transform active:scale-95"
        >
          <Image src={logoIcon} alt="Logo" width={32} height={32} />
          <span className="text-xl font-bold tracking-tight text-zinc-900 block">
            GADvance
          </span>
        </Link>

        {/* CENTER/RIGHT: Search & Navigation */}
        <div className="flex flex-1 items-center justify-end gap-2 md:gap-4">
          {/* DESKTOP SEARCH COMPONENT WITH DROPDOWN */}
          <div className="hidden sm:block sm:flex-1 sm:max-w-md relative">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
            />
            {renderSearchDropdown()}
          </div>

          {/* MOBILE SEARCH TOGGLE */}
          <button
            type="button"
            onClick={toggleSearch}
            className="rounded-full p-2 text-zinc-600 hover:bg-zinc-100 sm:hidden"
          >
            {showSearch ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </button>

          {/* DESKTOP NAV */}
          <nav className="hidden items-center gap-6 xl:flex">
            {AUTH_NAVS.map((link) => (
              <NavLink key={link.href} href={link.href}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* AUTHENTICATED USER ACTIONS */}
          <div className="flex items-center gap-2 border-l border-zinc-100 pl-2 md:pl-4">
            {/* Notifications Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  const next = !showNotifications;
                  setShowNotifications(next);
                  if (next) {
                    setShowProfileDropdown(false);
                    setShowMobileMenu(false);
                    setShowSearch(false);
                  }
                }}
                aria-expanded={showNotifications}
                className="relative rounded-full p-2 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
              >
                <Bell className="h-5 w-5" strokeWidth={1.8} />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#a78bfa]" />
              </button>

              <Notification
                open={showNotifications}
                onCloseAction={() => setShowNotifications(false)}
              />
            </div>

            {/* User Dropdown Trigger */}
            <div className="relative hidden xl:block">
              <button
                type="button"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-100 bg-zinc-50 p-0 hover:border-[#a78bfa]/30 transition-all"
              >
                {renderAvatar(
                  "h-full w-full rounded-full object-cover",
                  "flex h-full w-full items-center justify-center rounded-full bg-[#c4b5fd] text-white text-xs font-bold",
                )}
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileDropdown && (
                <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-primary-hover/20 bg-white p-2 flex flex-col gap-0.5">
                  <div className="px-3 py-2.5 border-b border-zinc-50 mb-1">
                    <p className="text-xs font-bold text-zinc-800 lowercase">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-zinc-400 font-light truncate mt-0.5">
                      {currentUser.email}
                    </p>
                  </div>

                  <DropdownLink
                    href="/workspace/profile"
                    icon={<User2Icon size={14} />}
                    label="profile"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLogoutDialog(true)}
                    className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-xs text-red-500 font-medium hover:bg-red-50 transition-colors lowercase"
                  >
                    <LogOut size={14} />
                    sign out
                  </button>
                </div>
              )}
              <LogoutConfirmationDialog
                open={showLogoutDialog}
                onClose={() => setShowLogoutDialog(false)}
              />
            </div>

            {/* BURGER MENU */}
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-50 xl:hidden"
            >
              {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE SEARCH DRAWER WITH DROPDOWN */}
      <div
        className={`transition-all duration-300 ease-in-out md:hidden relative ${showSearch ? "max-h-24 opacity-100 mt-3" : "max-h-0 opacity-0 overflow-hidden"}`}
      >
        <div className="border-t border-zinc-100 pt-3 flex justify-center">
          <div className="relative w-full max-w-md">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
            />
            {renderSearchDropdown()}
          </div>
        </div>
      </div>

      {/* EXPANDABLE MOBILE MENU WITH LOGGED IN METRICS */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out xl:hidden ${showMobileMenu ? "max-h-150 opacity-100 mt-4" : "max-h-0 opacity-0"}`}
      >
        <nav className="flex flex-col gap-1 border-t border-zinc-100 pt-4">
          {/* User Mobile Info Card */}
          <div className="flex items-center gap-3 px-3 py-3 bg-zinc-50 rounded-2xl mb-3">
            <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-xl bg-[#c4b5fd]">
              {renderAvatar(
                "h-full w-full rounded-xl object-cover",
                "flex h-full w-full items-center justify-center rounded-xl bg-[#c4b5fd] text-white text-sm font-bold",
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-800 lowercase">
                {currentUser.name}
              </p>
              <p className="text-xs text-zinc-400 font-light truncate">
                {currentUser.email}
              </p>
            </div>
          </div>

          {/* Standard Navigation Links */}
          {AUTH_NAVS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl px-3 py-2.5 text-base font-medium text-zinc-600 hover:bg-zinc-50"
              onClick={() => setShowMobileMenu(false)}
            >
              {link.label}
            </Link>
          ))}

          {/* User Direct Workspace Links */}
          <div className="border-t border-zinc-50 mt-2 pt-3 flex flex-col gap-1">
            <Link
              href="/workspace"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50 font-medium"
              onClick={() => setShowMobileMenu(false)}
            >
              <BookOpen size={16} className="text-[#a78bfa]" />
              My learning dashboard
            </Link>
            <Link
              href="/workspace/profile"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50 font-medium"
              onClick={() => setShowMobileMenu(false)}
            >
              <Settings size={16} className="text-zinc-400" />
              Profile Settings
            </Link>
            <button
              type="button"
              onClick={() => {
                setShowLogoutDialog(true);
                setShowMobileMenu(false);
              }}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-500 font-medium hover:bg-red-50/50 text-left lowercase mt-1"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}

/* Helper Inner Component for Dropdown Links */
const DropdownLink = ({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) => (
  <Link
    href={href}
    className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs text-zinc-600 font-medium hover:bg-zinc-50 transition-colors lowercase"
  >
    <span className="text-zinc-400">{icon}</span>
    {label}
  </Link>
);