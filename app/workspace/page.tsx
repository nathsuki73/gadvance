"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  CircleUserRound,
  BookOpen,
  Compass,
  Flame,
  HandHelping,
  MessageSquareHeart,
} from "lucide-react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

type WorkspaceLink = {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
};

const workspaceLinks: WorkspaceLink[] = [
  {
    title: "My Profile",
    description:
      "View your account details, placeholders, and personal learning snapshot.",
    href: "/workspace/profile",
    icon: CircleUserRound,
    accent: "from-sky-500 to-blue-500",
  },
  {
    title: "Explore Courses",
    description:
      "Browse active learning tracks and continue where you left off.",
    href: "/workspace/courses",
    icon: BookOpen,
    accent: "from-teal-500 to-cyan-500",
  },
  {
    title: "Community Hub",
    description: "Join discussion threads and connect with peer advocates.",
    href: "/workspace/community",
    icon: MessageSquareHeart,
    accent: "from-orange-500 to-amber-500",
  },
  {
    title: "Current Course",
    description:
      "Jump straight into your active module and keep your streak alive.",
    href: "/workspace/module",
    icon: Flame,
    accent: "from-rose-500 to-orange-500",
  },
  {
    title: "About the Program",
    description:
      "Understand mission, outcomes, and how this workspace is built.",
    href: "/workspace/about",
    icon: Compass,
    accent: "from-sky-500 to-teal-500",
  },
  {
    title: "Support Center",
    description: "Get guidance, FAQs, and direct help when you need it.",
    href: "/workspace/support",
    icon: HandHelping,
    accent: "from-emerald-500 to-teal-500",
  },
];

export default function WorkspacePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const displayName = (() => {
    const firstName = session?.user?.firstName?.trim();
    if (firstName) {
      return firstName;
    }

    const fullName = session?.user?.name?.trim();
    if (!fullName) {
      return "there";
    }

    const commaSeparatedName = fullName.split(",")[1]?.trim();
    if (commaSeparatedName) {
      return commaSeparatedName.replace(/\s+[A-Z]\.??$/, "").trim() || "there";
    }

    const nameParts = fullName.split(/\s+/).filter(Boolean);
    return nameParts.length > 1 ? nameParts[0] : "there";
  })();

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
      <Header />

      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#00a9d1]/15 blur-3xl" />
          <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-[#ff8a00]/15 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          {/* <section className="mb-4 rounded-3xl border border-zinc-200 bg-white/90 px-5 py-4 shadow-[0_10px_60px_-30px_rgba(0,169,209,0.45)] backdrop-blur">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              Welcome back, <span className="text-teal-500">{displayName}.</span>
            </h1>
          </section> */}
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            Welcome back, <span className="text-teal-500">{displayName}.</span>
          </h1>

          <section className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
                Workspace
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {workspaceLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    className="group rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-tr ${item.accent} text-white`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-zinc-900">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                      {item.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
