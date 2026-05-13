"use client";

import React from "react";
import Header from "@/app/(public)/_components/header/Header";
import Footer from "@/app/components/Footer";
import { ArrowRight, Target, Users, Globe, Code, School } from "lucide-react";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 selection:bg-sky-100 selection:text-[#00aeef]">
      <main>
        {/* Section 1: Hero / The Mission */}
        <section className="relative py-32 sm:py-48 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(0,174,239,0.03)_0%,_transparent_70%)]" />
          <div className="container mx-auto px-8 lg:px-12 relative">
            <div className="max-w-3xl">
              <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-[#00aeef] mb-8">
                the gadvance narrative
              </h2>
              <h1 className="text-4xl md:text-7xl font-light tracking-tight text-zinc-900 leading-[1.1]">
                bridging the gap <br />
                <span className="font-semibold italic font-serif text-[#00aeef]">in gender leadership.</span>
              </h1>
              <p className="mt-12 text-xl md:text-2xl text-zinc-500 font-light leading-relaxed lowercase">
                gadvance emerged from an urgent need to address the structural disparities 
                that limit professional mobility. we catalyze gender advancement by 
                deploying specialized digital education designed to dismantle systemic barriers.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Institutional Heritage (LSPU Section) */}
        <section className="py-24 bg-zinc-50 border-y border-zinc-100">
          <div className="container mx-auto px-8 lg:px-12">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex gap-4 shrink-0">
                <div className="h-24 w-24 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center p-4 grayscale opacity-70">
                   <span className="text-[10px] text-zinc-400 uppercase text-center font-bold">gadvance logo</span>
                </div>
                <div className="h-24 w-24 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center p-4 grayscale opacity-70">
                   <span className="text-[10px] text-zinc-400 uppercase text-center font-bold">lspu octa logo</span>
                </div>
              </div>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400 mb-4">the academic foundation</h2>
                <p className="text-lg text-zinc-600 font-light leading-relaxed">
                  pioneered by the researchers at the <span className="font-semibold text-zinc-800">college of computer studies</span> within <span className="font-semibold text-zinc-800">laguna state polytechnic university – san pablo city campus</span>, gadvance synthesizes technological innovation with the urgent pursuit of workplace equity.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Pillars of Advancement */}
        <section className="py-32 bg-white">
          <div className="container mx-auto px-8 lg:px-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              <ValueItem 
                icon={<Target size={24} strokeWidth={1.5} />}
                title="strategic advocacy"
                desc="to modernize corporate culture by equipping marginalized genders with the leadership competencies required for high-level decision making."
              />
              <ValueItem 
                icon={<Code size={24} strokeWidth={1.5} />}
                title="innovation for equity"
                desc="leveraging digital infrastructure built at lspu san pablo to create accessible, data-driven pathways for professional growth."
              />
              <ValueItem 
                icon={<Globe size={24} strokeWidth={1.5} />}
                title="cultural transformation"
                desc="we facilitate a paradigm shift in institutional dna, moving beyond compliance toward genuine belonging and equitable opportunity."
              />
            </div>
          </div>
        </section>

        {/* Section 4: The Roadmap to Inclusion */}
        <section className="py-32 sm:py-48 bg-zinc-50/30">
          <div className="container mx-auto px-8 lg:px-12">
            <div className="max-w-2xl mb-24">
              <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-[#00aeef] mb-8">
                advancement framework
              </h2>
              <h3 className="text-4xl md:text-5xl font-light tracking-tight text-zinc-900 leading-tight">
                a methodology for <span className="italic font-serif text-[#00aeef]">equitable progress.</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-16">
              <RoadmapItem phase="01" title="gap analysis" desc="diagnosing the specific cultural and structural frictions that hinder gender advancement in the local economy." />
              <RoadmapItem phase="02" title="empowerment curricula" desc="delivering targeted modules designed to amplify confidence, negotiation skills, and leadership readiness." />
              <RoadmapItem phase="03" title="institutional alignment" desc="working alongside organizations to integrate inclusive policies that foster gender-neutral talent pipelines." />
              <RoadmapItem phase="04" title="sustained equity" desc="monitoring long-term impact metrics to ensure that gender advancement remains a permanent organizational priority." />
            </div>
          </div>
        </section>

        {/* Section 5: The Creators */}
        <section className="py-32 bg-white border-t border-zinc-100">
          <div className="container mx-auto px-8 lg:px-12 text-center">
            <div className="inline-flex items-center gap-4 mb-12">
               <div className="h-px w-12 bg-zinc-200" />
               <School size={20} className="text-[#00aeef]" />
               <div className="h-px w-12 bg-zinc-200" />
            </div>
            <h2 className="text-2xl md:text-4xl font-light tracking-tight text-zinc-900 lowercase mb-8">
              engineered at <span className="text-[#00aeef] font-medium">lspu san pablo ccs</span>
            </h2>
            <p className="max-w-2xl mx-auto text-zinc-500 font-light lowercase leading-relaxed mb-12">
              gadvance stands as a testament to academic social responsibility. engineered by the college of computer studies, this project redefines how technology can be used to champion gender equity and social justice in the professional sphere.
            </p>
            <div className="flex justify-center gap-8">
               <div className="group border-b border-zinc-100 pb-2 transition-colors hover:border-[#00aeef]">
                 <p className="text-[10px] font-bold tracking-[0.4em] text-zinc-400 uppercase mb-2">connect with the team</p>
                 <p className="text-sm font-medium lowercase">gadvanceproject@gmail.com</p>
               </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

/* --- Sub-components --- */

const ValueItem = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
  <div className="flex flex-col space-y-6">
    <div className="h-12 w-12 rounded-2xl bg-white border border-zinc-100 shadow-sm flex items-center justify-center text-[#00aeef]">
      {icon}
    </div>
    <h4 className="text-xl font-semibold text-zinc-900 lowercase">{title}</h4>
    <p className="text-zinc-500 font-light leading-7 lowercase">{desc}</p>
  </div>
);

const RoadmapItem = ({ phase, title, desc }: { phase: string; title: string; desc: string }) => (
  <div className="flex flex-col border-t border-zinc-100 pt-10">
    <span className="text-[10px] font-bold tracking-[0.3em] text-zinc-400 mb-6 uppercase">phase {phase}</span>
    <h4 className="text-xl font-semibold text-zinc-900 lowercase">{title}</h4>
    <p className="mt-4 text-zinc-500 font-light leading-7 lowercase">{desc}</p>
  </div>
);

export default AboutPage;