"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Search,
  FileText,
  Download,
  ArrowUpRight,
  Sparkles,
  BookOpen,
  Calendar,
  Clock,
  X,
  RotateCcw,
} from "lucide-react";
import ProtectedButton from "@/app/components/ProtectedButton";

interface Article {
  id: string;
  category:
    | "Policy & Compliance"
    | "Institutional GAD"
    | "Leadership"
    | "Mental Health";
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  isFeatured?: boolean;
}

const ARTICLES: Article[] = [
  {
    id: "pcw-30-years-ppgd",
    category: "Policy & Compliance",
    title:
      "Philippine Commission on Women Reviews 30 Years of Gender Progress for 2026 Strategy",
    excerpt:
      "A national consultation workshop maps out the sequel to the Philippine Plan for Gender-Responsive Development (PPGD), setting strategic GAD priorities for national and local agencies.",
    date: "October 2025",
    readTime: "5 min read",
    isFeatured: true,
  },
  {
    id: "gad-planning-budgeting-2026",
    category: "Institutional GAD",
    title:
      "FY 2026 GAD Planning and Budgeting Guidelines Released for Government Agencies",
    excerpt:
      "Key directives emphasize intersectional approaches, gender-responsive budgeting compliance under RA 9710, and safeguards against fund misallocation.",
    date: "July 2025",
    readTime: "4 min read",
  },
  {
    id: "lead-like-babaylans",
    category: "Leadership",
    title:
      "Lead Like the Babaylans: Reclaiming Pre-Colonial Female Leadership in Public Service",
    excerpt:
      "How traditional values of empathy, mediation, and community care are shaping modern executive leadership models across Philippine institutions.",
    date: "March 2026",
    readTime: "6 min read",
  },
  {
    id: "safe-spaces-act-orientation",
    category: "Policy & Compliance",
    title:
      "Strengthening Institutional Protocols Against Gender-Based Sexual Harassment",
    excerpt:
      "A breakdown of workplace requirements under Republic Act 11313 (Safe Spaces Act) and establishing functional Committee on Decency and Investigation (CODI) bodies.",
    date: "November 2025",
    readTime: "4 min read",
  },
  {
    id: "mental-health-workplace-resilience",
    category: "Mental Health",
    title:
      "Fostering Psychological Safety and Bio-Psycho-Socio-Spiritual Well-being at Work",
    excerpt:
      "Practical frameworks for HR officers and team leads to mitigate burnout, support peer mental health, and implement crisis response mechanisms.",
    date: "March 2026",
    readTime: "5 min read",
  },
];

const DOWNLOADABLE_RESOURCES = [
  {
    title: "GAD Planning & Budgeting Template",
    type: "DOCX Form",
    size: "1.2 MB",
    desc: "Standard template for preparing Annual GAD Plans, Accomplishment Reports, and HGDG assessment scores.",
  },
  {
    title: "Magna Carta of Women (RA 9710) Summary Brief",
    type: "PDF Document",
    size: "850 KB",
    desc: "Executive summary of key mandates, institutional mechanisms, and rights guaranteed under RA 9710.",
  },
  {
    title: "Safe Spaces Act (RA 11313) Workplace Kit",
    type: "PDF Guidelines",
    size: "2.1 MB",
    desc: "Step-by-step toolkit for drafting CODI policies, reporting mechanisms, and employee orientation materials.",
  },
];

