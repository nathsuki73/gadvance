"use client";

import React from "react";
import { Users, Sparkles, MessageSquare, ArrowRight } from "lucide-react";

const CommunityPage = () => {
  return (
    <main className="min-h-screen bg-white font-sans text-zinc-900 selection:bg-sky-100 selection:text-[#00aeef]">
      
      {/* Section 1: Hero - Right Aligned starting section */}
      <section className="relative py-32 sm:py-48 overflow-hidden">
        {/* soft background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] bg-sky-50/40 rounded-full blur-[140px]" />
        
        <div className="container mx-auto px-8 lg:px-12 relative flex flex-col lg:flex-row-reverse items-center gap-20">
          
          {/* the starting text on the right side */}
          <div className="lg:w-1/2 text-center lg:text-left">
            <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-[#00aeef] mb-8">
              community
            </h2>
            <h1 className="text-4xl md:text-7xl font-light tracking-tight text-zinc-900 leading-[1.1]">
              growing <span className="font-semibold italic font-serif text-[#00aeef]">together.</span>
            </h1>
            <p className="mt-12 text-xl text-zinc-500 font-light leading-relaxed lowercase max-w-xl mx-auto lg:mx-0">
              gadvance is more than a learning platform; it is a collective of 
              forward-thinking leaders, students, and institutions committed 
              to dismantling gender barriers in the philippines.
            </p>
            <div className="mt-12 flex justify-center lg:justify-start">
              <button className="group flex items-center gap-3 rounded-full bg-[#00aeef] px-8 py-4 text-white transition-all hover:bg-[#0096ce] hover:shadow-lg hover:shadow-sky-100">
                <span className="font-medium lowercase">join the collective</span>
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* left side: Graphics Placeholder (Bunch of People) */}
          <div className="lg:w-1/2 w-full">
            <div className="aspect-square relative rounded-[40px] bg-zinc-50 border border-zinc-100 overflow-hidden flex items-center justify-center p-12">
               {/* placeholder for your "bunch of people" graphic */}
               <div className="flex flex-col items-center gap-4 text-zinc-300">
                  <Users size={84} strokeWidth={0.5} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-center italic">
                    [ insert bunch of people graphics here ]
                  </span>
               </div>
               
               {/* decorative floating card */}
               <div className="absolute bottom-10 right-10 bg-white p-6 rounded-2xl shadow-xl shadow-zinc-200/50 border border-zinc-50 animate-bounce-slow">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-[#00aeef]" />
                    <span className="text-xs font-bold text-zinc-800 lowercase">500+ active members</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Middle-aligned Features */}
      <section className="py-32 bg-zinc-50/50 border-y border-zinc-100">
        <div className="container mx-auto px-8 lg:px-12 text-center">
          <div className="max-w-3xl mx-auto mb-24">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400 mb-6">the network</h2>
            <h3 className="text-3xl md:text-5xl font-light tracking-tight text-zinc-900 lowercase">
              designed for <span className="italic font-serif text-[#00aeef]">collaborative advocacy.</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 items-start">
            <CommunityItem 
              icon={<Sparkles size={24} />}
              title="shared insights"
              desc="access a living library of localized case studies and peer-to-peer success stories from the filipino workplace."
            />
            <CommunityItem 
              icon={<MessageSquare size={24} />}
              title="monthly dialogues"
              desc="participate in exclusive live sessions with the experts and academic leads"
            />
            <CommunityItem 
              icon={<Users size={24} />}
              title="peer mentorship"
              desc="connect with fellow students and professionals who are navigating similar paths toward gender equity."
            />
          </div>
        </div>
      </section>

      {/* Section 3: Final Call to Collective (Centered) */}
      <section className="py-32 sm:py-56 bg-white">
        <div className="container mx-auto px-8 text-center max-w-4xl">
          <div className="inline-flex items-center gap-4 mb-12">
            <div className="h-px w-8 bg-zinc-200" />
            <Users size={20} className="text-[#00aeef]" />
            <div className="h-px w-8 bg-zinc-200" />
          </div>
          <h2 className="text-4xl md:text-6xl font-light tracking-tight text-zinc-900 leading-tight lowercase mb-12">
            your voice is the <span className="text-[#00aeef] font-medium">missing piece.</span>
          </h2>
          <p className="text-xl text-zinc-500 font-light lowercase leading-relaxed mb-12">
             gadvance is built on the shared experiences of its members. by joining, you contribute to a growing data-driven movement that informs our 2026 curriculum and institutional audits.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            
             <button className="rounded-full border border-zinc-200 px-10 py-5 text-zinc-600 transition-all hover:bg-zinc-50 lowercase font-medium">
               view guidelines
             </button>
          </div>
        </div>
      </section>
    </main>
  );
};

/* --- Sub-components --- */

const CommunityItem = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
  <div className="flex flex-col items-center space-y-6">
    <div className="h-14 w-14 rounded-full bg-white border border-zinc-100 shadow-sm flex items-center justify-center text-[#00aeef]">
      {icon}
    </div>
    <h4 className="text-xl font-semibold text-zinc-900 lowercase">{title}</h4>
    <p className="text-zinc-500 font-light leading-7 lowercase max-w-xs">{desc}</p>
  </div>
);

export default CommunityPage;