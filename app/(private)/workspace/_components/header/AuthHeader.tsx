"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Menu,
  Search,
  X,
  Bell,
  LogOut,
  Settings,
  User2Icon,
} from "lucide-react";

import Notification from "../Notification";
import logoIcon from "@/app/assets/logo.ico";
import { NavLink } from "./NavLink";
import SearchBar from "./SearchBar";
import LogoutConfirmationDialog from "./LogoutConfirmation";
import { getUserProfile } from "../../service";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
const SEARCH_DEBOUNCE_MS = 250;

const AUTH_NAVS = [
  { href: "/workspace", label: "Workspace" },
  { href: "/workspace/courses", label: "My Courses" },
  { href: "/explore", label: "Explore" },
] as const;

const FALLBACK_USER = {
  name: "Learner",
  email: "gadvanceproject@gmail.com",
};

type ProfileInfo = {
  firstName?: string;
  first_name?: string;
  middleName?: string;
  middle_name?: string;
  lastName?: string;
  last_name?: string;
  avatar?: string | null;
};

type SearchResult = {
  title: string;
  type: string;
  url: string;
  description?: string;
};

function resolveAvatarSrc(avatar?: string | null): string | null {
  if (!avatar) return null;

  const trimmed = avatar.trim();
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }

  const storagePath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return API_BASE_URL ? `${API_BASE_URL}${storagePath}` : storagePath;
}