export default function ResourcesPage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = [
    "All",
    "Policy & Compliance",
    "Institutional GAD",
    "Leadership",
    "Mental Health",
  ];

  // Robust Filter Logic
  const filteredArticles = ARTICLES.filter((article) => {
    const matchesCategory =
      selectedCategory === "All" || article.category === selectedCategory;

    const cleanQuery = searchQuery.trim().toLowerCase();
    const matchesSearch =
      cleanQuery === "" ||
      article.title.toLowerCase().includes(cleanQuery) ||
      article.excerpt.toLowerCase().includes(cleanQuery) ||
      article.category.toLowerCase().includes(cleanQuery);

    return matchesCategory && matchesSearch;
  });

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries, observerInstance) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove(
              "opacity-0",
              "translate-y-10",
              "scale-[0.98]",
              "-translate-x-10",
              "translate-x-10",
            );
            entry.target.classList.add(
              "opacity-100",
              "translate-y-0",
              "scale-100",
              "translate-x-0",
            );
            observerInstance.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );

    // Wait a tick so newly-rendered .scroll-anim nodes (e.g. after
    // filtering/searching) exist in the DOM before we query for them.
    const frame = requestAnimationFrame(() => {
      const children = scrollRef.current?.querySelectorAll(".scroll-anim");
      children?.forEach((el) => observer.observe(el));
    });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [filteredArticles]); // ← re-run whenever the visible article set changes

  const resetFilters = () => {
    setSelectedCategory("All");
    setSearchQuery("");
  };

  const featuredArticle = ARTICLES.find((a) => a.isFeatured) || ARTICLES[0];
  const isFiltered = selectedCategory !== "All" || searchQuery.trim() !== "";

  return (
    <div ref={scrollRef} className="bg-white overflow-hidden text-zinc-900">
      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-white via-violet-50/60 to-white pt-28 pb-16">
        <div className="mx-auto max-w-7xl px-8 lg:px-12 w-full text-center">
          <h1 className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-100 ease-out text-4xl font-light leading-[1.1] tracking-tight text-zinc-900 sm:text-6xl max-w-4xl mx-auto">
            Resources,{" "}
            <span className="font-semibold text-[#8b5cf6]">Articles</span> &{" "}
            <br />
            <span className="font-serif italic text-zinc-800">
              Policy News.
            </span>
          </h1>

          <p className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-200 ease-out max-w-2xl mx-auto mt-6 text-lg font-light leading-relaxed text-zinc-600">
            Stay updated with the latest Philippine Gender and Development (GAD)
            mandates, leadership insights, institutional tools, and research
            briefs.
          </p>

          {/* Search Bar with Clear Icon */}
          <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-300 ease-out max-w-2xl mx-auto mt-10 relative">
            <div className="relative flex items-center">
              <Search size={20} className="absolute left-5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search articles, policies, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-12 py-4 rounded-full border border-zinc-200 bg-white/90 shadow-lg shadow-violet-500/5 focus:outline-none focus:border-[#8b5cf6] text-sm text-zinc-800 placeholder-zinc-400 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 p-1 text-zinc-400 hover:text-zinc-600 transition-colors"
                  aria-label="Clear search"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURED ARTICLE SPOTLIGHT ================= */}
      <section className="py-12 bg-zinc-50/50 border-y border-zinc-100">
        <div className="mx-auto max-w-7xl px-8 lg:px-12">
          <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-[#8b5cf6]">
              Featured Announcement
            </span>
          </div>

          <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-100 ease-out bg-white p-8 sm:p-12 rounded-3xl border border-violet-100 shadow-xl shadow-violet-500/5 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-violet-100 text-[#8b5cf6] text-xs font-semibold">
                  {featuredArticle.category}
                </span>
                <span className="text-xs text-zinc-400 flex items-center gap-1">
                  <Calendar size={12} /> {featuredArticle.date}
                </span>
                <span className="text-xs text-zinc-400 flex items-center gap-1">
                  <Clock size={12} /> {featuredArticle.readTime}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-light text-zinc-900 leading-snug">
                {featuredArticle.title}
              </h2>

              <p className="text-sm font-light text-zinc-600 leading-relaxed max-w-3xl">
                {featuredArticle.excerpt}
              </p>
            </div>

            <div className="lg:col-span-4 flex lg:justify-end">
              <ProtectedButton
                onClick={() => {
                  window.location.href = "/workspace";
                }}
                className="w-full sm:w-auto rounded-full bg-[#8b5cf6] px-8 py-4 text-sm font-medium text-white hover:bg-[#7c3aed] transition-all flex items-center justify-center gap-2"
                redirectUrl="/workspace"
              >
                <span>Read Full Analysis</span>
                <ArrowUpRight size={16} />
              </ProtectedButton>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ARTICLES FEED & FILTER ================= */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-8 lg:px-12">
          {/* Category Tabs & Active Indicator */}
          <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12 border-b border-zinc-100 pb-6">
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 rounded-full text-xs font-medium transition-all ${
                    selectedCategory === cat
                      ? "bg-[#8b5cf6] text-white shadow-sm"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Reset Filter Button if active */}
            {isFiltered && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 text-xs text-[#8b5cf6] hover:text-[#7c3aed] font-medium transition-colors"
              >
                <RotateCcw size={14} />
                <span>Reset filters</span>
              </button>
            )}
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.length > 0 ? (
              filteredArticles.map((article) => (
                <article
                  key={article.id}
                  className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out bg-zinc-50/60 p-8 rounded-3xl border border-zinc-100 hover:border-violet-200 hover:bg-white hover:shadow-lg hover:shadow-violet-500/5 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span className="font-semibold text-[#8b5cf6] bg-violet-50 px-2.5 py-1 rounded-md">
                        {article.category}
                      </span>
                      <span>{article.date}</span>
                    </div>

                    <h3 className="text-xl font-medium text-zinc-900 leading-tight">
                      {article.title}
                    </h3>

                    <p className="text-xs font-light text-zinc-500 leading-relaxed line-clamp-3">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-zinc-200/60 flex items-center justify-between">
                    <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                      <Clock size={12} /> {article.readTime}
                    </span>
                    <ProtectedButton
                      onClick={() => {
                        window.location.href = "/workspace";
                      }}
                      className="text-xs font-medium text-[#8b5cf6] hover:text-[#7c3aed] flex items-center gap-1"
                      redirectUrl="/workspace"
                    >
                      <span>Read Article</span>
                      <ArrowUpRight size={14} />
                    </ProtectedButton>
                  </div>
                </article>
              ))
            ) : (
              /* No Results State with One-Click Reset */
              <div className="col-span-full py-20 text-center bg-zinc-50/50 rounded-3xl border border-dashed border-zinc-200">
                <BookOpen size={40} className="mx-auto mb-3 text-violet-300" />
                <h4 className="text-lg font-medium text-zinc-800">
                  No matching articles found
                </h4>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  We couldn&apos;t find anything matching &quot;
                  {searchQuery || selectedCategory}&quot;. Try adjusting your
                  keywords or category.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#8b5cf6] px-6 py-2.5 text-xs font-medium text-white hover:bg-[#7c3aed] transition-all"
                >
                  <RotateCcw size={14} />
                  <span>Show all articles</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================= DOWNLOADABLE POLICY TOOLKITS ================= */}
      <section className="py-24 bg-zinc-50 border-t border-zinc-100">
        <div className="mx-auto max-w-7xl px-8 lg:px-12">
          <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out max-w-3xl mb-16">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#8b5cf6]">
              Downloadable Resources
            </h2>
            <h3 className="mt-4 text-3xl font-light leading-tight tracking-tight text-zinc-900 sm:text-4xl">
              Practical Toolkits & <br />
              <span className="font-serif italic font-semibold text-[#8b5cf6]">
                Institutional Templates
              </span>
            </h3>
            <p className="mt-4 text-base font-light text-zinc-500">
              Access standardized policy templates, guidelines, and toolkits
              curated for GAD Focal Point Systems (GFPS) and organizational
              administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DOWNLOADABLE_RESOURCES.map((res, idx) => (
              <div
                key={idx}
                className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out bg-white p-8 rounded-3xl border border-zinc-200/80 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="h-12 w-12 rounded-2xl bg-violet-50 text-[#8b5cf6] flex items-center justify-center mb-6">
                    <FileText size={24} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    {res.type} • {res.size}
                  </span>
                  <h4 className="mt-2 text-lg font-medium text-zinc-900 leading-snug">
                    {res.title}
                  </h4>
                  <p className="mt-3 text-xs font-light text-zinc-500 leading-relaxed">
                    {res.desc}
                  </p>
                </div>

                <ProtectedButton
                  onClick={() => {
                    window.location.href = "/workspace";
                  }}
                  className="mt-8 w-full rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-violet-50 hover:border-violet-200 py-3 text-xs font-medium text-zinc-700 hover:text-[#8b5cf6] transition-all flex items-center justify-center gap-2"
                  redirectUrl="/workspace"
                >
                  <Download size={14} />
                  <span>Download Toolkit</span>
                </ProtectedButton>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-violet-50 to-white py-32 text-center">
        <div className="mx-auto max-w-4xl px-8 relative z-10">
          <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out">
            <h2 className="text-sm font-bold uppercase tracking-[0.4em] text-[#8b5cf6]">
              Stay Informed
            </h2>
            <h3 className="mt-6 text-4xl font-light leading-tight tracking-tight text-zinc-900 sm:text-6xl">
              Turn knowledge into <br />
              <span className="font-serif italic font-semibold text-[#8b5cf6]">
                institutional progress.
              </span>
            </h3>
            <p className="mt-8 text-xl font-light text-zinc-600 max-w-2xl mx-auto">
              Enroll in GADvance workspace modules to receive policy updates,
              training certifications, and institutional support.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <ProtectedButton
                onClick={() => {
                  window.location.href = "/workspace";
                }}
                className="w-full sm:w-auto rounded-full bg-[#8b5cf6] px-10 py-5 text-lg font-medium text-white transition-all hover:bg-[#7c3aed] hover:shadow-xl hover:shadow-violet-200 active:scale-95"
                redirectUrl="/workspace"
              >
                Access Learning Workspace
              </ProtectedButton>

              <Link
                href="/"
                className="w-full sm:w-auto rounded-full border border-zinc-200 bg-white px-10 py-5 text-lg font-medium text-zinc-600 transition-all hover:bg-zinc-50 active:scale-95"
              >
                Back to Overview
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
