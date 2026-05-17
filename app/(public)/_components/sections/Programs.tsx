"use client";

import React from "react";
import Image from "next/image";
import {
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import ProtectedButton from "../../../components/ProtectedButton";

import img1 from "@/app/(public)/assets/hero_image.png";

const LandingPage = () => {
  return (
    <main className="bg-white text-zinc-900 overflow-hidden">
      {/* PROBLEM SECTION */}
      <Section>
        <SectionHeader
          badge="The Challenge"
          title="The Gender Gap in Leadership Still Exists."
          description="Despite progress across industries, many women and marginalized genders continue to face barriers in leadership, workplace inclusion, and career advancement."
        />

        <div className="mt-14 grid md:grid-cols-2 gap-6">
          <InfoCard
            icon={<ShieldCheck className="text-[#00aeef]" size={22} />}
            title="Unequal Opportunities"
            desc="Systemic barriers still limit access to leadership roles, mentorship, and equitable workplace advancement."
          />

          <InfoCard
            icon={<Sparkles className="text-[#00aeef]" size={22} />}
            title="Workplace Culture Challenges"
            desc="Organizations struggle to create environments where inclusion, representation, and belonging are fully embedded."
          />
        </div>

        <div className="mt-8 rounded-2xl border border-zinc-100 bg-zinc-50 p-6 text-zinc-600 leading-7">
          The impact goes beyond representation — it affects innovation,
          employee wellbeing, retention, and long-term organizational growth.
        </div>
      </Section>

      {/* TRANSFORMATION */}
      <Section>
        <SectionHeader
          badge="The Vision"
          title="Building Inclusive and Equitable Workplaces."
          description="GADVance helps organizations and individuals move from awareness to action through practical education, leadership development, and workplace transformation."
        />

        <div className="mt-14 grid md:grid-cols-2 gap-6">
          <FeatureCard
            title="For Organizations"
            desc="Develop healthier workplace cultures, stronger collaboration, and more inclusive leadership systems."
          />

          <FeatureCard
            title="For Individuals"
            desc="Build confidence, leadership readiness, and the skills needed to thrive in professional environments."
          />
        </div>
      </Section>

      {/* WHY IT MATTERS */}
      <Section>
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div className="relative overflow-hidden rounded-3xl border border-zinc-100 shadow-xl">
            <Image
              src={img1}
              alt="Inclusive workplace"
              className="w-full object-cover"
            />
          </div>

          <div>
            <div className="inline-flex rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-[#00aeef]">
              Why It Matters
            </div>

            <h2 className="mt-5 text-4xl font-bold tracking-tight">
              Equity creates stronger organizations.
            </h2>

            <p className="mt-6 text-zinc-600 leading-8">
              Inclusive workplaces foster innovation, improve employee
              satisfaction, and create sustainable long-term growth for both
              organizations and communities.
            </p>

            <div className="mt-8 space-y-4">
              <Benefit text="Encourages inclusive leadership and collaboration" />
              <Benefit text="Creates safer and healthier workplace cultures" />
              <Benefit text="Supports growth, confidence, and representation" />
            </div>
          </div>
        </div>
      </Section>

      {/* FREE GUIDE */}
      <Section>
        <div className="rounded-3xl border border-zinc-100 bg-gradient-to-br from-sky-50 to-white p-10 md:p-14">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-medium text-[#00aeef] shadow-sm">
              Free Resource
            </div>

            <h2 className="mt-5 text-4xl font-bold tracking-tight">
              Start Creating Change Today.
            </h2>

            <p className="mt-6 text-lg leading-8 text-zinc-600">
              Download the “Gender Equity Checklist for Modern Workplaces” and
              discover actionable steps to improve inclusion, leadership, and
              workplace culture.
            </p>

            <div className="mt-10">
              <ProtectedButton
                onClick={() => (window.location.href = "/workspace")}
                redirectUrl="/workspace"
                className="rounded-xl bg-[#00aeef] px-8 py-3 font-medium text-white shadow-lg shadow-sky-100 transition hover:bg-[#0096cf]"
              >
                Download Free Guide
              </ProtectedButton>
            </div>
          </div>
        </div>
      </Section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden border-t border-zinc-100">
        <div className="mx-auto max-w-5xl px-6 py-24 text-center">
          <div className="inline-flex rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-[#00aeef]">
            Join the Movement
          </div>

          <h2 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight">
            Empower Inclusive Leadership.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-600">
            Explore resources, programs, and tools designed to support gender
            equity, leadership growth, and inclusive workplace transformation.
          </p>

          <div className="mt-10">
            <ProtectedButton
              onClick={() => (window.location.href = "/workspace")}
              redirectUrl="/workspace"
              className="rounded-xl bg-black px-8 py-3 font-medium text-white transition hover:bg-zinc-800"
            >
              Explore Platform
            </ProtectedButton>
          </div>
        </div>
      </section>
    </main>
  );
};

export default LandingPage;

/* ---------------------- */
/* Reusable Components    */
/* ---------------------- */

const Section = ({ children }: { children: React.ReactNode }) => (
  <section className="mx-auto max-w-7xl px-6 py-24">
    {children}
  </section>
);

const SectionHeader = ({
  badge,
  title,
  description,
}: {
  badge: string;
  title: string;
  description: string;
}) => (
  <div className="max-w-3xl">
    <div className="inline-flex rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-[#00aeef]">
      {badge}
    </div>

    <h2 className="mt-5 text-4xl font-bold tracking-tight text-zinc-900">
      {title}
    </h2>

    <p className="mt-5 text-lg leading-8 text-zinc-600">
      {description}
    </p>
  </div>
);

const FeatureCard = ({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) => (
  <div className="group rounded-3xl border border-zinc-100 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-[#00aeef]">
      ✦
    </div>

    <h3 className="mt-6 text-xl font-semibold">{title}</h3>

    <p className="mt-3 leading-7 text-zinc-600">{desc}</p>
  </div>
);

const InfoCard = ({
  title,
  desc,
  icon,
}: {
  title: string;
  desc: string;
  icon: React.ReactNode;
}) => (
  <div className="rounded-3xl border border-zinc-100 bg-white p-8 shadow-sm">
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50">
      {icon}
    </div>

    <h3 className="mt-6 text-xl font-semibold text-zinc-900">{title}</h3>

    <p className="mt-3 leading-7 text-zinc-600">{desc}</p>
  </div>
);

const Benefit = ({ text }: { text: string }) => (
  <div className="flex items-start gap-3">
    <CheckCircle2
      size={20}
      className="mt-1 min-w-[20px] text-[#00aeef]"
    />

    <p className="text-zinc-600 leading-7">{text}</p>
  </div>
);