function getInitials(name?: string | null): string {
  const trimmed = name?.trim();
  if (!trimmed) return "U";

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export default function AuthHeader() {
  const router = useRouter();
  const { data: session } = useSession();
  const headerRef = useRef<HTMLElement>(null);

  // Overlay visibility — only one should be open at a time
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Profile data
  const [profileInfo, setProfileInfo] = useState<ProfileInfo | null>(null);
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);
  const [avatarFallbackIndex, setAvatarFallbackIndex] = useState(0);

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const closeAllOverlays = () => {
    setShowMobileMenu(false);
    setShowSearch(false);
    setShowProfileDropdown(false);
    setShowNotifications(false);
    setIsSearchOpen(false);
  };

  const displayName = useMemo(() => {
    const sessionUser = session?.user as
      | (typeof session.user & Partial<ProfileInfo>)
      | undefined;

    const first =
      sessionUser?.firstName ||
      sessionUser?.first_name ||
      profileInfo?.firstName ||
      profileInfo?.first_name ||
      "";
    const middle =
      sessionUser?.middleName ||
      sessionUser?.middle_name ||
      profileInfo?.middleName ||
      profileInfo?.middle_name ||
      "";
    const last =
      sessionUser?.lastName ||
      sessionUser?.last_name ||
      profileInfo?.lastName ||
      profileInfo?.last_name ||
      "";

    const composed = [first, middle, last].filter(Boolean).join(" ").trim();
    if (composed) return composed;

    const sessionName = session?.user?.name;
    if (sessionName && !sessionName.includes("@")) return sessionName;

    return FALLBACK_USER.name;
  }, [session?.user, profileInfo]);

  const currentUser = useMemo(
    () => ({
      name: displayName,
      email: session?.user?.email || FALLBACK_USER.email,
      avatarSources: [
        resolveAvatarSrc(profileAvatar || session?.user?.image),
        resolveAvatarSrc(
          (session?.user as { googleImage?: string })?.googleImage,
        ),
      ].filter((src): src is string => Boolean(src)),
    }),
    [displayName, profileAvatar, session?.user],
  );

  const activeAvatarSource =
    currentUser.avatarSources[avatarFallbackIndex] ?? null;

  // Debounced global search
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      if (!API_BASE_URL || !session?.laravelJwt) return;

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/global-search?q=${encodeURIComponent(searchQuery)}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${session.laravelJwt}`,
            },
          },
        );

        if (!response.ok) return;

        const payload = await response.json();
        const results = Array.isArray(payload) ? payload : payload?.data;

        setSearchResults(Array.isArray(results) ? results : []);
        setIsSearchOpen(true);
      } catch (error) {
        console.error("Global search fetch failed:", error);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, session]);

  // Load extended profile (name parts + avatar) once per session
  useEffect(() => {
    if (profileAvatar || !session?.user) return;

    let isMounted = true;

    (async () => {
      const response = await getUserProfile();
      if (!isMounted || !response.success) return;

      setProfileInfo(response.data ?? null);

      const avatar = resolveAvatarSrc(response.data?.avatar ?? null);
      if (avatar) setProfileAvatar(avatar);
    })();

    return () => {
      isMounted = false;
    };
  }, [profileAvatar, session?.user]);

  // Close all overlays on outside click
  useEffect(() => {
    const handleClickOutside = (e: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        closeAllOverlays();
      }
    };

    document.addEventListener("pointerdown", handleClickOutside);
    return () =>
      document.removeEventListener("pointerdown", handleClickOutside);
  }, []);

  const toggleSearch = () => {
    setShowSearch((current) => {
      const next = !current;
      if (next) {
        setShowMobileMenu(false);
        setShowProfileDropdown(false);
      } else {
        setSearchQuery("");
        setIsSearchOpen(false);
      }
      return next;
    });
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu((current) => {
      const next = !current;
      if (next) {
        setShowSearch(false);
        setShowProfileDropdown(false);
      }
      return next;
    });
  };

  const toggleNotifications = () => {
    setShowNotifications((current) => {
      const next = !current;
      if (next) {
        setShowProfileDropdown(false);
        setShowMobileMenu(false);
        setShowSearch(false);
      }
      return next;
    });
  };

  const toggleProfileDropdown = () => {
    setShowNotifications(false);
    setShowProfileDropdown((current) => !current);
  };

  const handleResultClick = (url: string) => {
    closeAllOverlays();
    setSearchQuery("");
    router.push(url);
  };

  const avatarKey = `${session?.user?.image ?? ""}-${
    (session?.user as { googleImage?: string })?.googleImage ?? ""
  }-${session?.user?.name ?? ""}`;

  const renderAvatar = (sizeClassName: string, textClassName: string) =>
    activeAvatarSource ? (
      <Image
        key={avatarKey}
        src={activeAvatarSource}
        alt={`${currentUser.name} avatar`}
        width={40}
        height={40}
        sizes="40px"
        unoptimized={activeAvatarSource.startsWith("data:")}
        className={sizeClassName}
        onError={() =>
          setAvatarFallbackIndex((i) =>
            Math.min(i + 1, currentUser.avatarSources.length - 1),
          )
        }
      />
    ) : (
      <span className={textClassName}>{getInitials(currentUser.name)}</span>
    );

  const renderSearchDropdown = () => {
    if (!isSearchOpen || searchResults.length === 0) return null;

    return (
      <div className="absolute top-full left-0 mt-2 w-full max-w-[400px] rounded-2xl border border-zinc-100 bg-white p-2 shadow-2xl z-50 max-h-[350px] overflow-y-auto">
        {searchResults.map((item, index) => (
          <button
            key={`${item.url}-${index}`}
            type="button"
            onClick={() => handleResultClick(item.url)}
            className="flex w-full flex-col gap-0.5 rounded-xl px-4 py-2 text-left text-sm hover:bg-zinc-50 transition-all group"
          >
            <span className="font-semibold text-zinc-800 group-hover:text-primary transition-colors">
              {item.title}
            </span>
            {item.description && (
              <p className="text-xs text-zinc-400 truncate w-full">
                {item.description}
              </p>
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
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 transition-transform"
        >
          <Image src={logoIcon} alt="Logo" width={32} height={32} />
          <span className="text-xl font-bold tracking-tight text-zinc-900 block">
            GADvance
          </span>
        </Link>

        <div className="flex flex-1 items-center justify-end gap-2 md:gap-4">
          {/* Desktop search */}
          <div className="hidden sm:block sm:flex-1 sm:max-w-md relative">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
            {renderSearchDropdown()}
          </div>

          {/* Mobile search toggle */}
          <button
            type="button"
            onClick={toggleSearch}
            className="rounded-full p-2 text-zinc-600 hover:bg-zinc-100 sm:hidden"
          >
            {showSearch ? (
              <X className="h-5 w-5" />
            ) : (
              <Search className="h-5 w-5" />
            )}
          </button>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 xl:flex">
            {AUTH_NAVS.map((link) => (
              <NavLink key={link.href} href={link.href}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 border-l border-zinc-100 pl-4 md:pl-4">
            {/* Notifications */}
            <div className="relative">
              <button
                type="button"
                onClick={toggleNotifications}
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

            {/* Profile dropdown */}
            <div className="relative hidden xl:block">
              <button
                type="button"
                onClick={toggleProfileDropdown}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-100 bg-zinc-50 p-0 hover:border-[#a78bfa]/30 transition-all"
              >
                {renderAvatar(
                  "h-full w-full rounded-full object-cover",
                  "flex h-full w-full items-center justify-center rounded-full bg-[#c4b5fd] text-white text-xs font-bold",
                )}
              </button>

              <div
                className={`absolute right-0 mt-3 w-56 z-50 origin-top-right rounded-2xl border border-primary-hover/20 bg-white p-2 flex flex-col gap-0.5 shadow-xl transition-all duration-200 ease-in-out transform ${
                  showProfileDropdown
                    ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
                }`}
              >
                <div className="px-3 py-2.5 border-b border-zinc-200 mb-1">
                  <p className="text-xs font-bold text-zinc-800">
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

              <LogoutConfirmationDialog
                open={showLogoutDialog}
                onClose={() => setShowLogoutDialog(false)}
              />
            </div>

            {/* Burger menu */}
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-50 xl:hidden"
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

      {/* Mobile search drawer */}
      <div
        className={`transition-all duration-300 ease-in-out md:hidden relative ${
          showSearch
            ? "max-h-24 opacity-100 mt-3"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="border-t border-zinc-100 pt-3 flex justify-center">
          <div className="relative w-full max-w-md">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
            {renderSearchDropdown()}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out xl:hidden ${
          showMobileMenu ? "max-h-150 opacity-100 mt-4" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col gap-1 border-t border-zinc-100 pt-4">
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

          <div className="border-t border-zinc-50 mt-2 pt-3 flex flex-col gap-1">
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

function DropdownLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs text-zinc-600 font-medium hover:bg-zinc-50 transition-colors lowercase"
    >
      <span className="text-zinc-400">{icon}</span>
      {label}
    </Link>
  );
}
