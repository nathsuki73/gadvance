"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import {
  Brain,
  HeartHandshake,
  Smile,
  ShieldAlert,
  ArrowUpRight,
  Sparkles,
  PhoneCall,
  Activity,
  MapPin,
  ExternalLink,
  LifeBuoy,
  MessageCircle,
  Mail,
  Globe,
} from "lucide-react";
import ProtectedButton from "@/app/components/ProtectedButton";

export default function MentalHealthPage() {
  const scrollRef = useRef<HTMLDivElement>(null);

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

    const children = scrollRef.current?.querySelectorAll(".scroll-anim");
    children?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={scrollRef} className="bg-white overflow-hidden text-zinc-900">
      {/* ================= HERO WITH INTEGRATED VIDEO ================= */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-white via-violet-50/60 to-white pt-24 pb-20">
        <div className="mx-auto max-w-7xl px-8 lg:px-12 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Content Left */}
            <div className="lg:col-span-6 text-left space-y-6">
              <h1 className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-100 ease-out text-4xl font-light leading-[1.1] tracking-tight text-zinc-900 sm:text-6xl">
                Kumusta ka? <br />
                <span className="font-semibold text-[#8b5cf6]">
                  Your mind matters.
                </span>{" "}
                <br />
                <span className="font-serif italic text-zinc-800">
                  Nurture your well-being.
                </span>
              </h1>

              <p className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-200 ease-out max-w-xl text-lg font-light leading-relaxed text-zinc-600">
                Mental health encompasses emotional, psychological, and social
                well-being. GADvance connects you to safe learning tools,
                community campaigns, and immediate national crisis support.
              </p>

              <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-300 ease-out flex flex-col sm:flex-row items-center gap-4 pt-4">
                <ProtectedButton
                  onClick={() => {
                    window.location.href = "/workspace";
                  }}
                  className="w-full sm:w-auto rounded-full bg-[#8b5cf6] px-8 py-4 text-base font-medium text-white transition-all hover:bg-[#7c3aed] hover:shadow-lg hover:shadow-violet-200 active:scale-95 flex items-center justify-center gap-2"
                  redirectUrl="/workspace"
                >
                  <span>Explore Well-being Modules</span>
                  <ArrowUpRight size={18} />
                </ProtectedButton>

                <a
                  href="#hotlines"
                  className="w-full sm:w-auto rounded-full border border-violet-200 bg-violet-50/50 px-8 py-4 text-center text-base font-medium text-[#8b5cf6] transition-all hover:bg-violet-100 active:scale-95"
                >
                  24/7 Emergency Hotlines
                </a>
              </div>
            </div>

            {/* Hero Right: Integrated Video Player Card */}
            <div className="lg:col-span-6 scroll-anim opacity-0 translate-y-10 transition-all duration-[1200ms] delay-400 ease-out">
              <div className="relative rounded-3xl bg-white p-3 border border-violet-100 shadow-2xl shadow-violet-500/10">
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-zinc-900">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/ExEXOfe81Nc?si=6UiG3VHlDS-NRxmq&controls=1"
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
                <div className="p-4 flex items-center justify-between text-xs text-zinc-500">
                  <span className="font-medium text-zinc-700 flex items-center gap-1.5">
                    <Activity size={14} className="text-[#8b5cf6]" /> DOH Mental
                    Health Awareness
                  </span>
                  <span>Healthy Pilipinas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= EMERGENCY HOTLINES SECTION ================= */}
      <section
        id="hotlines"
        className="py-20 bg-gradient-to-b from-white via-violet-50/30 to-zinc-50 border-y border-zinc-100"
      >
        <div className="mx-auto max-w-7xl px-8 lg:px-12">
          <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out max-w-3xl mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#8b5cf6] mb-3">
              <LifeBuoy size={16} /> Immediate Support
            </div>
            <h2 className="text-3xl font-light leading-tight tracking-tight text-zinc-900 sm:text-5xl">
              National Crisis Hotlines <br />
              <span className="font-serif italic font-semibold text-[#8b5cf6]">
                Ready & Available 24/7
              </span>
            </h2>
            <p className="mt-4 text-base font-light text-zinc-500">
              For individuals in crisis, experiencing mental health struggles,
              or at risk of suicide. Operated by the National Center for Mental
              Health (NCMH).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Hotline Card 1 */}
            <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 delay-100 ease-out bg-white p-8 rounded-3xl border border-violet-100 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Mobile Hotline
                </span>
                <p className="mt-2 text-2xl font-bold text-[#8b5cf6] font-mono">
                  0917-899-8727
                </p>
                <p className="mt-3 text-xs text-zinc-500 font-light leading-relaxed">
                  24/7 dedicated mobile hotline for mental health crises and
                  crisis intervention across the Philippines.
                </p>
              </div>
              <a
                href="tel:09178998727"
                className="mt-6 inline-flex items-center justify-center gap-2 w-full rounded-xl bg-violet-50 py-3 text-sm font-medium text-[#8b5cf6] hover:bg-violet-100 transition-colors"
              >
                <PhoneCall size={16} /> Call Mobile Hotline
              </a>
            </div>

            {/* Hotline Card 2 */}
            <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 delay-200 ease-out bg-white p-8 rounded-3xl border border-violet-100 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Toll-Free Hotline
                </span>
                <p className="mt-2 text-2xl font-bold text-[#8b5cf6] font-mono">
                  (02) 1553
                </p>
                <p className="mt-3 text-xs text-zinc-500 font-light leading-relaxed">
                  Luzon-wide landlines are toll-free. Free service (standard
                  charges may apply for incoming mobile calls).
                </p>
              </div>
              <a
                href="tel:1553"
                className="mt-6 inline-flex items-center justify-center gap-2 w-full rounded-xl bg-violet-50 py-3 text-sm font-medium text-[#8b5cf6] hover:bg-violet-100 transition-colors"
              >
                <PhoneCall size={16} /> Call Hotline 1553
              </a>
            </div>

            {/* Hotline Card 3 */}
            <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 delay-300 ease-out bg-white p-8 rounded-3xl border border-violet-100 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Direct Landline
                </span>
                <p className="mt-2 text-2xl font-bold text-[#8b5cf6] font-mono">
                  (02) 7-989-8727
                </p>
                <p className="mt-3 text-xs text-zinc-500 font-light leading-relaxed">
                  Direct landline line provided by NCMH for psychological first
                  aid and referral services.
                </p>
              </div>
              <a
                href="tel:0279898727"
                className="mt-6 inline-flex items-center justify-center gap-2 w-full rounded-xl bg-violet-50 py-3 text-sm font-medium text-[#8b5cf6] hover:bg-violet-100 transition-colors"
              >
                <PhoneCall size={16} /> Call Direct Landline
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ================= COMMUNITY CAMPAIGNS SECTION (#MentalHealthPH) ================= */}
      <section className="py-28 bg-white">
        <div className="mx-auto max-w-7xl px-8 lg:px-12">
          <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out max-w-3xl">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#8b5cf6]">
              Advocacy & Campaigns
            </h2>
            <h3 className="mt-4 text-3xl font-light leading-tight tracking-tight text-zinc-900 sm:text-5xl">
              Ending stigma through <br />
              <span className="font-serif italic font-semibold text-[#8b5cf6]">
                community dialogue.
              </span>
            </h3>
            <p className="mt-6 text-lg font-light leading-relaxed text-zinc-500">
              In partnership with nationwide mental health awareness initiatives
              like <strong className="text-zinc-700">#MentalHealthPH</strong>,
              we champion open conversations and active support across social
              channels.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                tag: "#UsapTayo",
                title: "Regular Online Conversations",
                desc: "Bi-monthly Twitter/X chat sessions raising awareness on self-care, empathy, and workplace mental health.",
              },
              {
                tag: "#VoicesOfHope",
                title: "Lived Experience Stories",
                desc: "Amplifying personal journeys of recovery to inspire others and dismantle societal stigma.",
              },
              {
                tag: "#40SecondsOfHope",
                title: "Suicide Prevention Drive",
                desc: "Global awareness initiative encouraging individuals to take 40 seconds to reach out to a friend in need.",
              },
              {
                tag: "#MHTalks",
                title: "Expert Learning Panels",
                desc: "Educational webinars featuring mental health professionals, advocates, and policy leaders.",
              },
            ].map((campaign, idx) => (
              <div
                key={idx}
                className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out bg-zinc-50/70 p-6 rounded-2xl border border-zinc-100 hover:border-violet-200 transition-all"
              >
                <span className="inline-block px-3 py-1 rounded-md bg-violet-100 text-[#8b5cf6] text-xs font-bold font-mono">
                  {campaign.tag}
                </span>
                <h4 className="mt-4 text-lg font-medium text-zinc-900">
                  {campaign.title}
                </h4>
                <p className="mt-2 text-xs font-light leading-relaxed text-zinc-500">
                  {campaign.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= LOCAL DIRECTORY SPOTLIGHT (San Pablo City Medical Center) ================= */}
      <section className="py-24 bg-zinc-50 border-t border-zinc-100">
        <div className="mx-auto max-w-7xl px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#8b5cf6]">
                Validated Resource Directory
              </h2>
              <h3 className="mt-4 text-3xl font-light leading-tight tracking-tight text-zinc-900 sm:text-4xl">
                Grassroots & Regional <br />
                <span className="font-serif italic font-semibold text-[#8b5cf6]">
                  Healthcare Facilities
                </span>
              </h3>
              <p className="mt-6 text-sm font-light leading-relaxed text-zinc-500">
                Access verified mental health services from hospitals,
                specialized centers, and medical institutions across Region IV-A
                and the Philippines.
              </p>
            </div>

            {/* Directory Feature Card */}
            <div className="lg:col-span-7 scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-200 ease-out">
              <div className="bg-white p-8 rounded-3xl border border-zinc-200/80 shadow-sm">
                <div className="flex flex-wrap items-center justify-between border-b border-zinc-100 pb-4 gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#8b5cf6] bg-violet-50 px-2.5 py-1 rounded-full">
                      Private Hospital
                    </span>
                    <h4 className="mt-2 text-xl font-semibold text-zinc-900">
                      San Pablo City Medical Center
                    </h4>
                  </div>
                  <span className="text-xs font-medium bg-violet-50 text-[#8b5cf6] px-3 py-1 rounded-full border border-violet-100">
                    Hybrid Delivery
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-zinc-600">
                  <div>
                    <span className="font-semibold text-zinc-800 block mb-1">
                      Services Offered:
                    </span>
                    <p className="font-light text-zinc-500">
                      Consultation, Counseling / Therapy
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-zinc-800 block mb-1">
                      Mode of Payment:
                    </span>
                    <p className="font-light text-zinc-500">Out of pocket</p>
                  </div>
                  <div>
                    <span className="font-semibold text-zinc-800 block mb-1">
                      MHPSS Support Level:
                    </span>
                    <p className="font-light text-zinc-500">
                      Level 4 – Specialised Mental Health Care
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-zinc-800 block mb-1">
                      Location:
                    </span>
                    <p className="font-light text-zinc-500 flex items-start gap-1">
                      <MapPin
                        size={14}
                        className="text-[#8b5cf6] shrink-0 mt-0.5"
                      />
                      <span>
                        AH 26, Maharlika Highway, San Pablo City, Laguna, Region
                        IV-A
                      </span>
                    </p>
                  </div>
                </div>

                {/* Contact Sub-block */}
                <div className="mt-6 pt-4 border-t border-zinc-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <a
                    href="tel:0495620726"
                    className="flex items-center gap-2 text-zinc-600 hover:text-[#8b5cf6] transition-colors"
                  >
                    <PhoneCall size={14} className="text-[#8b5cf6]" />
                    <span>049-562-0726</span>
                  </a>
                  <a
                    href="mailto:inquiry@spcmc.com.ph"
                    className="flex items-center gap-2 text-zinc-600 hover:text-[#8b5cf6] transition-colors truncate"
                  >
                    <Mail size={14} className="text-[#8b5cf6] shrink-0" />
                    <span className="truncate">inquiry@spcmc.com.ph</span>
                  </a>
                  <a
                    href="https://www.spcmc.com.ph/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-zinc-600 hover:text-[#8b5cf6] transition-colors"
                  >
                    <Globe size={14} className="text-[#8b5cf6]" />
                    <span>spcmc.com.ph</span>
                  </a>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400">
                  <p>
                    Source Attribution: #MentalHealthPH Directory & Partner
                    Agencies
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-violet-50 to-white py-32 text-center">
        <div className="mx-auto max-w-4xl px-8 relative z-10">
          <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out">
            <h2 className="text-sm font-bold uppercase tracking-[0.4em] text-[#8b5cf6]">
              Prioritize Your Well-Being
            </h2>
            <h3 className="mt-6 text-4xl font-light leading-tight tracking-tight text-zinc-900 sm:text-6xl">
              Start building a healthier <br />
              <span className="font-serif italic font-semibold text-[#8b5cf6]">
                relationship with your mind.
              </span>
            </h3>
            <p className="mt-8 text-xl font-light text-zinc-600 max-w-2xl mx-auto">
              Access GADvance&apos;s wellness workspace and interactive
              self-care guides today.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <ProtectedButton
                onClick={() => {
                  window.location.href = "/workspace";
                }}
                className="w-full sm:w-auto rounded-full bg-[#8b5cf6] px-10 py-5 text-lg font-medium text-white transition-all hover:bg-[#7c3aed] hover:shadow-xl hover:shadow-violet-200 active:scale-95"
                redirectUrl="/workspace"
              >
                Go to Workspace
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
