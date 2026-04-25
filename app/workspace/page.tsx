"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  BookOpen,
  Compass,
  Flame,
  HandHelping,
  MessageSquareHeart,
  Sparkles,
} from "lucide-react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

type WorkspaceLink = {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  accent: string;
};

const workspaceLinks: WorkspaceLink[] = [
  {
    title: "Explore Courses",
    description:
      "Browse active learning tracks and continue where you left off.",
    href: "/workspace/courses",
    icon: BookOpen,
    badge: "Learning",
    accent: "from-teal-500 to-cyan-500",
  },
  {
    title: "Community Hub",
    description: "Join discussion threads and connect with peer advocates.",
    href: "/workspace/community",
    icon: MessageSquareHeart,
    badge: "Network",
    accent: "from-orange-500 to-amber-500",
  },
  {
    title: "Current Module",
    description:
      "Jump straight into your active module and keep your streak alive.",
    href: "/workspace/module",
    icon: Flame,
    badge: "In Progress",
    accent: "from-rose-500 to-orange-500",
  },
  {
    title: "About the Program",
    description:
      "Understand mission, outcomes, and how this workspace is built.",
    href: "/workspace/about",
    icon: Compass,
    badge: "Overview",
    accent: "from-sky-500 to-teal-500",
  },
  {
    title: "Support Center",
    description: "Get guidance, FAQs, and direct help when you need it.",
    href: "/workspace/support",
    icon: HandHelping,
    badge: "Help",
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
  const statusLabel = session?.user?.status ?? "Active";

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

        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <section className="mb-6 rounded-3xl border border-zinc-200 bg-white/90 px-5 py-4 shadow-[0_10px_60px_-30px_rgba(0,169,209,0.45)] backdrop-blur">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              Welcome back, <span className="text-teal-500">{displayName}</span>
              !
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Status:{" "}
              <span className="font-medium text-zinc-700">{statusLabel}</span>
            </p>
          </section>

          <section className="grid gap-6 rounded-3xl border border-[#00a9d1]/20 bg-white/90 p-7 shadow-[0_10px_60px_-30px_rgba(0,169,209,0.6)] backdrop-blur md:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#00a9d1]/10 px-3 py-1 text-xs font-semibold tracking-wider text-[#007a97] uppercase">
                <Sparkles className="h-3.5 w-3.5" />
                Your Learning Command Center
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
                Build confidence through action, not just content.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-600 sm:text-lg">
                This workspace brings your courses, community, and support tools
                together so every session moves you one step closer to real
                impact.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => router.push("/workspace/courses")}
                  className="rounded-xl bg-[#00a9d1] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#00a9d1]/25 transition hover:bg-[#0089a8]"
                >
                  Continue Learning
                </button>
                <button
                  onClick={() => router.push("/workspace/community")}
                  className="rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
                >
                  Open Community
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-100 bg-linear-to-br from-zinc-50 to-white p-5">
              <h2 className="text-sm font-semibold tracking-wide text-zinc-500 uppercase">
                Today at a Glance
              </h2>
              <div className="mt-4 space-y-3">
                <div className="rounded-xl border border-zinc-100 bg-white p-4">
                  <p className="text-xs font-medium text-zinc-500">
                    Current focus
                  </p>
                  <p className="mt-1 text-sm font-semibold text-zinc-900">
                    Workplace Rights & Advocacy
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-100 bg-white p-4">
                  <p className="text-xs font-medium text-zinc-500">
                    Weekly target
                  </p>
                  <p className="mt-1 text-sm font-semibold text-zinc-900">
                    Complete 2 lessons and 1 quiz
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-100 bg-white p-4">
                  <p className="text-xs font-medium text-zinc-500">
                    Support status
                  </p>
                  <p className="mt-1 text-sm font-semibold text-zinc-900">
                    No pending requests
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
                Workspace Shortcuts
              </h2>
              <p className="text-sm text-zinc-500">
                Fast access to your main areas
              </p>
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
                      <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                        {item.badge}
                      </span>
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
