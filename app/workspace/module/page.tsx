"use client";

import React, { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const ModulePage = () => {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const userStatus = session?.user?.status;
  const normalizedStatus = userStatus?.trim().toLowerCase();
  const isOnboarding = normalizedStatus === "onboarding";

  useEffect(() => {
    // 1. If not logged in, go to sign in
    if (authStatus === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    // 2. Authenticated users who have not completed onboarding should finish it first.
    if (authStatus === "authenticated" && isOnboarding) {
      console.log("User is in onboarding state, redirecting...");
      router.push("/onboarding");
    }
  }, [authStatus, isOnboarding, router]);

  // 3. Do not render while session state is still loading.
  if (authStatus === "loading") {
    return null;
  }

  // Prevent rendering the UI if we are about to redirect
  if (
    authStatus === "unauthenticated" ||
    (authStatus === "authenticated" && isOnboarding)
  ) {
    return null;
  }

  const displayName =
    [
      session?.user?.firstName,
      session?.user?.middleName,
      session?.user?.lastName,
    ]
      .filter(Boolean)
      .join(" ") || "Student";

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-zinc-100 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-orange-400 to-teal-400 rounded-full flex items-center justify-center">
            <span className="text-white text-[10px] font-black">G</span>
          </div>
          <span className="font-bold text-gray-800 tracking-tight">
            Gadvance
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            {/* DISPLAY FULL NAME HERE */}
            <p className="text-xs font-bold text-gray-900">{displayName}</p>
            <p className="text-[10px] text-teal-600 font-bold uppercase tracking-widest">
              {session?.user?.email}
            </p>
          </div>
          <button
            onClick={() => signOut()}
            className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors"
          >
            Log Out
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-8">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back,{" "}
            <span className="text-teal-500">{displayName.split(" ")[0]}</span>!
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Status:{" "}
            <span className="font-semibold text-zinc-700 capitalize">
              {session?.user?.status}
            </span>
          </p>
        </header>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              id: 1,
              title: "Introduction to AI",
              desc: "The basics of intelligent agents.",
            },
            {
              id: 2,
              title: "Machine Learning Foundations",
              desc: "Linear regression and beyond.",
            },
            {
              id: 3,
              title: "Neural Networks",
              desc: "Building the brain of the machine.",
            },
          ].map((item) => (
            <div
              key={item.id}
              className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-teal-50 rounded-2xl mb-4 flex items-center justify-center text-teal-600 font-bold group-hover:bg-teal-500 group-hover:text-white transition-colors">
                0{item.id}
              </div>
              <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-6">
                {item.desc}
              </p>
              <button className="w-full py-3 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-teal-600 transition-colors">
                Start Module
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ModulePage;
