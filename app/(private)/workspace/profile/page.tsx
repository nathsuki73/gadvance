"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Bell,
  BookOpen,
  CalendarClock,
  Mail,
  MapPin,
  Shield,
  Sparkles,
  User,
} from "lucide-react";
import Header from "@/app/(public)/_components/header/PublicHeader";
import Footer from "@/app/components/Footer";

const ProfilePage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();

  const fullName = session?.user?.name?.trim() || "Your Name";
  const email = session?.user?.email?.trim() || "your-email@example.com";
  const statusLabel = session?.user?.status ?? "Active";
  const location = "Location from profile settings";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/signin");
    }
  }, [status, router]);

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
      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-28 -left-24 h-72 w-72 rounded-full bg-[#00a9d1]/15 blur-3xl" />
          <div className="absolute right-0 top-28 h-80 w-80 rounded-full bg-[#ff8a00]/15 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <section className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-[0_10px_60px_-30px_rgba(0,169,209,0.45)] backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
                  My Profile
                </h1>
                <p className="mt-2 text-sm text-zinc-500">
                  Placeholder profile details for now. You can connect this to
                  editable settings later.
                </p>
              </div>
              <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-700">
                Status: {statusLabel}
              </span>
            </div>
          </section>

          <section className="mt-7 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-zinc-900">
                Basic Information
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-zinc-100 bg-zinc-50/60 p-4">
                  <p className="text-xs font-medium text-zinc-500">Full Name</p>
                  <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-zinc-900">
                    <User className="h-4 w-4 text-zinc-500" />
                    {fullName}
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-100 bg-zinc-50/60 p-4">
                  <p className="text-xs font-medium text-zinc-500">Email</p>
                  <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-zinc-900">
                    <Mail className="h-4 w-4 text-zinc-500" />
                    {email}
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-100 bg-zinc-50/60 p-4">
                  <p className="text-xs font-medium text-zinc-500">Role</p>
                  <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-zinc-900">
                    <Shield className="h-4 w-4 text-zinc-500" />
                    Learner
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-100 bg-zinc-50/60 p-4">
                  <p className="text-xs font-medium text-zinc-500">Location</p>
                  <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-zinc-900">
                    <MapPin className="h-4 w-4 text-zinc-500" />
                    {location}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[#00a9d1]/20 bg-white p-6 shadow-[0_10px_60px_-35px_rgba(0,169,209,0.6)]">
              <h2 className="text-lg font-semibold text-zinc-900">
                Learning Snapshot
              </h2>

              <div className="mt-5 space-y-3">
                <div className="rounded-xl border border-zinc-100 bg-white p-4">
                  <p className="text-xs font-medium text-zinc-500">
                    Courses enrolled
                  </p>
                  <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-zinc-900">
                    <BookOpen className="h-4 w-4 text-teal-600" />0 active
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-100 bg-white p-4">
                  <p className="text-xs font-medium text-zinc-500">
                    Next milestone
                  </p>
                  <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-zinc-900">
                    <CalendarClock className="h-4 w-4 text-orange-500" />
                    Complete first module
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-100 bg-white p-4">
                  <p className="text-xs font-medium text-zinc-500">
                    Notifications
                  </p>
                  <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-zinc-900">
                    <Bell className="h-4 w-4 text-zinc-500" />
                    Enabled
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">About Me</h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-600">
              Add a short personal bio here. This area can later include profile
              editing, interests, badges, and contribution highlights.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;
