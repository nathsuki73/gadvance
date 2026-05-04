"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Bell,
  Globe,
  Lock,
  Palette,
  Shield,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { getStoredTheme, getSystemTheme, setTheme } from "@/app/lib/theme";

const SettingsPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [themePreference, setThemePreference] = useState(
    () => getStoredTheme() ?? "system",
  );
  const isDarkMode =
    themePreference === "system"
      ? getSystemTheme() === "dark"
      : themePreference === "dark";

  const statusLabel = session?.user?.status ?? "Active";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/signin");
    }
  }, [status, router]);

  const handleThemeChange = (value: string) => {
    if (value === "light" || value === "dark" || value === "system") {
      setThemePreference(value);
      setTheme(value);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fffdf8]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#00a9d1]/20 border-t-[#00a9d1]" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#fffdf8] text-zinc-900">
      <Header />

      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#00a9d1]/15 blur-3xl" />
          <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-[#ff8a00]/15 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <section className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-[0_10px_60px_-30px_rgba(0,169,209,0.45)] backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-[#00a9d1]/10 px-3 py-1 text-xs font-semibold tracking-wider text-[#007a97] uppercase">
                  <Sparkles className="h-3.5 w-3.5" />
                  Settings Center
                </p>
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
                  Account Settings
                </h1>
                <p className="mt-2 text-sm text-zinc-500">
                  Placeholder settings sections are ready. You can wire these to
                  real preferences and account controls later.
                </p>
              </div>
              <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-700">
                Status: {statusLabel}
              </span>
            </div>
          </section>

          <section className="mt-7 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-zinc-900">
                Preferences (Placeholder)
              </h2>
              <div className="mt-5 space-y-3">
                <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-900">
                        <Palette className="h-4 w-4 text-zinc-500" />
                        Theme preference
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {themePreference === "system"
                          ? `System (${isDarkMode ? "Dark" : "Light"})`
                          : themePreference === "dark"
                            ? "Dark Mode"
                            : "Light Mode"}
                      </p>
                    </div>

                    <div className="relative w-full max-w-52">
                      <select
                        aria-label="Theme preference"
                        value={themePreference}
                        onChange={(event) =>
                          handleThemeChange(event.target.value)
                        }
                        className="w-full appearance-none rounded-full border border-zinc-300 bg-white px-4 py-2 pr-10 text-sm font-medium text-zinc-900 shadow-sm outline-none transition focus:border-[#00a9d1] focus:ring-2 focus:ring-[#00a9d1]/20"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System (default)</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-zinc-500">
                        <Sparkles className="h-4 w-4 rotate-45" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-4">
                  <p className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-900">
                    <Globe className="h-4 w-4 text-zinc-500" />
                    Language
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    English (placeholder)
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-4">
                  <p className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-900">
                    <Bell className="h-4 w-4 text-zinc-500" />
                    Notifications
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Enabled (placeholder)
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[#00a9d1]/20 bg-white p-6 shadow-[0_10px_60px_-35px_rgba(0,169,209,0.6)]">
              <h2 className="text-lg font-semibold text-zinc-900">
                Security (Placeholder)
              </h2>
              <div className="mt-5 space-y-3">
                <div className="rounded-xl border border-zinc-100 bg-white p-4">
                  <p className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-900">
                    <Lock className="h-4 w-4 text-teal-600" />
                    Password
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Last updated: not set (placeholder)
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-100 bg-white p-4">
                  <p className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-900">
                    <Shield className="h-4 w-4 text-orange-500" />
                    Two-factor authentication
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Disabled (placeholder)
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-100 bg-white p-4">
                  <p className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-900">
                    <SlidersHorizontal className="h-4 w-4 text-zinc-500" />
                    Privacy controls
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Default visibility (placeholder)
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SettingsPage;
